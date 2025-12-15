import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase.js';

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState('simple'); 
    const [provider, setProvider] = useState('gemini'); 
    const [refineView, setRefineView] = useState('timeline'); 
    
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // GitHub State
    const [showGithub, setShowGithub] = useState(false);
    const [codeToShip, setCodeToShip] = useState('');
    const [githubToken, setGithubToken] = useState(''); // New State

    // --- CONFIGURATIONS ---
    const [battleConfig, setBattleConfig] = useState({
        fighterA: 'gemini',
        fighterB: 'openai'
    });

    const [refineConfig, setRefineConfig] = useState({
        drafter: 'gemini',
        critiquer: 'openai',
        focus: 'general'
    });

    // Dynamic Agents Array (Replaces hardcoded agentA/B)
    const [swarmConfig, setSwarmConfig] = useState({
        rounds: 3,
        agents: [
            { id: '1', provider: 'gemini', role: 'Visionary CEO' },
            { id: '2', provider: 'openai', role: 'Pragmatic Engineer' }
        ]
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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user && user.uid !== 'demo');
        });

        if (defaultApiKey) setGeminiKey(defaultApiKey);
        else setGeminiKey(localStorage.getItem('craft_my_prompt_gemini_key') || '');

        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('craft_my_prompt_openai_key') || '');

        setGroqKey(localStorage.getItem('craft_my_prompt_groq_key') || '');
        setAnthropicKey(localStorage.getItem('craft_my_prompt_anthropic_key') || '');
        setGithubToken(localStorage.getItem('craft_my_prompt_github_key') || ''); // Load GitHub Token

        return () => unsubscribe();
    }, [defaultApiKey, defaultOpenAIKey]);

    useEffect(() => { if (geminiKey) fetchModels(geminiKey); }, [geminiKey]);

    // --- HELPERS ---
    const saveKey = (key, providerName) => {
        const storageKey = `craft_my_prompt_${providerName}_key`;
        if (key && key.trim()) {
             if ((providerName === 'gemini' && key === defaultApiKey) || (providerName === 'openai' && key === defaultOpenAIKey)) return;
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
        else if (providerName === 'github') setGithubToken('');
    };

    const handleShipCode = (code) => { setCodeToShip(code); setShowGithub(true); };
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

    // --- AGENT MANAGEMENT HANDLERS ---
    const addSwarmAgent = () => {
        if (swarmConfig.agents.length >= 4) return;
        setSwarmConfig(prev => ({
            ...prev,
            agents: [...prev.agents, { id: Date.now().toString(), provider: 'gemini', role: 'New Specialist' }]
        }));
    };

    const removeSwarmAgent = (id) => {
        if (swarmConfig.agents.length <= 2) return;
        setSwarmConfig(prev => ({
            ...prev,
            agents: prev.agents.filter(a => a.id !== id)
        }));
    };

    const updateSwarmAgent = (id, field, value) => {
        setSwarmConfig(prev => ({
            ...prev,
            agents: prev.agents.map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
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

    // --- NEW: SHIP TO GITHUB ---
    const shipToGithub = async (token, filename, description, isPublic) => {
        if (!token) throw new Error("GitHub Token is required.");
        
        // Save token locally for convenience
        saveKey(token, 'github');
        setGithubToken(token);

        const payload = {
            description: description || "Snippet from CraftMyPrompt",
            public: isPublic,
            files: {
                [filename || 'snippet.txt']: {
                    content: codeToShip
                }
            }
        };

        const response = await fetch('/api/github', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token, 
                action: 'create_gist', 
                payload: payload 
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to ship to GitHub.");
        return data.html_url; // Return the URL of the new Gist
    };

    const callAIProvider = async (name, text, key) => {
        const body = { apiKey: key, prompt: text };
        if (name === 'gemini') body.model = selectedModel || 'models/gemini-1.5-flash';
        if (name === 'openai') body.model = 'gpt-4o';
        if (name === 'groq') body.model = 'llama-3.3-70b-versatile';
        if (name === 'anthropic') body.model = 'claude-3-5-sonnet-latest';
        
        const res = await fetch(`/api/${name}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.error || 'API Error');
        
        if (name === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (name === 'openai') return data.choices?.[0]?.message?.content;
        if (name === 'groq') return data.choices?.[0]?.message?.content;
        if (name === 'anthropic') return data.content?.[0]?.text;
        return "No response.";
    };

    const runTest = async (prompt) => {
        setLoading(true); setError(null); setResult(null); setBattleResults(null); setRefineSteps(null); setSwarmHistory([]);
        try {
            // Save keys dynamically
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');
            if (groqKey) saveKey(groqKey, 'groq');
            if (anthropicKey) saveKey(anthropicKey, 'anthropic');

            if (provider === 'swarm') {
                swarmConfig.agents.forEach(agent => {
                    if (!getKeyForProvider(agent.provider)) throw new Error(`Key missing for Agent: ${agent.role} (${agent.provider})`);
                });

                let history = [];
                for (let i = 0; i < swarmConfig.rounds; i++) {
                    for (const agent of swarmConfig.agents) {
                        setStatusMessage(`Round ${i+1}: ${agent.role} is speaking...`);
                        const context = `ROUNDTABLE DISCUSSION.\nTOPIC: "${prompt}"\nYOUR ROLE: ${agent.role}\nTRANSCRIPT:\n${history.map(m=>`${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Provide your next response. Be concise.`;
                        const responseText = await callAIProvider(agent.provider, context, getKeyForProvider(agent.provider));
                        const newMsg = { role: agent.role, text: responseText, provider: agent.provider };
                        history.push(newMsg);
                        setSwarmHistory([...history]);
                    }
                }
                setStatusMessage('Meeting adjourned.');

            } else if (provider === 'battle') {
                setStatusMessage(`Versus: ${battleConfig.fighterA} vs ${battleConfig.fighterB}...`);
                const [rA, rB] = await Promise.allSettled([
                    callAIProvider(battleConfig.fighterA, prompt, getKeyForProvider(battleConfig.fighterA)),
                    callAIProvider(battleConfig.fighterB, prompt, getKeyForProvider(battleConfig.fighterB))
                ]);
                setBattleResults({
                    fighterA: { name: battleConfig.fighterA, text: rA.status==='fulfilled'?rA.value:rA.reason.message },
                    fighterB: { name: battleConfig.fighterB, text: rB.status==='fulfilled'?rB.value:rB.reason.message }
                });
            } else if (provider === 'refine') {
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
            } else {
                setStatusMessage(`${provider} is thinking...`);
                const text = await callAIProvider(provider, prompt, getKeyForProvider(provider));
                setResult(text);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const continueSwarm = async (currentPrompt) => {
        setLoading(true);
        setStatusMessage('Continuing the meeting...');
        try {
            let updatedHistory = [...swarmHistory];
            for (const agent of swarmConfig.agents) {
                if (!getKeyForProvider(agent.provider)) continue;
                setStatusMessage(`Extra Round: ${agent.role} is speaking...`);
                const context = `CONTINUING DISCUSSION.\nTOPIC: "${currentPrompt}"\nYOUR ROLE: ${agent.role}\nTRANSCRIPT:\n${updatedHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\nINSTRUCTION: Continue/Respond.`;
                const responseText = await callAIProvider(agent.provider, context, getKeyForProvider(agent.provider));
                updatedHistory.push({ role: agent.role, text: responseText, provider: agent.provider });
                setSwarmHistory([...updatedHistory]);
            }
        } catch (err) { setError(err.message); } finally { setLoading(false); setStatusMessage(''); }
    };

    const compileSwarmCode = async () => {
        const compilerKey = openaiKey || geminiKey; 
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
        geminiKey, openaiKey, groqKey, anthropicKey, battleConfig,
        loading, result, battleResults, refineSteps, statusMessage, error, selectedModel, availableModels,
        isLoggedIn,
        // New Github State
        githubToken, setGithubToken, 
        
        setGeminiKey, setOpenaiKey, setGroqKey, setAnthropicKey,
        setProvider, setRefineView, setShowGithub, setRefineConfig, setSwarmConfig, setBattleConfig,
        setSelectedModel,
        
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange, continueSwarm, compileSwarmCode,
        addSwarmAgent, removeSwarmAgent, updateSwarmAgent,
        
        // New API Function
        shipToGithub 
    };
};