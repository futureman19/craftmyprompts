import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase'; // <--- Import Auth

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState('simple'); // 'simple' | 'advanced'
    const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai' | 'groq' | 'anthropic' | 'battle' | 'refine' | 'swarm'
    const [refineView, setRefineView] = useState('timeline'); // 'timeline' | 'diff'
    
    // Auth State (Self-Aware)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const [groqKey, setGroqKey] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');

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
        // 1. Check Auth Status
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user && user.uid !== 'demo');
        });

        // 2. Load Keys
        if (defaultApiKey) setGeminiKey(defaultApiKey);
        else setGeminiKey(localStorage.getItem('craft_my_prompt_gemini_key') || '');

        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('craft_my_prompt_openai_key') || '');

        setGroqKey(localStorage.getItem('craft_my_prompt_groq_key') || '');
        setAnthropicKey(localStorage.getItem('craft_my_prompt_anthropic_key') || '');
        
        return () => unsubscribe();
    }, [defaultApiKey, defaultOpenAIKey]);

    // Auto-Fetch Gemini Models
    useEffect(() => {
        if (geminiKey) fetchModels(geminiKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geminiKey]);

    // --- HELPERS ---
    const saveKey = (key, providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        // Don't save empty keys
        if (key && key.trim()) {
            // For Gemini/OpenAI, check against defaults if needed, but simple overwrite is usually fine for local storage
            if ((providerName === 'gemini' && key === defaultApiKey) || (providerName === 'openai' && key === defaultOpenAIKey)) {
                return;
            }
            localStorage.setItem(storageKey, key.trim());
        }
    };

    const clearKey = (providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        localStorage.removeItem(storageKey);
        if (providerName === 'gemini') setGeminiKey('');
        else if (providerName === 'openai') setOpenaiKey('');
        else if (providerName === 'groq') setGroqKey('');
        else if (providerName === 'anthropic') setAnthropicKey('');
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

    const getKeyForProvider = (prov) => {
        switch (prov) {
            case 'gemini': return geminiKey;
            case 'openai': return openaiKey;
            case 'groq': return groqKey;
            case 'anthropic': return anthropicKey;
            default: return '';
        }
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
            if (!response.ok) { console.error("Model fetch error:", data.error); return; }

            if (data.models) {
                // CTO UPDATE: Curated Model List
                const PREFERRED_KEYWORDS = ['1.5', '2.0', 'flash', 'pro'];
                
                const validModels = data.models
                    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                    .filter(m => {
                         const name = m.name.toLowerCase();
                         return PREFERRED_KEYWORDS.some(k => name.includes(k)) && !name.includes('vision');
                    })
                    .sort((a, b) => {
                        const verA = a.name.includes('2.0') ? 2 : 1;
                        const verB = b.name.includes('2.0') ? 2 : 1;
                        return verB - verA;
                    });

                setAvailableModels(validModels);
                
                const currentExists = validModels.find(m => m.name === selectedModel);
                if (!selectedModel || !currentExists) {
                    if (validModels.length > 0) setSelectedModel(validModels[0].name);
                }
            }
        } catch (err) { console.error("Failed to fetch models", err); }
    };

    const callAIProvider = async (providerName, promptText, key) => {
        if (providerName === 'gemini') return await callGemini(promptText, key, selectedModel);
        if (providerName === 'openai') return await callOpenAI(promptText, key);
        if (providerName === 'groq') return await callGroq(promptText, key);
        if (providerName === 'anthropic') return await callAnthropic(promptText, key);
        throw new Error(`Unknown provider: ${providerName}`);
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

    const callGroq = async (promptText, key) => {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key, prompt: promptText, model: "llama3-70b-8192" }) // Default high-perf model
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Groq Error (${response.status})`);
        return data.choices?.[0]?.message?.content || "No text returned.";
    };

    const callAnthropic = async (promptText, key) => {
        const response = await fetch('/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key, prompt: promptText, model: "claude-3-5-sonnet-20240620" }) // Default Sonnet 3.5
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Anthropic Error (${response.status})`);
        return data.content?.[0]?.text || "No text returned.";
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
            // Save keys first
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');
            if (groqKey) saveKey(groqKey, 'groq');
            if (anthropicKey) saveKey(anthropicKey, 'anthropic');

            if (provider === 'swarm') {
                if (!getKeyForProvider(swarmConfig.agentA)) throw new Error(`API Key missing for ${swarmConfig.agentA}`);
                if (!getKeyForProvider(swarmConfig.agentB)) throw new Error(`API Key missing for ${swarmConfig.agentB}`);

                let currentHistory = [];
                for (let i = 0; i < swarmConfig.rounds; i++) {
                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleA} (${swarmConfig.agentA}) is speaking...`);
                    const contextA = `ROUNDTABLE DISCUSSION.\nTOPIC: "${prompt}"\nYOUR ROLE: ${swarmConfig.roleA}\nTRANSCRIPT:\n${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Provide your next response. Be concise.`;
                    const resA = await callAIProvider(swarmConfig.agentA, contextA, getKeyForProvider(swarmConfig.agentA));
                    currentHistory.push({ speaker: 'A', role: swarmConfig.roleA, text: resA, provider: swarmConfig.agentA });
                    setSwarmHistory([...currentHistory]);

                    setStatusMessage(`Round ${i+1}: ${swarmConfig.roleB} (${swarmConfig.agentB}) is responding...`);
                    const contextB = `ROUNDTABLE DISCUSSION.\nTOPIC: "${prompt}"\nYOUR ROLE: ${swarmConfig.roleB}\nTRANSCRIPT:\n${currentHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Respond to the previous point. Be concise.`;
                    const resB = await callAIProvider(swarmConfig.agentB, contextB, getKeyForProvider(swarmConfig.agentB));
                    currentHistory.push({ speaker: 'B', role: swarmConfig.roleB, text: resB, provider: swarmConfig.agentB });
                    setSwarmHistory([...currentHistory]);
                }
                setStatusMessage('Meeting adjourned.');

            } else if (provider === 'refine') {
                if (!getKeyForProvider(refineConfig.drafter)) throw new Error(`API Key missing for Drafter (${refineConfig.drafter})`);
                if (!getKeyForProvider(refineConfig.critiquer)) throw new Error(`API Key missing for Critiquer (${refineConfig.critiquer})`);

                setStatusMessage(`Drafting with ${refineConfig.drafter}...`);
                const draft = await callAIProvider(refineConfig.drafter, prompt, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft, critique: null, final: null });

                setStatusMessage(`Critiquing with ${refineConfig.critiquer}...`);
                const critPrompt = `Act as a Senior Lead specialized in ${refineConfig.focus}. Critique this:\n${draft}`;
                const critique = await callAIProvider(refineConfig.critiquer, critPrompt, getKeyForProvider(refineConfig.critiquer));
                setRefineSteps({ draft, critique, final: null });

                setStatusMessage(`Polishing with ${refineConfig.drafter}...`);
                const polPrompt = `Rewrite based on critique:\nOriginal: ${draft}\nCritique: ${critique}`;
                const final = await callAIProvider(refineConfig.drafter, polPrompt, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft, critique, final });
                setResult(final);

            } else if (provider === 'battle') {
                if (!geminiKey || !openaiKey) throw new Error("Gemini & OpenAI Keys required for Battle.");
                setStatusMessage('Fighting...');
                const [geminiRes, openaiRes] = await Promise.allSettled([
                    callGemini(prompt, geminiKey, selectedModel),
                    callOpenAI(prompt, openaiKey)
                ]);
                setBattleResults({
                    gemini: geminiRes.status === 'fulfilled' ? geminiRes.value : `Error: ${geminiRes.reason.message}`,
                    openai: openaiRes.status === 'fulfilled' ? openaiRes.value : `Error: ${openaiRes.reason.message}`
                });

            } else {
                // Single Provider Run
                const key = getKeyForProvider(provider);
                if (!key) throw new Error(`${provider} API Key is missing.`);
                
                setStatusMessage(`${provider} is thinking...`);
                const text = await callAIProvider(provider, prompt, key);
                setResult(text);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // --- NEW: CONTINUE/COMPILE SWARM ---
    const continueSwarm = async (currentPrompt) => {
        if (!getKeyForProvider(swarmConfig.agentA) || !getKeyForProvider(swarmConfig.agentB)) return;
        setLoading(true);
        setStatusMessage('Continuing the meeting...');

        try {
            let updatedHistory = [...swarmHistory];
            // Agent A
            setStatusMessage(`Extra Round: ${swarmConfig.roleA} is speaking...`);
            const contextA = `CONTINUING DISCUSSION.\nTOPIC: "${currentPrompt}"\nYOUR ROLE: ${swarmConfig.roleA}\nTRANSCRIPT:\n${updatedHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Continue.`;
            const resA = await callAIProvider(swarmConfig.agentA, contextA, getKeyForProvider(swarmConfig.agentA));
            updatedHistory.push({ speaker: 'A', role: swarmConfig.roleA, text: resA, provider: swarmConfig.agentA });
            setSwarmHistory([...updatedHistory]);
            
            const contextB = `CONTINUING DISCUSSION.\nTOPIC: "${currentPrompt}"\nYOUR ROLE: ${swarmConfig.roleB}\nTRANSCRIPT:\n${updatedHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Respond.`;
            const resB = await callAIProvider(swarmConfig.agentB, contextB, getKeyForProvider(swarmConfig.agentB));
            updatedHistory.push({ speaker: 'B', role: swarmConfig.roleB, text: resB, provider: swarmConfig.agentB });
            setSwarmHistory([...updatedHistory]);
        } catch (err) { setError(err.message); } finally { setLoading(false); setStatusMessage(''); }
    };

    const compileSwarmCode = async () => {
        const compilerKey = openaiKey || geminiKey; // Prefer OpenAI for compilation, fallback to Gemini
        const compilerProvider = openaiKey ? 'openai' : 'gemini';
        
        if (!compilerKey) { setError("No API Key available for compilation."); return; }
        
        setLoading(true);
        setStatusMessage('Compiling final code...');
        try {
            const transcript = swarmHistory.map(m => `${m.role}: ${m.text}`).join('\n\n');
            const prompt = `You are the CTO. Read this transcript. Output the FINAL, PRODUCTION-READY CODE based on the discussion.\n\nTRANSCRIPT:\n${transcript}`;
            const compiled = await callAIProvider(compilerProvider, prompt, compilerKey);
            setSwarmHistory(prev => [...prev, { speaker: 'System', role: 'CTO (Compiler)', text: compiled, provider: compilerProvider, isCompiled: true }]);
        } catch (err) { setError(err.message); } finally { setLoading(false); setStatusMessage(''); }
    };

    return {
        viewMode, provider, refineView, showGithub, codeToShip, refineConfig, swarmConfig, swarmHistory,
        geminiKey, openaiKey, groqKey, anthropicKey, // Export new keys
        loading, result, battleResults, refineSteps, statusMessage, error, selectedModel, availableModels,
        
        setGeminiKey, setOpenaiKey, setGroqKey, setAnthropicKey, // Export new setters
        setProvider, setRefineView, setShowGithub, setRefineConfig, setSwarmConfig, setSelectedModel,
        
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange, continueSwarm, compileSwarmCode,
        isLoggedIn // <--- EXPORTED AUTH STATE
    };
};