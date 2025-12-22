import { useState } from 'react';

export const useHivemind = (apiKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]); // The Storyline
    const [status, setStatus] = useState('idle'); // 'idle', 'running', 'paused'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- HELPER: CALL API ---
    const callSwarmNode = async (payload) => {
        const response = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payload,
                keys: apiKeys
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Hivemind Node Failure");
        }
        return await response.json();
    };

    // --- ACTION 1: START MISSION ---
    const startMission = async (prompt) => {
        setLoading(true);
        setError(null);
        setHistory([]);
        setStatus('running');
        setStatusMessage('The Boardroom is convening...');

        try {
            // 1. Initial Broadcast
            const data = await callSwarmNode({
                prompt,
                category: 'code' // Hardcoded for now per requirements
            });

            // Map backend 'content' to frontend 'text'
            const newEvents = (data.swarm || []).map(agent => ({
                ...agent,
                text: agent.content,
                provider: 'swarm'
            }));

            setHistory(newEvents);
            setStatusMessage('Initial architecture complete. Awaiting review.');

        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTION 2: REFINE (Loop) ---
    const refineLoop = async (userFeedback) => {
        if (!userFeedback) return;
        setLoading(true);
        setStatusMessage('The Architect is revising the blueprints...');

        try {
            // Send feedback to specific agent (Architect)
            const data = await callSwarmNode({
                prompt: `USER FEEDBACK: ${userFeedback}\n\nTASK: Update the file structure/plan based on this feedback.`,
                targetAgentId: 'architect',
                // Pass context so Architect knows what to fix
                context: history.map(m => `[${m.role}]: ${m.text}`).join('\n')
            });

            const update = data.swarm[0];
            setHistory(prev => [...prev, { ...update, text: update.content, provider: 'swarm' }]);
            setStatusMessage('Revision complete.');

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTION 3: COMPILE (Executive) ---
    const compileBuild = async () => {
        setLoading(true);
        setStatusMessage('Compiling build... Please wait.'); // <--- Specific text requested

        try {
            // Trigger the Executive (Synthesize Mode)
            const data = await callSwarmNode({
                prompt: "FINAL BUILD INSTRUCTION",
                mode: 'synthesize',
                context: history.map(m => `[${m.role}]: ${m.text}`).join('\n')
            });

            const build = data.swarm[0];
            setHistory(prev => [...prev, { ...build, text: build.content, role: 'The Executive', provider: 'swarm' }]);
            setStatusMessage('Build ready for deployment.');

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        history,
        loading,
        error,
        statusMessage,
        startMission,
        refineLoop,
        compileBuild
    };
};
