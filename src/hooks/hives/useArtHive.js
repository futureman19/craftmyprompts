import { useState } from 'react';

export const useArtHive = (initialKeys = {}) => {
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mode = 'art';

    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    const callAgent = async (agentId, prompt, context = "") => {
        const keys = getEffectiveKeys();
        if (!keys.openai && !keys.gemini) throw new Error("Missing API Keys");

        const res = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, targetAgentId: agentId, context, keys })
        });
        if (!res.ok) throw new Error("Agent Error");
        return await res.json();
    };

    const startMission = async (prompt) => {
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('The Muse is dreaming...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('muse', prompt);
            setHistory([{ ...data.swarm[0], type: 'vision_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Cinematographer is setting the scene...');
        setContextData(prev => ({ ...prev, strategy: choices }));
        try {
            const data = await callAgent('cinematographer', "Define visual specs.", `STRATEGY: ${JSON.stringify(choices)}`);
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'spec_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('blueprint'); setStatusMessage('The Stylist is composing...');
        setContextData(prev => ({ ...prev, specs }));
        try {
            const data = await callAgent('stylist', "Create composition.", `SPECS: ${JSON.stringify(specs)}`);
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'blueprint' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // Note: Art has no Critic phase in v2.4, goes straight to Final
    const composeBlueprint = async () => {
        // Alias for step transition if needed
    };

    const renderFinal = async () => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('Rendering final prompt...');
        try {
            const data = await callAgent('gallery', "Finalize prompt.", "History Context");
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'final' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, composeBlueprint, renderFinal,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback: () => { }, // TODO
        mode
    };
};
