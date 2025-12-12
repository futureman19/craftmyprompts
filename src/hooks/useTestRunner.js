import { useState, useEffect } from 'react';

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState('simple'); // 'simple' | 'advanced'
    const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai' | 'battle' | 'refine' | 'swarm'
    const [refineView, setRefineView] = useState('timeline'); // 'timeline' | 'diff'

    // GitHub State
    const [showGithub, setShowGithub] = useState(false);
    const [codeToShip, setCodeToShip] = useState('');

    // Refine Config
    const [refineConfig, setRefineConfig] = useState({
        drafter: 'gemini',
        critiquer: 'openai',
        focus: 'general'
    });

    // --- SWARM CONFIG (Critical for Swarm Feature) ---
    const [swarmConfig, setSwarmConfig] = useState({
        agentA: 'gemini',
        roleA: 'Visionary CEO',
        agentB: 'openai',
        roleB: 'Pragmatic Engineer',
        rounds: 3
    });
    const [swarmHistory, setSwarmHistory] = useState([]);

    // Keys
    const [geminiKey, setGeminiKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');

    // Execution State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [battleResults, setBattleResults] = useState(null);
    const [refineSteps, setRefineSteps] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);

    // Models
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);

    // --- INITIALIZATION ---
    useEffect(() => {
        // Load Keys (Prioritize Props, Fallback to LocalStorage)
        if (defaultApiKey) {
            setGeminiKey(defaultApiKey);
        } else {
            const saved = localStorage.getItem('craft_my_prompt_gemini_key');
            if (saved) setGeminiKey(saved);
        }

        if (defaultOpenAIKey) {
            setOpenaiKey(defaultOpenAIKey);
        } else {
            const saved = localStorage.getItem('craft_my_prompt_openai_key');
            if (saved) setOpenaiKey(saved);
        }
    }, [defaultApiKey, defaultOpenAIKey]);

    // Auto-Fetch Gemini Models
    useEffect(() => {
        if (geminiKey) fetchModels(geminiKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geminiKey]);

    // --- HELPERS ---
    const saveKey = (key, providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        const defaultKey = providerName === 'gemini' ? defaultApiKey : defaultOpenAIKey;
        if (key && key.trim() && key !== defaultKey) {
            localStorage.setItem(storageKey, key.trim());
        }
    };

    const clearKey = (providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        localStorage.removeItem(storageKey);
        if (providerName === 'gemini') setGeminiKey('');
        else setOpenaiKey('');
    };

    const handleShipCode = (code) => {
        setCodeToShip(code);
        setShowGithub(true);
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        if (mode === 'simple') setProvider('gemini');
        if (mode === 'advanced') setProvider('battle');
    };

    // --- API ACTIONS ---
    const fetchModels = async (keyToUse = geminiKey) => {
        if (!keyToUse) return;
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: keyToUse,
                    endpoint: 'listModels'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Model fetch error:", data.error);
                return;
            }

            if (data.models) {
                const validModels = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
                setAvailableModels(validModels);
                // Auto-Select Logic
                const currentExists = validModels.find(m => m.name === selectedModel);
                if (!selectedModel || !currentExists) {
                    const bestModel = validModels.find(m => m.name.includes('2.0-flash'))
                        || validModels.find(m => m.name.includes('flash'))
                        || validModels[0];
                    if (bestModel) setSelectedModel(bestModel.name);
                }
            }
        } catch (err) {
            console.error("Failed to fetch models", err);
        }
    };

    const callAIProvider = async (providerName, promptText, key) => {
        if (providerName === 'gemini') return await callGemini(promptText, key, selectedModel);
        else return await callOpenAI(promptText, key);
    };

    const callGemini = async (promptText, key, model) => {
        const targetModel = model || 'models/gemini-1.5-flash';
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: key,
                prompt: promptText,
                model: targetModel
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Gemini Error (${response.status})`);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "No text returned from Gemini.";
    };

    const callOpenAI = async (promptText, key) => {
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key, prompt: promptText, model: "gpt-4o" })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `OpenAI Error (${response.status})`);
        return data.choices?.[0]?.message?.content || "No text returned.";
    };

    // --- MAIN RUN HANDLER ---
    const runTest = async (prompt) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setBattleResults(null);
        setRefineSteps(null);
        setSwarmHistory([]);
        setStatusMessage('');

        try {
            if (provider === 'swarm') {
                if (swarmConfig.agentA === 'gemini' && !geminiKey) throw new Error("Gemini Key missing for Agent A");
                if (swarmConfig.agentA === 'openai' && !openaiKey) throw new Error("OpenAI Key missing for Agent A");
                if (swarmConfig.agentB === 'gemini' && !geminiKey) throw new Error("Gemini Key missing for Agent B");
                if (swarmConfig.agentB === 'openai' && !openaiKey) throw new Error("OpenAI Key missing for Agent B");

                if (geminiKey) saveKey(geminiKey, 'gemini');
                if (openaiKey) saveKey(openaiKey, 'openai');

                let currentHistory = [];

                for (let i = 0; i < swarmConfig.rounds; i++) {
                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleA} is speaking...`);
                    
                    const contextA = `
                        You are participating in a roundtable discussion.
                        TOPIC/PROBLEM: "${prompt}"
                        YOUR ROLE: ${swarmConfig.roleA}
                        OTHER ATTENDEE: ${swarmConfig.roleB}
                        
                        TRANSCRIPT SO FAR:
                        ${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                        
                        INSTRUCTION: Provide your next response, argument, or insight based on your role. Be concise (under 100 words).
                    `;
                    const keyA = swarmConfig.agentA === 'gemini' ? geminiKey : openaiKey;
                    const responseA = await callAIProvider(swarmConfig.agentA, contextA, keyA);
                    currentHistory.push({ speaker: 'A', role: swarmConfig.roleA, text: responseA, provider: swarmConfig.agentA });
                    setSwarmHistory([...currentHistory]);

                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleB} is responding...`);
                    const contextB = `
                        You are participating in a roundtable discussion.
                        TOPIC/PROBLEM: "${prompt}"
                        YOUR ROLE: ${swarmConfig.roleB}
                        OTHER ATTENDEE: ${swarmConfig.roleA}
                        
                        TRANSCRIPT SO FAR:
                        ${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                        
                        INSTRUCTION: Respond to the previous point, offering a different perspective or refinement based on your role. Be concise (under 100 words).
                    `;
                    const keyB = swarmConfig.agentB === 'gemini' ? geminiKey : openaiKey;
                    const responseB = await callAIProvider(swarmConfig.agentB, contextB, keyB);
                    currentHistory.push({ speaker: 'B', role: swarmConfig.roleB, text: responseB, provider: swarmConfig.agentB });
                    setSwarmHistory([...currentHistory]);
                }
                setStatusMessage('Meeting adjourned.');

            } else if (provider === 'refine') {
                if (refineConfig.drafter === 'gemini' && !geminiKey) throw new Error("Gemini API Key missing for Drafter.");
                if (refineConfig.drafter === 'openai' && !openaiKey) throw new Error("OpenAI API Key missing for Drafter.");
                if (refineConfig.critiquer === 'gemini' && !geminiKey) throw new Error("Gemini API Key missing for Critiquer.");
                if (refineConfig.critiquer === 'openai' && !openaiKey) throw new Error("OpenAI API Key missing for Critiquer.");

                if (geminiKey) saveKey(geminiKey, 'gemini');
                if (openaiKey) saveKey(openaiKey, 'openai');

                const drafterName = refineConfig.drafter === 'gemini' ? 'Gemini' : 'ChatGPT';
                setStatusMessage(`Step 1/3: ${drafterName} is drafting...`);
                const drafterKey = refineConfig.drafter === 'gemini' ? geminiKey : openaiKey;
                const draft = await callAIProvider(refineConfig.drafter, prompt, drafterKey);
                setRefineSteps({ draft, critique: null, final: null });

                const critiquerName = refineConfig.critiquer === 'gemini' ? 'Gemini' : 'ChatGPT';
                setStatusMessage(`Step 2/3: ${critiquerName} is critiquing...`);
                const critiquerKey = refineConfig.critiquer === 'gemini' ? geminiKey : openaiKey;
                const critiquePrompt = `Act as a Senior Technical Lead specialized in ${refineConfig.focus}. Review the following. List 3 improvements.\n\nINPUT:\n${draft}`;
                const critique = await callAIProvider(refineConfig.critiquer, critiquePrompt, critiquerKey);
                setRefineSteps({ draft, critique, final: null });

                setStatusMessage(`Step 3/3: ${drafterName} is polishing...`);
                const polishPrompt = `Rewrite the original input to address the critique points.\n\nORIGINAL:\n${draft}\n\nCRITIQUE:\n${critique}`;
                const final = await callAIProvider(refineConfig.drafter, polishPrompt, drafterKey);
                setRefineSteps({ draft, critique, final });
                setResult(final);

            } else if (provider === 'battle') {
                if (!geminiKey || !openaiKey) throw new Error("Both API Keys are required.");
                saveKey(geminiKey, 'gemini'); saveKey(openaiKey, 'openai');
                setStatusMessage('Fighting...');
                
                const [geminiRes, openaiRes] = await Promise.allSettled([
                    callGemini(prompt, geminiKey, selectedModel),
                    callOpenAI(prompt, openaiKey)
                ]);
                
                setBattleResults({
                    gemini: geminiRes.status === 'fulfilled' ? geminiRes.value : `Error: ${geminiRes.reason.message}`,
                    openai: openaiRes.status === 'fulfilled' ? openaiRes.value : `Error: ${openaiRes.reason.message}`
                });

            } else if (provider === 'gemini') {
                if (!geminiKey) throw new Error("Gemini Key missing.");
                saveKey(geminiKey, 'gemini');
                setStatusMessage('Gemini is thinking...');
                const text = await callGemini(prompt, geminiKey, selectedModel);
                setResult(text);

            } else if (provider === 'openai') {
                if (!openaiKey) throw new Error("OpenAI Key missing.");
                saveKey(openaiKey, 'openai');
                setStatusMessage('ChatGPT is thinking...');
                const text = await callOpenAI(prompt, openaiKey);
                setResult(text);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    return {
        viewMode, provider, refineView, showGithub, codeToShip, refineConfig, swarmConfig, swarmHistory,
        geminiKey, openaiKey, loading, result, battleResults, refineSteps, statusMessage, error, selectedModel, availableModels,
        setGeminiKey, setOpenaiKey, setProvider, setRefineView, setShowGithub, setRefineConfig, setSwarmConfig, setSelectedModel,
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange
    };
};