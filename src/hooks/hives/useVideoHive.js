import { useState } from 'react';

export const useVideoHive = (initialKeys = {}) => {
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mode = 'video';

    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
    });

    const cleanJson = (text) => {
        if (!text) return "";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

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
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('The Producer is brainstorming...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('producer', prompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: 'The Producer', type: 'vision_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Director is planning shots...');
        setContextData(prev => ({ ...prev, strategy: choices }));
        try {
            const data = await callAgent('director', "Define visual direction.", `STRATEGY: ${JSON.stringify(choices)}`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: 'The Director', type: 'spec_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('blueprint'); setStatusMessage('Storyboard Artist drawing...');
        setContextData(prev => ({ ...prev, specs }));
        try {
            const data = await callAgent('vfx', "Create storyboard.", `SPECS: ${JSON.stringify(specs)}`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: 'The VFX Specialist', type: 'blueprint' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const createStoryboard = async () => { };

    const produceVideo = async () => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('Finalizing production...');
        try {
            const data = await callAgent('editor_video', "Render script.", "History Context");
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: 'The Editor', type: 'final' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, createStoryboard, produceVideo,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback: () => { },
        mode
    };
};
