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
    // Merge props with localStorage to guarantee we find a key if it exists
    const getEffectiveKeys = () => ({
        gemini: initialKeys.gemini || localStorage.getItem('gemini_key') || '',
        openai: initialKeys.openai || localStorage.getItem('openai_key') || '',
        anthropic: initialKeys.anthropic || localStorage.getItem('anthropic_key') || '',
        groq: initialKeys.groq || localStorage.getItem('groq_key') || ''
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

    // --- STEP 2: ARCHITECT (Build) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('blueprint');
        setStatusMessage('The Architect is drafting the blueprint...');

        // Save choices to context
        const newContext = { ...contextData, ...choices };
        setContextData(newContext);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        USER STRATEGY CHOICES: ${JSON.stringify(choices)}
        `;

        try {
            const data = await callAgent('architect',
                "Generate the File Structure and Core Code based on these choices.",
                contextString
            );
            const msg = data.swarm[0];
            setHistory(prev => [...prev, { ...msg, text: msg.content, role: 'The Architect', type: 'blueprint' }]);
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
        sendToAudit,
        compileBuild
    };
};
