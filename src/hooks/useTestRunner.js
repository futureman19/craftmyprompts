import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- 1. CORE STATE ---
    const [viewMode, setViewMode] = useState('simple'); 
    const [provider, setProvider] = useState('gemini'); 
    const [refineView, setRefineView] = useState('timeline'); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // AI Keys
    const [geminiKey, setGeminiKey] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');

    // Modals & Deploy
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showGithub, setShowGithub] = useState(false);
    const [codeToShip, setCodeToShip] = useState('');
    const [githubToken, setGithubToken] = useState('');

    // --- 2. INTELLIGENCE CONFIGS ---
    const [routerReasoning, setRouterReasoning] = useState(''); // Smart Router State

    const [battleConfig, setBattleConfig] = useState({
        fighterA: 'gemini',
        fighterB: 'openai'
    });

    const [refineConfig, setRefineConfig] = useState({
        drafter: 'gemini',
        critiquer: 'openai',
        focus: 'general'
    });

    // Dynamic Agents Array
    const [swarmConfig, setSwarmConfig] = useState({
        rounds: 3,
        agents: [
            { id: '1', provider: 'gemini', role: 'Visionary CEO' },
            { id: '2', provider: 'openai', role: 'Pragmatic Engineer' }
        ]
    });
    
    // --- 3. EXECUTION STATE ---
    const [swarmHistory, setSwarmHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [battleResults, setBattleResults] = useState(null);
    const [refineSteps, setRefineSteps] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);

    // Models
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);

    // --- 4. LIFECYCLE & AUTH ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session?.user));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsLoggedIn(!!session?.user));
        
        if (defaultApiKey) setGeminiKey(defaultApiKey);
        else setGeminiKey(localStorage.getItem('craft_my_prompt_gemini_key') || '');

        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('craft_my_prompt_openai_key') || '');

        setGroqKey(localStorage.getItem('craft_my_prompt_groq_key') || '');
        setAnthropicKey(localStorage.getItem('craft_my_prompt_anthropic_key') || '');
        setGithubToken(localStorage.getItem('craft_my_prompt_github_key') || '');
        
        return () => subscription.unsubscribe();
    }, [defaultApiKey, defaultOpenAIKey]);

    useEffect(() => { 
        if (geminiKey) fetchModels(geminiKey); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geminiKey]);

    // --- 5. HELPERS ---
    const saveKey = (key, providerName) => {
        if (key && key.trim()) {
            if ((providerName === 'gemini' && key === defaultApiKey) || (providerName === 'openai' && key === defaultOpenAIKey)) return;
            localStorage.setItem(`craft_my_prompt_${providerName}_key`, key.trim());
        }
    };

    const clearKey = (providerName) => {
        localStorage.removeItem(`craft_my_prompt_${providerName}_key`);
        if (providerName === 'gemini') setGeminiKey('');
        else if (providerName === 'openai') setOpenaiKey('');
        else if (providerName === 'groq') setGroqKey('');
        else if (providerName === 'anthropic') setAnthropicKey('');
        else if (providerName === 'github') setGithubToken('');
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

    const handleShipCode = (code) => { setCodeToShip(code); setShowGithub(true); };
    
    const handleViewChange = (mode) => {
        setViewMode(mode);
        if (mode === 'simple') setProvider('gemini');
        if (mode === 'advanced') setProvider('battle');
    };

    // --- 6. AGENT ACTIONS (Model Management) ---
    const addSwarmAgent = () => { if (swarmConfig.agents.length >= 4) return; setSwarmConfig(p => ({ ...p, agents: [...p.agents, { id: Date.now().toString(), provider: 'gemini', role: 'New Specialist' }] })); };
    const removeSwarmAgent = (id) => { if (swarmConfig.agents.length <= 2) return; setSwarmConfig(p => ({ ...p, agents: p.agents.filter(a => a.id !== id) })); };
    const updateSwarmAgent = (id, f, v) => { setSwarmConfig(p => ({ ...p, agents: p.agents.map(a => a.id === id ? { ...a, [f]: v } : a) })); };

    const fetchModels = async (key) => {
        if (!key) return;
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key, endpoint: 'listModels' }) });
            const data = await res.json();
            if (data.models) {
                const valid = data.models
                    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                    .filter(m => !m.name.includes('vision'))
                    .sort((a,b) => b.name.localeCompare(a.name));
                setAvailableModels(valid);
                if (valid.length > 0 && !selectedModel) setSelectedModel(valid[0].name);
            }
        } catch (e) { console.error("Model fetch failed", e); }
    };

    const callAI = async (name, text, key) => {
        const body = { apiKey: key, prompt: text };
        // Priority Model Mapping (Using Gemini 2.5 Flash Lite as standard)
        if (name === 'gemini') body.model = selectedModel || 'gemini-2.5-flash-lite';
        if (name === 'openai') body.model = 'gpt-4o';
        if (name === 'groq') body.model = 'llama-3.3-70b-versatile';
        if (name === 'anthropic') body.model = 'claude-3-5-sonnet-20241022';

        const res = await fetch(`/api/${name}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error?.message || data.error || 'AI Bridge Error');
        
        if (name === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (name === 'openai' || name === 'groq') return data.choices?.[0]?.message?.content;
        if (name === 'anthropic') return data.content?.[0]?.text;
        return "No response received.";
    };

    const shipToGithub = async (token, filename, description, isPublic) => {
        if (!token) throw new Error("GitHub Token required.");
        saveKey(token, 'github'); setGithubToken(token);
        const res = await fetch('/api/github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'create_gist', payload: { description, public: isPublic, files: { [filename || 'snippet.txt']: { content: codeToShip } } } }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Shipment failed.");
        return data.html_url;
    };

    // --- 7. MAIN TEST RUNNER ---
    const runTest = async (prompt) => {
        setLoading(true); 
        setError(null); 
        setResult(null); 
        setBattleResults(null); 
        setRefineSteps(null); 
        setSwarmHistory([]); 
        setRouterReasoning('');
        
        try {
            // Auto-persist keys
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');
            if (groqKey) saveKey(groqKey, 'groq');
            if (anthropicKey) saveKey(anthropicKey, 'anthropic');

            let activeProvider = provider;

            // --- STEP 0: SMART ROUTING (New Phase 4 Logic) ---
            if (provider === 'auto') {
                setStatusMessage('Meta-Agent is routing...');
                const routerRes = await fetch('/api/router', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, apiKey: geminiKey })
                });
                const routerData = await routerRes.json();
                
                if (routerRes.ok) {
                    activeProvider = routerData.provider;
                    setRouterReasoning(routerData.reasoning);
                } else {
                    activeProvider = 'gemini'; // Safety fallback
                }
            }

            // --- STEP 1: EXECUTION PATHS ---
            if (provider === 'swarm') {
                // Ensure keys exist for all agents
                swarmConfig.agents.forEach(a => { if (!getKeyForProvider(a.provider)) throw new Error(`Key missing for Agent: ${a.role} (${a.provider})`); });

                let history = [];
                for (let i = 0; i < swarmConfig.rounds; i++) {
                    for (const agent of swarmConfig.agents) {
                        setStatusMessage(`Round ${i+1}: ${agent.role}...`);
                        const context = `TOPIC: "${prompt}"\nROLE: ${agent.role}\nDISCUSSION:\n${history.map(m=>`${m.role}: ${m.text}`).join('\n')}\nACTION: Provide your response.`;
                        const txt = await callAI(agent.provider, context, getKeyForProvider(agent.provider));
                        history.push({ role: agent.role, text: txt, provider: agent.provider });
                        setSwarmHistory([...history]);
                    }
                }
                setStatusMessage('Meeting adjourned.');

            } else if (provider === 'battle') {
                setStatusMessage(`Versus: ${battleConfig.fighterA} vs ${battleConfig.fighterB}...`);
                const [rA, rB] = await Promise.allSettled([
                    callAI(battleConfig.fighterA, prompt, getKeyForProvider(battleConfig.fighterA)),
                    callAI(battleConfig.fighterB, prompt, getKeyForProvider(battleConfig.fighterB))
                ]);
                setBattleResults({
                    fighterA: { name: battleConfig.fighterA, text: rA.status==='fulfilled'?rA.value:rA.reason.message },
                    fighterB: { name: battleConfig.fighterB, text: rB.status==='fulfilled'?rB.value:rB.reason.message }
                });
            } else if (provider === 'refine') {
                setStatusMessage('Drafting...');
                const draft = await callAI(refineConfig.drafter, prompt, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft });
                setStatusMessage('Critiquing...');
                const critique = await callAI(refineConfig.critiquer, `Critique as ${refineConfig.focus}:\n${draft}`, getKeyForProvider(refineConfig.critiquer));
                setRefineSteps({ draft, critique });
                setStatusMessage('Finalizing...');
                const final = await callAI(refineConfig.drafter, `Improve based on critique:\nDraft: ${draft}\nCritique: ${critique}`, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft, critique, final });
                setResult(final);
            } else {
                // Standard Generation (or Auto Routing result)
                setStatusMessage(`Generating with ${activeProvider}...`);
                const txt = await callAI(activeProvider, prompt, getKeyForProvider(activeProvider));
                setResult(txt);
            }
        } catch (e) { 
            setError(e.message); 
        } finally { 
            setLoading(false); 
            setStatusMessage(''); 
        }
    };

    // --- 8. SWARM CONTINUATION ---
    const continueSwarm = async (p) => {
        setLoading(true);
        setStatusMessage('Continuing...');
        try {
            let h = [...swarmHistory];
            for (const a of swarmConfig.agents) {
                if (!getKeyForProvider(a.provider)) continue;
                setStatusMessage(`${a.role} thinking...`);
                const t = await callAI(a.provider, `CONTINUE: "${p}"\nROLE: ${a.role}\nCONTEXT:\n${h.map(m=>`${m.role}: ${m.text}`).join('\n')}`, getKeyForProvider(a.provider));
                h.push({ role: a.role, text: t, provider: a.provider });
                setSwarmHistory([...h]);
            }
        } catch (e) { setError(e.message); } finally { setLoading(false); setStatusMessage(''); }
    };

    const compileSwarmCode = async () => {
        const key = openaiKey || geminiKey;
        if (!key) { setError("No key available for compilation."); return; }
        setLoading(true);
        try {
            const txt = await callAI(openaiKey ? 'openai' : 'gemini', `COMPILE FINAL CODE from transcript:\n${swarmHistory.map(m=>m.text).join('\n')}`, key);
            setSwarmHistory(p => [...p, { role: 'Compiler', text: txt, provider: openaiKey?'openai':'gemini' }]);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    return {
        // State
        viewMode, provider, refineView, showGithub, codeToShip, refineConfig, swarmConfig, swarmHistory,
        geminiKey, openaiKey, groqKey, anthropicKey, battleConfig, loading, result, battleResults, 
        refineSteps, statusMessage, error, selectedModel, availableModels, isLoggedIn, githubToken, 
        showHelpModal, routerReasoning,
        
        // Setters
        setGeminiKey, setOpenaiKey, setGroqKey, setAnthropicKey, setProvider, setRefineView, 
        setShowGithub, setRefineConfig, setSwarmConfig, setBattleConfig, setSelectedModel, 
        setGithubToken, setShowHelpModal,
        
        // Methods
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange, continueSwarm, 
        compileSwarmCode, addSwarmAgent, removeSwarmAgent, updateSwarmAgent, shipToGithub
    };
};