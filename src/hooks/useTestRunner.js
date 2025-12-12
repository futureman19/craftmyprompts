import { useState, useEffect } from 'react';

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState('simple'); 
    const [provider, setProvider] = useState('gemini'); 
    const [refineView, setRefineView] = useState('timeline'); 

    // GitHub State
    const [showGithub, setShowGithub] = useState(false);
    const [codeToShip, setCodeToShip] = useState('');

    // Refine Config
    const [refineConfig, setRefineConfig] = useState({
        drafter: 'gemini',
        critiquer: 'openai',
        focus: 'general'
    });

    // Swarm Config
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
        if (defaultApiKey) setGeminiKey(defaultApiKey);
        else setGeminiKey(localStorage.getItem('craft_my_prompt_gemini_key') || '');

        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('craft_my_prompt_openai_key') || '');
    }, [defaultApiKey, defaultOpenAIKey]);

    useEffect(() => {
        if (geminiKey) fetchModels(geminiKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geminiKey]);

    // --- HELPERS ---
    const saveKey = (key, providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        const defaultKey = providerName === 'gemini' ? defaultApiKey : defaultOpenAIKey;
        if (key && key.trim() && key !== defaultKey) localStorage.setItem(storageKey, key.trim());
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
                body: JSON.stringify({ apiKey: keyToUse, endpoint: 'listModels' })
            });
            const data = await response.json();
            if (!response.ok) return;

            if (data.models) {
                const validModels = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
                setAvailableModels(validModels);
                const currentExists = validModels.find(m => m.name === selectedModel);
                if (!selectedModel || !currentExists) {
                    const bestModel = validModels.find(m => m.name.includes('2.0-flash')) || validModels.find(m => m.name.includes('flash')) || validModels[0];
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
            body: JSON.stringify({ apiKey: key, prompt: promptText, model: targetModel })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Gemini Error (${response.status})`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned.";
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

    // --- NEW: CONTINUE SWARM ---
    const continueSwarm = async (currentPrompt) => {
        if (!geminiKey || !openaiKey) return;
        setLoading(true);
        setStatusMessage('Continuing the meeting...');

        try {
            // We just run 1 extra round
            const i = swarmHistory.length / 2 + 1;
            let updatedHistory = [...swarmHistory];

            // Agent A
            setStatusMessage(`Extra Round: ${swarmConfig.roleA} is speaking...`);
            const contextA = `
                CONTINUING DISCUSSION.
                TOPIC: "${currentPrompt}"
                YOUR ROLE: ${swarmConfig.roleA}
                OTHER ATTENDEE: ${swarmConfig.roleB}
                TRANSCRIPT: ${updatedHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                INSTRUCTION: Provide your next response. Keep it concise.
            `;
            const keyA = swarmConfig.agentA === 'gemini' ? geminiKey : openaiKey;
            const responseA = await callAIProvider(swarmConfig.agentA, contextA, keyA);
            updatedHistory.push({ speaker: 'A', role: swarmConfig.roleA, text: responseA, provider: swarmConfig.agentA });
            setSwarmHistory([...updatedHistory]);

            // Agent B
            setStatusMessage(`Extra Round: ${swarmConfig.roleB} is responding...`);
            const contextB = `
                CONTINUING DISCUSSION.
                TOPIC: "${currentPrompt}"
                YOUR ROLE: ${swarmConfig.roleB}
                OTHER ATTENDEE: ${swarmConfig.roleA}
                TRANSCRIPT: ${updatedHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                INSTRUCTION: Respond to the previous point. Keep it concise.
            `;
            const keyB = swarmConfig.agentB === 'gemini' ? geminiKey : openaiKey;
            const responseB = await callAIProvider(swarmConfig.agentB, contextB, keyB);
            updatedHistory.push({ speaker: 'B', role: swarmConfig.roleB, text: responseB, provider: swarmConfig.agentB });
            setSwarmHistory([...updatedHistory]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // --- NEW: COMPILE SWARM ---
    const compileSwarmCode = async () => {
        if (!openaiKey) {
            setError("OpenAI Key required to compile.");
            return;
        }
        setLoading(true);
        setStatusMessage('Compiling final code from meeting notes...');

        try {
            const transcript = swarmHistory.map(m => `${m.role}: ${m.text}`).join('\n\n');
            const prompt = `
                You are the CTO. Read the following meeting transcript between ${swarmConfig.roleA} and ${swarmConfig.roleB}.
                They have discussed a solution.
                
                YOUR TASK: Output the FINAL, PRODUCTION-READY CODE based on their discussion.
                - Do not include chatter.
                - Just output the code block (and a brief explanation if necessary).
                
                TRANSCRIPT:
                ${transcript}
            `;
            
            const compiled = await callOpenAI(prompt, openaiKey);
            
            // Add the compiled result as a special system message to the history
            setSwarmHistory(prev => [...prev, { 
                speaker: 'System', 
                role: 'CTO (Compiler)', 
                text: compiled, 
                provider: 'openai',
                isCompiled: true 
            }]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
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
                if (!geminiKey || !openaiKey) throw new Error("Both Keys required for Swarm.");
                saveKey(geminiKey, 'gemini'); saveKey(openaiKey, 'openai');

                let currentHistory = [];

                for (let i = 0; i < swarmConfig.rounds; i++) {
                    // Agent A
                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleA} is speaking...`);
                    const contextA = `
                        You are participating in a roundtable discussion.
                        TOPIC: "${prompt}"
                        YOUR ROLE: ${swarmConfig.roleA}
                        OTHER ATTENDEE: ${swarmConfig.roleB}
                        TRANSCRIPT: ${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                        INSTRUCTION: Provide your next response based on your role. Be concise (under 100 words).
                    `;
                    const keyA = swarmConfig.agentA === 'gemini' ? geminiKey : openaiKey;
                    const responseA = await callAIProvider(swarmConfig.agentA, contextA, keyA);
                    currentHistory.push({ speaker: 'A', role: swarmConfig.roleA, text: responseA, provider: swarmConfig.agentA });
                    setSwarmHistory([...currentHistory]);

                    // Agent B
                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleB} is responding...`);
                    const contextB = `
                        You are participating in a roundtable discussion.
                        TOPIC: "${prompt}"
                        YOUR ROLE: ${swarmConfig.roleB}
                        OTHER ATTENDEE: ${swarmConfig.roleA}
                        TRANSCRIPT: ${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
                        INSTRUCTION: Respond to the previous point based on your role. Be concise (under 100 words).
                    `;
                    const keyB = swarmConfig.agentB === 'gemini' ? geminiKey : openaiKey;
                    const responseB = await callAIProvider(swarmConfig.agentB, contextB, keyB);
                    currentHistory.push({ speaker: 'B', role: swarmConfig.roleB, text: responseB, provider: swarmConfig.agentB });
                    setSwarmHistory([...currentHistory]);
                }
                setStatusMessage('Meeting adjourned.');

            } else if (provider === 'refine') {
               // ... (Refine Logic kept same as before, simplified for brevity in this display but included in full code)
               if (!geminiKey || !openaiKey) throw new Error("Both keys required.");
               saveKey(geminiKey, 'gemini'); saveKey(openaiKey, 'openai');
               
               setStatusMessage('Drafting...');
               const draft = await callAIProvider(refineConfig.drafter, prompt, refineConfig.drafter === 'gemini' ? geminiKey : openaiKey);
               setRefineSteps({ draft, critique: null, final: null });
               
               setStatusMessage('Critiquing...');
               const critPrompt = `Act as a Senior Lead. Critique this:\n${draft}`;
               const critique = await callAIProvider(refineConfig.critiquer, critPrompt, refineConfig.critiquer === 'gemini' ? geminiKey : openaiKey);
               setRefineSteps({ draft, critique, final: null });
               
               setStatusMessage('Polishing...');
               const polPrompt = `Rewrite based on critique:\nOriginal: ${draft}\nCritique: ${critique}`;
               const final = await callAIProvider(refineConfig.drafter, polPrompt, refineConfig.drafter === 'gemini' ? geminiKey : openaiKey);
               setRefineSteps({ draft, critique, final });
               setResult(final);

            } else if (provider === 'battle') {
                if (!geminiKey || !openaiKey) throw new Error("Both Keys required.");
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
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange,
        continueSwarm, compileSwarmCode // <--- EXPORTED NEW FUNCTIONS
    };
};