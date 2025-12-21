import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { SWARM_AGENTS } from '../lib/swarm-agents.js';

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

    // RESTORED: Refine Configuration
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

    // --- AoT PROTOCOL DEFINITION ---
    const AOT_INSTRUCTION = `
    [ATOM OF THOUGHTS PROTOCOL]
    You are a reasoning engine. Do not answer immediately.
    1. DECOMPOSE: Break the request into atomic sub-tasks.
    2. REASON: Analyze constraints and strategy.
    3. FORMAT:
       - Wrap your reasoning inside <Thinking>...</Thinking> tags.
       - Wrap your final deliverable inside <Output>...</Output> tags.
    `;

    // --- 3. EXECUTION STATE ---
    const [storyStep, setStoryStep] = useState('idle'); // 'idle', 'vision', 'blueprint', 'critique', 'synthesis'
    const [swarmHistory, setSwarmHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [battleResults, setBattleResults] = useState(null);
    const [refineSteps, setRefineSteps] = useState(null); // RESTORED: Refine Steps
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
        else setGeminiKey(localStorage.getItem('gemini_key') || '');

        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('openai_key') || '');

        setGroqKey(localStorage.getItem('groq_key') || '');
        setAnthropicKey(localStorage.getItem('anthropic_key') || '');
        setGithubToken(localStorage.getItem('github_token') || '');

        return () => subscription.unsubscribe();
    }, [defaultApiKey, defaultOpenAIKey]);

    useEffect(() => {
        if (geminiKey) fetchModels(geminiKey);
    }, [geminiKey]);

    // --- 5. HELPERS ---
    const saveKey = (key, providerName) => {
        if (key && key.trim()) {
            if ((providerName === 'gemini' && key === defaultApiKey) || (providerName === 'openai' && key === defaultOpenAIKey)) return;
            localStorage.setItem(`${providerName}_key`, key.trim());
        }
    };

    const clearKey = (providerName) => {
        localStorage.removeItem(`${providerName}_key`);
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
                    .sort((a, b) => b.name.localeCompare(a.name));
                setAvailableModels(valid);
                if (valid.length > 0 && !selectedModel) setSelectedModel(valid[0].name);
            }
        } catch (e) { console.error("Model fetch failed", e); }
    };

    const callAI = async (name, text, key, modelOverride) => {
        const body = { apiKey: key, prompt: text };

        // Model Selection Logic
        if (modelOverride) {
            body.model = modelOverride;
        } else {
            // Default Fallbacks
            if (name === 'gemini') body.model = selectedModel || 'gemini-2.0-flash-lite-preview-02-05';
            if (name === 'openai') body.model = 'gpt-4o';
            if (name === 'groq') body.model = 'llama-3.3-70b-versatile';
            if (name === 'anthropic') body.model = 'claude-3-5-sonnet-20241022';
        }

        const res = await fetch(`/api/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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

    // --- 9. CATEGORY STATE ---
    const [swarmCategory, setSwarmCategory] = useState('code'); // 'code', 'text', 'data'

    // --- 7. SWARM ENGINE (The Boardroom) ---
    const runSwarm = async (prompt, categoryOverride) => {
        setStatusMessage('The Boardroom is convening... (Connecting to Cortex)');
        setSwarmHistory([]);

        try {
            const apiKeys = {
                openai: openaiKey,
                anthropic: anthropicKey,
                gemini: geminiKey,
                groq: groqKey
            };

            // Call The Cortex (Server-Side Swarm Orchestrator)
            // PASS THE CATEGORY HERE (Override takes precedence)
            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    keys: apiKeys,
                    category: categoryOverride || swarmCategory // <--- NEW: Dynamic Category Override
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'The Cortex failed to respond.');
            }

            const data = await response.json();

            // The Cortex returns { swarm: [...] } where items have 'content'.
            // UI expects 'text'. We map it here.
            const mappedAgents = (data.swarm || []).map(agent => ({
                ...agent,
                text: agent.content, // Map content -> text for UI
                provider: agent.meta?.model || 'cortex-agent'
            }));

            setSwarmHistory(mappedAgents);
            setStatusMessage('Boardroom session adjourned.');

        } catch (err) {
            console.error("Swarm Error:", err);
            // We throw here so runTest can catch it and show the error state
            throw new Error(`Cortex Error: ${err.message}`);
        }
    };

    // --- 8. MAIN TEST RUNNER ---
    const runTest = async (prompt, categoryOverride) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setBattleResults(null);
        setRefineSteps(null);
        setSwarmHistory([]);
        setRouterReasoning('');

        try {
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');
            if (groqKey) saveKey(groqKey, 'groq');
            if (anthropicKey) saveKey(anthropicKey, 'anthropic');

            let activeProvider = provider;

            // --- STEP 1: SMART CHAIN PIPELINE ---
            if (provider === 'smart_chain') {
                let currentText = '';

                // Step 1: Draft (Gemini)
                setStatusMessage('Step 1/4: Drafting with Gemini 2.5 Flash Lite...');
                try {
                    currentText = await callAI('gemini', `Draft a comprehensive response to: ${prompt}`, geminiKey);
                    if (!currentText) throw new Error("Empty response from Draft step");
                } catch (err) {
                    throw new Error(`Smart Chain Failed at Step 1 (Drafting): ${err.message}`);
                }

                // Step 2: Reasoning (GPT-4o)
                setStatusMessage('Step 2/4: Reasoning with GPT-4o...');
                try {
                    const reasoning = await callAI('openai', `Analyze this draft for logic gaps and expand: ${currentText}`, openaiKey);
                    if (reasoning) currentText = reasoning;
                } catch (err) {
                    console.warn("Step 2 Failed, skipping:", err);
                    setStatusMessage('⚠️ Step 2 Failed (Skipped)');
                    // Fallback: Proceed with 'draft' => currentText remains unchanged
                }

                // Step 3: Filter (Llama 3 via Groq)
                setStatusMessage('Step 3/4: Filtering with Llama 3.1...');
                try {
                    const filtered = await callAI('groq', `Review this text for clarity and conciseness. Filter out fluff: ${currentText}`, groqKey);
                    if (filtered) currentText = filtered;
                } catch (err) {
                    console.warn("Step 3 Failed, skipping:", err);
                    setStatusMessage('⚠️ Step 3 Failed (Skipped)');
                    // Fallback: Proceed with previous output
                }

                // Step 4: Polish (Claude 3.5 Sonnet)
                setStatusMessage('Step 4/4: Polishing with Claude 3.5 Sonnet...');
                try {
                    const final = await callAI('anthropic', `Final Polish. Enhance tone and nuance: ${currentText}`, anthropicKey);
                    if (final) currentText = final;
                } catch (err) {
                    console.warn("Step 4 Failed, using previous result:", err);
                    setStatusMessage('⚠️ Step 4 Failed (Using previous output)');
                    // Fallback: Final result is whatever we have so far
                }

                setResult(currentText);
                return; // End execution here for smart_chain
            }

            // --- STEP 1: EXECUTION PATHS ---
            if (provider === 'swarm') {
                // Pass current category state implicitly via runSwarm using closure
                await runSwarm(prompt, categoryOverride);
            } else if (provider === 'battle') {
                setStatusMessage(`Versus: ${battleConfig.fighterA} vs ${battleConfig.fighterB}...`);
                const [rA, rB] = await Promise.allSettled([
                    callAI(battleConfig.fighterA, prompt, getKeyForProvider(battleConfig.fighterA)),
                    callAI(battleConfig.fighterB, prompt, getKeyForProvider(battleConfig.fighterB))
                ]);
                setBattleResults({
                    fighterA: { name: battleConfig.fighterA, text: rA.status === 'fulfilled' ? rA.value : rA.reason.message },
                    fighterB: { name: battleConfig.fighterB, text: rB.status === 'fulfilled' ? rB.value : rB.reason.message }
                });
            } else if (provider === 'refine') {
                // RESTORED: Refine Mode Logic with AoT Upgrade
                setStatusMessage('Drafting (AoT Mode)...');
                const draft = await callAI(refineConfig.drafter, `${AOT_INSTRUCTION}\nTASK: ${prompt}`, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft });

                setStatusMessage('Critiquing (AoT Mode)...');
                const critique = await callAI(refineConfig.critiquer, `${AOT_INSTRUCTION}\nCritique this draft focusing on ${refineConfig.focus}:\n${draft}`, getKeyForProvider(refineConfig.critiquer));
                setRefineSteps({ draft, critique });

                setStatusMessage('Finalizing...');
                const final = await callAI(refineConfig.drafter, `Improve based on critique:\nDraft: ${draft}\nCritique: ${critique}`, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft, critique, final });
                setResult(final);
            } else {
                // Standard or Routed path
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
            // Re-use current category selection logic if we wanted to change agents, but for now continue with same agents (client side)
            // NOTE: Client-side continue uses 'swarmConfig.agents' which we aren't using for main execution anymore. 
            // We should ideally fetch continuation from Cortex too. But for now, we leave legacy logic as is or simple fix:
            // The user didn't ask to fix continuation. Focus on initial dispatch.

            for (const a of swarmConfig.agents) {
                if (!getKeyForProvider(a.provider)) continue;
                setStatusMessage(`${a.role} thinking...`);
                // Legacy path for custom agents
                const t = await callAI(a.provider, `${AOT_INSTRUCTION}\nCONTINUE: "${p}"\nROLE: ${a.role}\nCONTEXT:\n${h.map(m => `${m.role}: ${m.text}`).join('\n')}`, getKeyForProvider(a.provider));
                h.push({ role: a.role, text: t, provider: a.provider });
                setSwarmHistory([...h]);
            }
        } catch (e) { setError(e.message); } finally { setLoading(false); setStatusMessage(''); }
    };

    const compileSwarmCode = async () => {
        setStatusMessage('The Executive is consolidating the Master Plan...');
        setLoading(true);
        try {
            const apiKeys = {
                openai: openaiKey,
                anthropic: anthropicKey,
                gemini: geminiKey,
                groq: groqKey
            };

            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `History:\n${swarmHistory.map(m => `${m.role}: ${m.text}`).join('\n')}`,
                    mode: 'synthesize', // Trigger Manager Agent
                    keys: apiKeys
                })
            });

            if (!response.ok) throw new Error("Cortex Synthesis Failed");

            const data = await response.json();
            const executiveResult = data.swarm[0]; // Manager is single result

            // Append Executive to History
            setSwarmHistory(p => [...p, {
                ...executiveResult,
                text: executiveResult.content, // Map content -> text
                role: 'The Executive'
            }]);

        } catch (e) {
            console.error(e);
            setError("Synthesis Failed: " + e.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // --- 10. NARRATIVE STATE MACHINE ---
    // Helper to call a specific agent (Narrative Mode)
    const runSingleAgent = async (agentId, userPrompt, contextHistory = []) => {
        setLoading(true);
        setStatusMessage(`Creating Signal for ${agentId}...`);
        try {
            const apiKeys = {
                openai: openaiKey,
                anthropic: anthropicKey,
                gemini: geminiKey,
                groq: groqKey
            };

            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    keys: apiKeys,
                    targetAgentId: agentId, // <--- TARGET SPECIFIC AGENT
                    context: contextHistory // Optional: Pass history if backend supports it
                })
            });

            if (!response.ok) throw new Error("Agent Unreachable");

            const data = await response.json();
            const agentResult = data.swarm[0];

            // Map result for UI
            const uiMessage = {
                ...agentResult,
                text: agentResult.content,
                provider: agentResult.meta?.model || agentId
            };

            // Update History
            setSwarmHistory(prev => [...prev, uiMessage]);
            return uiMessage;

        } catch (e) {
            console.error("Single Agent Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // Narrative Methods
    const startNarrative = async (prompt) => {
        setSwarmHistory([]); // Clear previous
        setStoryStep('vision');
        await runSingleAgent('visionary', prompt);
    };

    const approveVision = async () => {
        setStoryStep('blueprint');
        const visionContext = swarmHistory.map(m => `[${m.role}]: ${m.text}`).join('\n');
        await runSingleAgent('architect', `APPROVED VISION. Create the technical blueprint based on:\n${visionContext}`);
    };

    const approveBlueprint = async () => {
        setStoryStep('critique');
        const context = swarmHistory.map(m => `[${m.role}]: ${m.text}`).join('\n');
        await runSingleAgent('critic', `Review this plan for security and logic flaws:\n${context}`);
    };

    const submitFeedback = async (userFeedback) => {
        setStoryStep('synthesis');
        const context = swarmHistory.map(m => `[${m.role}]: ${m.text}`).join('\n');
        // Call Executive (Manager) which is default for 'synthesize' mode, or explicit ID
        await runSingleAgent('executive', `Finalize the Master Plan. Address this feedback: "${userFeedback}"\n\nFull Context:\n${context}`);
    };

    const resetNarrative = () => {
        setStoryStep('idle');
        setSwarmHistory([]);
        setResult(null);
    };

    return {
        // State
        viewMode, provider, refineView, showGithub, codeToShip, refineConfig, swarmConfig, swarmHistory,
        geminiKey, openaiKey, groqKey, anthropicKey, battleConfig, loading, result, battleResults,
        refineSteps, statusMessage, error, selectedModel, availableModels, isLoggedIn, githubToken,
        showHelpModal, routerReasoning, swarmCategory, storyStep,

        // Setters
        setGeminiKey, setOpenaiKey, setGroqKey, setAnthropicKey, setProvider, setRefineView,
        setShowGithub, setRefineConfig, setSwarmConfig, setBattleConfig, setSelectedModel,
        setGithubToken, setShowHelpModal, setSwarmCategory, setStoryStep,

        // Methods
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange, continueSwarm,
        compileSwarmCode, addSwarmAgent, removeSwarmAgent, updateSwarmAgent, shipToGithub,
        // Narrative Methods
        startNarrative, approveVision, approveBlueprint, submitFeedback, resetNarrative
    };
};