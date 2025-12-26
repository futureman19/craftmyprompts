import { useState } from 'react';

export const useVideoHive = (initialKeys = {}) => {
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(null); // Placeholder for future video URL

    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    const callAgent = async (agentId, prompt, context = "") => {
        const effectiveKeys = getEffectiveKeys();
        if (!effectiveKeys.openai && !effectiveKeys.gemini && !effectiveKeys.anthropic) throw new Error("No API Keys");

        try {
            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    targetAgentId: agentId,
                    context,
                    keys: effectiveKeys,
                    category: 'video'
                })
            });
            if (!response.ok) throw new Error("Agent Unreachable");
            return await response.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const cleanJson = (text) => text?.replace(/```json/g, '').replace(/```/g, '').trim() || "";

    // PHASE 1: PRODUCER
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('strategy');
        setStatusMessage('The Producer is drafting the screenplay...');
        setContextData({ originalPrompt: userPrompt });

        try {
            const data = await callAgent('producer', `Concept: "${userPrompt}". Develop strategy.`);
            const content = cleanJson(data.swarm[0].content);
            setHistory([{ ...data.swarm[0], content, role: 'The Producer', type: 'strategy_options' }]);
        } catch (e) { setStatusMessage(e.message); }
        finally { setLoading(false); }
    };

    // PHASE 2: DIRECTOR
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('spec');
        setStatusMessage('The Director is setting up the shot...');
        const updatedContext = { ...contextData, strategy_choice: choices };
        setContextData(updatedContext);

        try {
            const contextString = `CONCEPT: ${updatedContext.originalPrompt}\nSTRATEGY: ${choices}`;
            const data = await callAgent('director', "Define camera, lighting, and motion.", contextString);
            const content = cleanJson(data.swarm[0].content);
            setHistory(prev => [...prev, { ...data.swarm[0], content, role: 'The Director', type: 'spec_options' }]);
        } catch (e) { setStatusMessage(e.message); }
        finally { setLoading(false); }
    };

    // PHASE 3: FINAL PROMPT (Storyboard)
    const compileBlueprint = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');
        setStatusMessage('Finalizing storyboard...');
        const updatedContext = { ...contextData, visual_specs: specs };
        setContextData(updatedContext);

        try {
            // Simulate processing time
            await new Promise(r => setTimeout(r, 1500));

            // Generate the Final Prompt string
            const finalPrompt = `${updatedContext.originalPrompt}. ${updatedContext.strategy_choice}. ${specs}. High quality, cinematic 4k.`;

            setHistory(prev => [...prev, {
                role: 'The Editor',
                type: 'final',
                content: JSON.stringify({
                    final_prompt: finalPrompt,
                    summary: "Storyboard Locked."
                })
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // MANAGER
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setLoading(true);
        try {
            const context = `Phase: ${currentPhase}\nOriginal: ${contextData.originalPrompt}\nFeedback: ${userText}`;
            const data = await callAgent('manager', "Direct the swarm.", context);
            const decision = JSON.parse(cleanJson(data.swarm[0].content));
            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            if (decision.target_phase === 'strategy' && decision.revised_prompt) {
                setContextData(prev => ({ ...prev, originalPrompt: decision.revised_prompt }));
                startMission(decision.revised_prompt);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, compileBlueprint,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback,
        generatedVideo
    };
};
