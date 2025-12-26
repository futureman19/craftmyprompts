import { useState } from 'react';

export const useTextHive = (initialKeys = {}) => {
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mode = 'text';

    // ... (Same Key Logic as Art) ...
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
    });

    const callAgent = async (agentId, prompt, context = "") => {
        const keys = getEffectiveKeys();
        const res = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, targetAgentId: agentId, context, keys })
        });
        return await res.json();
    };

    const startMission = async (prompt) => {
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('Editor-in-Chief is reviewing...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('editor', prompt);
            setHistory([{ ...data.swarm[0], type: 'vision_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Linguist is defining tone...');
        setContextData(prev => ({ ...prev, strategy: choices }));
        try {
            const data = await callAgent('linguist', "Define tone.", `STRATEGY: ${JSON.stringify(choices)}`);
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'spec_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('blueprint'); setStatusMessage('The Writer is outlining...');
        setContextData(prev => ({ ...prev, specs }));
        try {
            const data = await callAgent('writer', "Draft outline.", `SPECS: ${JSON.stringify(specs)}`);
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'blueprint' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const generateBlueprint = async () => { };

    const writeManuscript = async () => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('Writing final copy...');
        try {
            const data = await callAgent('publisher', "Finalize text.", "History Context");
            setHistory(prev => [...prev, { ...data.swarm[0], type: 'final' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, generateBlueprint, writeManuscript,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback: () => { },
        mode
    };
};
