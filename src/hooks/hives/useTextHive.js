import { useState, useEffect } from 'react';

export const useTextHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'vision', 'spec', 'blueprint', 'critique', 'done'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Implicit Mode
    const mode = 'text';

    // --- HELPER: CLEAN JSON (Strip Markdown) ---
    const cleanJson = (text) => {
        if (!text) return "";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    // --- KEY MANAGEMENT (Self-Healing) ---
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    // --- HELPER: CALL API (Targeted) ---
    const callAgent = async (agentId, prompt, context = "", extraPayload = {}) => {
        const effectiveKeys = getEffectiveKeys();

        if (!effectiveKeys.openai && !effectiveKeys.gemini) {
            throw new Error("No API Keys found. Please add an OpenAI or Gemini key in Settings.");
        }

        const response = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                targetAgentId: agentId,
                context,
                keys: effectiveKeys,
                ...extraPayload
            })
        });

        if (!response.ok) {
            let errMsg = "Agent Unreachable";
            try {
                const errData = await response.json();
                errMsg = errData.error || errMsg;
            } catch (e) { }
            throw new Error(errMsg);
        }

        return await response.json();
    };

    // --- STEP 1: VISION (The Editor-in-Chief) ---
    const startMission = async (userPrompt) => {
        console.log("🚀 Starting Text Mission:", { prompt: userPrompt });

        setLoading(true);
        setHistory([]);
        setCurrentPhase('vision');

        const role = 'The Editor-in-Chief';
        const id = 'editor';

        setStatusMessage(`${role} is analyzing your request...`);
        setContextData({ originalPrompt: userPrompt, mode: 'text' });

        try {
            const data = await callAgent(id, userPrompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: SPECS (The Linguist) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('specs');

        const role = 'The Linguist';
        const id = 'linguist';

        setStatusMessage(`${role} is creating the style guide...`);
        const newContext = { ...contextData, strategy: choices };
        setContextData(newContext);
        const contextString = `ORIGINAL PROMPT: "${newContext.originalPrompt}"\nSTRATEGY CHOICES: ${JSON.stringify(choices)}`;

        try {
            const data = await callAgent(id, "Define tone, voice, and style based on this strategy.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: BLUEPRINT (The Scribe) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');

        const role = 'The Scribe';
        const id = 'scribe';

        setStatusMessage(`${role} is drafting the content...`);

        const newContext = { ...contextData, specs };
        setContextData(newContext);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        STRATEGY CHOICES: ${JSON.stringify(newContext.strategy)}
        TECHNICAL SPECS: ${JSON.stringify(specs)}
        `;

        try {
            const data = await callAgent(id, "Generate the content draft based on these specs.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'blueprint' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 4: CRITIC (Audit) ---
    const sendToAudit = async () => {
        setLoading(true);
        setCurrentPhase('critique');
        setStatusMessage('The Critic is reviewing for tone and clarity...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('critic', "Review this content draft for tone, clarity, and consistency.", fullContext);
            const msg = data.swarm[0];
            setHistory(prev => [...prev, { ...msg, text: msg.content, role: 'The Critic', type: 'critique' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 5: FINAL (Instant Publish) ---
    const compileBuild = async () => {
        setLoading(true);
        setStatusMessage('Finalizing content...');

        const finalEntry = {
            role: 'The Publisher',
            content: 'Content finalized.',
            text: 'Content finalized.',
            type: 'final',
            timestamp: Date.now()
        };

        // NO TIMEOUT. Update History AND Phase in the same cycle.
        setHistory(prev => [...prev, finalEntry]);
        setCurrentPhase('done');
        setLoading(false);
    };

    // --- SWARM OPS: MANAGER FEEDBACK ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;

        const userMsg = { role: 'user', content: userText };
        setManagerMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const contextString = `Current Phase: ${currentPhase}\nUser Request: ${userText}`;
            const data = await callAgent('manager', "Analyze feedback and direct the swarm.", contextString);
            const decision = JSON.parse(cleanJson(data.swarm[0].content));

            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            if (decision.target_phase === 'specs') {
                setStatusMessage("Manager: Rewinding to Tone Calibration...");
                const updatedStrategy = { ...contextData.strategy, _refinement: decision.refined_instruction };
                await submitChoices(updatedStrategy);
            }
            else if (decision.target_phase === 'blueprint') {
                setStatusMessage("Manager: Updating Content Draft...");
                const updatedSpecs = { ...contextData.specs, _refinement: decision.refined_instruction };
                await submitSpecs(updatedSpecs);
            }
            else if (decision.target_phase === 'vision') {
                setStatusMessage("Manager: Rebooting Strategy...");
                startMission(contextData.originalPrompt + " " + decision.refined_instruction);
            }

        } catch (e) {
            console.error(e);
            setManagerMessages(prev => [...prev, { role: 'assistant', content: "Error: I couldn't process that request." }]);
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
        compileBuild,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode
    };
};
