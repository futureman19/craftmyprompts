import { useState } from 'react';

export const useTextHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // idle, editor, linguist, scribe, critic, publisher
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({}); // Stores: { originalPrompt, strategy, voice, outline }
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Implicit Mode
    const mode = 'text';

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
                category: 'text',
                ...extraPayload
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Agent Unreachable");
        }

        return await response.json();
    };

    // --- STEP 1: THE EDITOR (Strategy) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('editor');
        setStatusMessage('Editor-in-Chief is reviewing the brief...');

        // Save original request
        setContextData({ originalPrompt: userPrompt, mode: 'text' });

        try {
            const data = await callAgent('editor', `User Request: "${userPrompt}". Propose editorial strategies.`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory([{
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'Editor-in-Chief',
                type: 'strategy_options'
            }]);
        } catch (e) {
            console.error(e);
            setStatusMessage("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: THE LINGUIST (Voice & Tone) ---
    const submitChoices = async (choice) => {
        setLoading(true);
        setCurrentPhase('linguist');
        setStatusMessage('The Linguist is analyzing voice profiles...');

        // 1. Handle Auto-Pilot
        const isAutoPilot = !choice;
        const strategyContext = isAutoPilot
            ? "AUTO-PILOT: Choose the best strategy for the user's request."
            : `SELECTED STRATEGY: ${choice}`;

        // 2. Update Context
        const newContext = { ...contextData, strategy: choice || "Auto-Pilot" };
        setContextData(newContext);

        try {
            const contextString = `ORIGINAL REQUEST: "${newContext.originalPrompt}"\n${strategyContext}`;
            const data = await callAgent('linguist', "Define the specific Tone and Vocabulary options.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Linguist',
                type: 'spec_options'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: THE SCRIBE (Outline/Blueprint) ---
    const submitSpecs = async (voiceChoice) => {
        setLoading(true);
        setCurrentPhase('scribe');
        setStatusMessage('The Scribe is drafting the outline...');

        // 1. Handle Auto-Pilot
        const isAutoPilot = !voiceChoice;
        const voiceContext = isAutoPilot
            ? "AUTO-PILOT: Choose the best voice/tone."
            : `SELECTED VOICE: ${voiceChoice}`;

        // 2. Update Context
        const newContext = { ...contextData, voice: voiceChoice || "Auto-Pilot" };
        setContextData(newContext);

        try {
            const contextString = `
            ORIGINAL REQUEST: "${newContext.originalPrompt}"
            STRATEGY: ${newContext.strategy}
            ${voiceContext}
            `;

            const data = await callAgent('scribe', "Create a structural outline (Blueprint) for this text.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Scribe',
                type: 'blueprint'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 4: THE CRITIC (Audit) ---
    const sendToAudit = async () => {
        setLoading(true);
        setCurrentPhase('critic');
        setStatusMessage('The Critic is reviewing the outline...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            // Note: We use the generic 'critic' but the prompt frames it for TEXT
            const data = await callAgent('critic', "Review this OUTLINE for flow, logic, and missing hooks.", fullContext);

            const msg = data.swarm[0];
            const cleanContent = cleanJson(msg.content);

            setHistory(prev => [...prev, {
                ...msg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Critic',
                type: 'critique'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 5: REFINE (Loop back to Scribe) ---
    const refineBlueprint = async (critiqueSelections) => {
        setLoading(true);
        setCurrentPhase('scribe');
        setStatusMessage('The Scribe is revising the outline...');

        const isAutoPilot = Object.keys(critiqueSelections).length === 0;
        let feedback = isAutoPilot ? "AUTO-FIX: Resolve all high severity issues." : JSON.stringify(critiqueSelections);

        const contextString = `CRITICAL FEEDBACK: ${feedback}\nTASK: Adjust the outline structure accordingly.`;

        try {
            const data = await callAgent('scribe', "Refine the outline.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Scribe',
                type: 'blueprint'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 6: PUBLISHER (Final Write) ---
    const compileManuscript = async () => {
        setLoading(true);
        setCurrentPhase('publisher');
        setStatusMessage('The Publisher is writing the final draft...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('publisher', "Write the full final content based on the approved outline.", fullContext);

            const msg = data.swarm[0];
            const cleanContent = cleanJson(msg.content);

            setHistory(prev => [...prev, {
                ...msg,
                content: cleanContent,
                text: cleanContent,
                role: 'The Publisher',
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
            const data = await callAgent('manager', "Direct the Text Swarm based on feedback.", contextString);

            const decision = JSON.parse(cleanJson(data.swarm[0].content));
            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // Pivot Logic (Manager can move us back)
            if (decision.target_phase === 'editor') startMission(userText);
            if (decision.target_phase === 'linguist') submitChoices(contextData.strategy);

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
        sendToAudit,
        refineBlueprint,
        compileManuscript,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode
    };
};
