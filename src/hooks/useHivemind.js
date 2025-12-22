import { useState, useEffect } from 'react';

export const useHivemind = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'vision', 'blueprint', 'critique', 'done'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextData, setContextData] = useState({}); // Stores user choices

    // --- KEY MANAGEMENT (Self-Healing) ---
    // User Manual Input (localStorage) > Environment Variables (initialKeys)
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    // --- HELPER: CALL API (Targeted) ---
    const callAgent = async (agentId, prompt, context = "", extraPayload = {}) => {
        const effectiveKeys = getEffectiveKeys();

        // Simple validation to prevent "Agent Offline" before we even start
        // Visionary usually uses OpenAI or Gemini.
        if (!effectiveKeys.openai && !effectiveKeys.gemini) {
            throw new Error("No API Keys found. Please add an OpenAI or Gemini key in Settings.");
        }

        const response = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                targetAgentId: agentId, // <--- TARGET SPECIFIC AGENT
                context, // Pass history so they know what happened before
                keys: effectiveKeys, // Send the resolved keys
                ...extraPayload
            })
        });

        if (!response.ok) {
            // Try to parse error details
            let errMsg = "Agent Unreachable";
            try {
                const errData = await response.json();
                errMsg = errData.error || errMsg;
            } catch (e) { }
            throw new Error(errMsg);
        }

        return await response.json();
    };

    // --- STEP 1: VISION (Start) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('vision');
        setStatusMessage('The Visionary is analyzing your request...');
        setContextData({ originalPrompt: userPrompt });

        try {
            // Call Visionary Only
            const data = await callAgent('visionary', userPrompt);
            const msg = data.swarm[0];

            // Add to history
            setHistory([{ ...msg, text: msg.content, role: 'The Visionary', type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: SPECS (Tech Lead) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('specs'); // <--- NEW PHASE
        setStatusMessage('The Tech Lead is defining specifications...');

        // Save strategy choices
        const newContext = { ...contextData, strategy: choices }; // Store explicitly as strategy
        setContextData(newContext);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        STRATEGY CHOICES: ${JSON.stringify(choices)}
        `;

        try {
            // CALL TECH LEAD
            const data = await callAgent('tech_lead',
                "Define technical specs based on this strategy.",
                contextString
            );
            const msg = data.swarm[0];
            setHistory(prev => [...prev, {
                ...msg,
                text: msg.content,
                role: 'The Tech Lead',
                type: 'spec_options' // <--- NEW TYPE
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: BLUEPRINT (Architect) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');
        setStatusMessage('The Architect is drafting the blueprint...');

        // Save spec choices
        const newContext = { ...contextData, specs };
        setContextData(newContext);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        STRATEGY CHOICES: ${JSON.stringify(newContext.strategy)}
        TECHNICAL SPECS: ${JSON.stringify(specs)}
        `;

        try {
            // CALL ARCHITECT
            const data = await callAgent('architect',
                "Generate the File Structure and Core Code based on these specs.",
                contextString
            );
            const msg = data.swarm[0];
            setHistory(prev => [...prev, {
                ...msg,
                text: msg.content,
                role: 'The Architect',
                type: 'blueprint'
            }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: CRITIC (Audit) ---
    const sendToAudit = async () => {
        setLoading(true);
        setCurrentPhase('critique');
        setStatusMessage('The Critic is reviewing the code...');

        // Compile previous history as context
        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('critic', "Review this blueprint for flaws.", fullContext);
            const msg = data.swarm[0];
            setHistory(prev => [...prev, { ...msg, text: msg.content, role: 'The Critic', type: 'critique' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 4: COMPILE (Executive) ---
    const compileBuild = async () => {
        setLoading(true);
        setCurrentPhase('done');
        setStatusMessage('Compiling final build... Please wait.');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('executive', "Finalize build.", fullContext, { mode: 'synthesize' });
            const msg = data.swarm[0];
            setHistory(prev => [...prev, { ...msg, text: msg.content, role: 'The Executive', type: 'final' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return {
        history,
        currentPhase,
        loading,
        statusMessage,
        startMission,
        submitChoices,
        submitSpecs, // <--- Exported
        sendToAudit,
        compileBuild
    };
};
