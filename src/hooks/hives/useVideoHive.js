import { useState } from 'react';

export const useVideoHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // idle, producer, director, vfx
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({}); // Stores: { originalPrompt, concept, visuals }
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Implicit Mode
    const mode = 'video';

    // --- HELPER: CLEAN JSON ---
    const cleanJson = (text) => {
        if (!text) return "";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    // --- KEY MANAGEMENT ---
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    // --- HELPER: CALL API ---
    const callAgent = async (agentId, prompt, context = "", extraPayload = {}) => {
        const effectiveKeys = getEffectiveKeys();

        // Basic key check
        if (!effectiveKeys.openai && !effectiveKeys.gemini) {
            throw new Error("No API Keys found. Please add them in Settings.");
        }

        const response = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                targetAgentId: agentId,
                context,
                keys: effectiveKeys,
                category: 'video', // Important: Tells Swarm to look in Video Roster
                ...extraPayload
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Agent Unreachable");
        }

        return await response.json();
    };

    // --- STEP 1: THE PRODUCER (Concept/Strategy) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('producer');
        setStatusMessage('The Producer is brainstorming concepts...');

        // Save original request
        setContextData({ originalPrompt: userPrompt, mode: 'video' });

        try {
            const data = await callAgent('producer', `User Request: "${userPrompt}". Pitch video concepts.`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory([{
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Producer',
                type: 'strategy_options'
            }]);
        } catch (e) {
            console.error(e);
            setStatusMessage("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: THE DIRECTOR (Visuals/Specs) ---
    const submitChoices = async (choice) => {
        setLoading(true);
        setCurrentPhase('director');
        setStatusMessage('The Director is defining the visual style...');

        // 1. Handle Auto-Pilot
        const isAutoPilot = !choice;
        const conceptContext = isAutoPilot
            ? "AUTO-PILOT: Choose the best concept for the user's request."
            : `SELECTED CONCEPT: ${choice}`;

        // 2. Update Context
        const newContext = { ...contextData, concept: choice || "Auto-Pilot" };
        setContextData(newContext);

        try {
            const contextString = `ORIGINAL REQUEST: "${newContext.originalPrompt}"\n${conceptContext}`;
            const data = await callAgent('director', "Define the Camera Work and Lighting options.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Director',
                type: 'spec_options'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: VFX ARTIST (Final Prompt) ---
    const submitSpecs = async (visualChoice) => {
        setLoading(true);
        setCurrentPhase('vfx');
        setStatusMessage('The VFX Artist is synthesizing the final prompt...');

        // 1. Handle Auto-Pilot
        const isAutoPilot = !visualChoice;
        const visualContext = isAutoPilot
            ? "AUTO-PILOT: Choose the best visual style."
            : `SELECTED STYLE: ${visualChoice}`;

        // 2. Update Context
        const newContext = { ...contextData, visuals: visualChoice || "Auto-Pilot" };
        setContextData(newContext);

        try {
            const contextString = `
            ORIGINAL REQUEST: "${newContext.originalPrompt}"
            CONCEPT: ${newContext.concept}
            ${visualContext}
            `;

            const data = await callAgent('vfx', "Write the final optimized prompt for Video AI generation.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The VFX Artist',
                type: 'final'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- MANAGER FEEDBACK (Global) ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setLoading(true);

        try {
            const contextString = `Current Phase: ${currentPhase}\nUser Request: ${userText}`;
            const data = await callAgent('manager', "Direct the Video Swarm based on feedback.", contextString);

            const decision = JSON.parse(cleanJson(data.swarm[0].content));
            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // Pivot Logic
            if (decision.target_phase === 'producer') startMission(userText);
            if (decision.target_phase === 'director') submitChoices(contextData.concept);

        } catch (e) {
            console.error(e);
            setManagerMessages(prev => [...prev, { role: 'assistant', content: "I couldn't process that." }]);
        } finally {
            setLoading(false);
        }
    };

    return {
        history,
        currentPhase,
        loading,
        statusMessage,
        startMission,
        submitChoices,
        submitSpecs,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode
    };
};
