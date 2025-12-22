import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export const useTestRunner = (defaultApiKey, defaultOpenAIKey) => {
    // --- 1. CORE STATE ---
    const [viewMode, setViewMode] = useState('simple');
    const [provider, setProvider] = useState('gemini');
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
    const [refineView, setRefineView] = useState('split'); // Added to fix ReferenceError

    // --- 2. CONFIGS ---
    const [battleConfig, setBattleConfig] = useState({ fighterA: 'gemini', fighterB: 'openai' });
    const [refineConfig, setRefineConfig] = useState({ drafter: 'gemini', critiquer: 'openai', focus: 'general' });

    // --- 3. EXECUTION STATE ---
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [battleResults, setBattleResults] = useState(null);
    const [refineSteps, setRefineSteps] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);

    // --- 4. LIFECYCLE ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session?.user));
        if (defaultApiKey) setGeminiKey(defaultApiKey);
        else setGeminiKey(localStorage.getItem('gemini_key') || '');
        if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
        else setOpenaiKey(localStorage.getItem('openai_key') || '');
        setGroqKey(localStorage.getItem('groq_key') || '');
        setAnthropicKey(localStorage.getItem('anthropic_key') || '');
        setGithubToken(localStorage.getItem('github_token') || '');
    }, [defaultApiKey, defaultOpenAIKey]);

    useEffect(() => { if (geminiKey) fetchModels(geminiKey); }, [geminiKey]);

    // --- 5. HELPERS ---
    const saveKey = (key, name) => { if (key) localStorage.setItem(`${name}_key`, key.trim()); };
    const clearKey = (name) => { localStorage.removeItem(`${name}_key`); }; // Simplified
    const getKeyForProvider = (p) => {
        if (p === 'gemini') return geminiKey;
        if (p === 'openai') return openaiKey;
        if (p === 'groq') return groqKey;
        if (p === 'anthropic') return anthropicKey;
        return '';
    };

    const handleShipCode = (code) => { setCodeToShip(code); setShowGithub(true); };
    const handleViewChange = (m) => {
        setViewMode(m);
        if (m === 'simple') setProvider('gemini');
        if (m === 'advanced') setProvider('battle');
    };

    const fetchModels = async (key) => {
        if (!key) return;
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key, endpoint: 'listModels' }) });
            const data = await res.json();
            if (data.models) setAvailableModels(data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent")));
        } catch (e) { console.error(e); }
    };

    // --- 6. CORE API CALLER ---
    const callAI = async (name, text, key, modelOverride) => {
        const body = { apiKey: key, prompt: text };
        if (modelOverride) body.model = modelOverride;
        else {
            if (name === 'gemini') body.model = selectedModel || 'gemini-2.0-flash-lite-preview-02-05';
            if (name === 'openai') body.model = 'gpt-4o';
            if (name === 'groq') body.model = 'llama-3.3-70b-versatile';
            if (name === 'anthropic') body.model = 'claude-3-5-sonnet-20241022';
        }
        const res = await fetch(`/api/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.error || 'AI Error');
        if (name === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (name === 'openai' || name === 'groq') return data.choices?.[0]?.message?.content;
        if (name === 'anthropic') return data.content?.[0]?.text;
        return "No response.";
    };

    const shipToGithub = async (token, filename, description, isPublic) => {
        saveKey(token, 'github'); setGithubToken(token);
        const res = await fetch('/api/github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'create_gist', payload: { description, public: isPublic, files: { [filename || 'snippet.txt']: { content: codeToShip } } } }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Shipment failed.");
        return data.html_url;
    };

    // --- 7. MAIN RUNNER ---
    const runTest = async (prompt) => {
        setLoading(true); setError(null); setResult(null); setBattleResults(null); setRefineSteps(null);

        try {
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');

            if (provider === 'smart_chain') {
                setStatusMessage('Drafting...');
                let text = await callAI(refineConfig.drafter, `Draft: ${prompt}`, getKeyForProvider(refineConfig.drafter));
                setStatusMessage('Refining...');
                text = await callAI(refineConfig.critiquer, `Improve this: ${text}`, getKeyForProvider(refineConfig.critiquer));
                setResult(text);
            } else if (provider === 'battle') {
                setStatusMessage('Fighting...');
                const [rA, rB] = await Promise.allSettled([
                    callAI(battleConfig.fighterA, prompt, getKeyForProvider(battleConfig.fighterA)),
                    callAI(battleConfig.fighterB, prompt, getKeyForProvider(battleConfig.fighterB))
                ]);
                setBattleResults({
                    fighterA: { name: battleConfig.fighterA, text: rA.status === 'fulfilled' ? rA.value : rA.reason.message },
                    fighterB: { name: battleConfig.fighterB, text: rB.status === 'fulfilled' ? rB.value : rB.reason.message }
                });
            } else if (provider === 'refine') {
                setStatusMessage('Drafting...');
                const draft = await callAI(refineConfig.drafter, prompt, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft });
                setStatusMessage('Critiquing...');
                const critique = await callAI(refineConfig.critiquer, `Critique: ${draft}`, getKeyForProvider(refineConfig.critiquer));
                setRefineSteps({ draft, critique });
                setStatusMessage('Finalizing...');
                const final = await callAI(refineConfig.drafter, `Finalize based on critique: ${critique} \n Original: ${draft}`, getKeyForProvider(refineConfig.drafter));
                setRefineSteps({ draft, critique, final });
                setResult(final);
            } else {
                setStatusMessage(`Running ${provider}...`);
                const res = await callAI(provider, prompt, getKeyForProvider(provider));
                setResult(res);
            }
        } catch (e) { setError(e.message); }
        finally { setLoading(false); setStatusMessage(''); }
    };

    return {
        viewMode, provider, refineView, showGithub, codeToShip, refineConfig,
        geminiKey, openaiKey, groqKey, anthropicKey, battleConfig, loading, result, battleResults,
        refineSteps, statusMessage, error, selectedModel, availableModels, isLoggedIn, githubToken,
        showHelpModal,
        setGeminiKey, setOpenaiKey, setGroqKey, setAnthropicKey, setProvider, setRefineView,
        setShowGithub, setRefineConfig, setBattleConfig, setSelectedModel, setGithubToken, setShowHelpModal,
        runTest, fetchModels, clearKey, handleShipCode, handleViewChange, shipToGithub
    };
};