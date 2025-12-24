import { useState, useEffect } from 'react';

export const useVideoHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'concept', 'specs', 'rendering', 'done'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Implicit Mode
    const mode = 'video';

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
                category: 'video', // NEW: Category routing
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

    // --- STEP 1: CONCEPT (The Producer) ---
    const startMission = async (userPrompt) => {
        console.log("🚀 Starting Video Mission:", { prompt: userPrompt });

        setLoading(true);
        setHistory([]);
        setCurrentPhase('concept');

        const role = 'The Producer';
        const id = 'producer';

        setStatusMessage(`${role} is pitching concepts...`);
        setContextData({ originalPrompt: userPrompt, mode: 'video' });

        try {
            const data = await callAgent(id, userPrompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'concept_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: SPECS (The Director) ---
    const submitConcept = async (concept) => {
        setLoading(true);
        setCurrentPhase('specs');

        const role = 'The Director';
        const id = 'director';

        setStatusMessage(`${role} is directing the shot...`);
        const newContext = { ...contextData, concept };
        setContextData(newContext);

        const contextString = `ORIGINAL REQUEST: "${newContext.originalPrompt}"\nCHOSEN CONCEPT: ${JSON.stringify(concept)}`;

        try {
            const data = await callAgent(id, "Define the visual style, camera, and lighting.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: RENDERING (The VFX Artist) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('rendering');

        const role = 'The VFX Artist';
        const id = 'vfx';

        setStatusMessage(`${role} is synthesizing the final prompt...`);

        const newContext = { ...contextData, specs };
        setContextData(newContext);

        const contextString = `
        ORIGINAL REQUEST: "${newContext.originalPrompt}"
        CONCEPT: ${JSON.stringify(newContext.concept)}
        VISUAL SPECS: ${JSON.stringify(specs)}
        `;

        try {
            const data = await callAgent(id, "Synthesize the final video generation prompt.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'final' }]);

        } catch (e) { console.error(e); }
        finally {
            setLoading(false);
            setCurrentPhase('done');
        }
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

            // Pivot Logic
            if (decision.target_phase === 'specs') {
                setStatusMessage("Manager: Rewinding to Visual Specs...");
                const updatedConcept = { ...contextData.concept, _refinement: decision.refined_instruction };
                await submitConcept(updatedConcept);
            }
            else if (decision.target_phase === 'rendering') {
                setStatusMessage("Manager: Updating VFX...");
                const updatedSpecs = { ...contextData.specs, _refinement: decision.refined_instruction };
                await submitSpecs(updatedSpecs);
            }
            else if (decision.target_phase === 'concept') {
                setStatusMessage("Manager: Rebooting Concept...");
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
        submitConcept,
        submitSpecs,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode
    };
};
