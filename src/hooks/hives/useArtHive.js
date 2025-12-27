import { useState } from 'react';

export const useArtHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // vision -> specs -> critique -> blueprint -> done
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});

    // MANAGER STATE (This fixes the "Not Working" issue - it must be exposed)
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mode = 'art';

    // --- KEYS & API HELPER (Same as before) ---
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    const callAgent = async (agentId, prompt, context = "") => {
        const keys = getEffectiveKeys();
        // Allow just one key to work
        if (!keys.openai && !keys.gemini && !keys.anthropic && !keys.groq) {
            throw new Error("No API Keys found.");
        }

        const res = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, targetAgentId: agentId, context, keys })
        });
        if (!res.ok) throw new Error("Agent Connection Failed");
        return await res.json();
    };

    // --- PHASE 1: VISION (Muse) ---
    const startMission = async (prompt) => {
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('The Muse is brainstorming 10+ concepts...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('muse', prompt);
            // Explicitly inject Role for UI detection
            setHistory([{ ...data.swarm[0], role: 'The Muse', type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- PHASE 2: SPECS (Cinematographer) ---
    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Cinematographer is defining the look...');
        setContextData(prev => ({ ...prev, vision_choices: choices }));

        const contextStr = `USER VISION: ${JSON.stringify(choices)}`;

        try {
            const data = await callAgent('cinematographer', "Generate technical specs (10+ options).", contextStr);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Cinematographer', type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 3: CRITIC (The Critic) - NEW! ---
    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('critique'); setStatusMessage('The Critic is reviewing for conflicts...');
        setContextData(prev => ({ ...prev, spec_choices: specs }));

        const contextStr = `
        VISION: ${JSON.stringify(contextData.vision_choices)}
        SPECS: ${JSON.stringify(specs)}
        `;

        try {
            // Call the NEW Art Critic agent
            const data = await callAgent('art_critic', "Audit this visual plan.", contextStr);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Critic', type: 'critique_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 4: BLUEPRINT (Stylist) ---
    const refineBlueprint = async (critiqueChoices) => {
        setLoading(true); setCurrentPhase('blueprint'); setStatusMessage('The Stylist is composing the image...');

        // If empty (Auto-Pilot/Skipped), just proceed
        const feedback = Object.keys(critiqueChoices).length > 0 ? JSON.stringify(critiqueChoices) : "No changes needed.";

        const contextStr = `
        VISION: ${JSON.stringify(contextData.vision_choices)}
        SPECS: ${JSON.stringify(contextData.spec_choices)}
        CRITIC FEEDBACK: ${feedback}
        `;

        try {
            const data = await callAgent('stylist', "Create final composition structure.", contextStr);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Stylist', type: 'blueprint' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 5: FINAL (Gallery) ---
    const renderFinal = async () => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('Rendering final prompt...');
        try {
            const fullHistory = history.map(m => `${m.role}: ${m.content}`).join('\n');
            const data = await callAgent('gallery', "Generate final Midjourney prompt.", fullHistory);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Gallery', type: 'final' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- MANAGER DRAWER LOGIC ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        if (setInput) setInput(''); // Clear input if function provided
        setLoading(true);

        try {
            // Simple echo for now, or connect to Manager Agent
            // For stability, let's just make it acknowledge
            setManagerMessages(prev => [...prev, { role: 'assistant', content: `I've noted: "${userText}". (Manager Logic WIP)` }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, refineBlueprint, renderFinal,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback,
        mode
    };
};
