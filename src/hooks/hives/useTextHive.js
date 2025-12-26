import { useState } from 'react';

export const useTextHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // strategy, spec, blueprint, final
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Context Retention
    const [contextData, setContextData] = useState({});

    // Manager Drawer State
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // --- KEY MANAGEMENT ---
    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    // --- API HELPER ---
    const callAgent = async (agentId, prompt, context = "") => {
        const effectiveKeys = getEffectiveKeys();
        // Allow Gemini OR OpenAI
        if (!effectiveKeys.openai && !effectiveKeys.gemini && !effectiveKeys.anthropic) {
            throw new Error("No API Keys found. Please add them in Settings.");
        }

        try {
            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    targetAgentId: agentId,
                    context,
                    keys: effectiveKeys,
                    category: 'text'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Agent Unreachable");
            }

            return await response.json();
        } catch (e) {
            console.error("Agent Call Failed:", e);
            throw e;
        }
    };

    const cleanJson = (text) => {
        if (!text) return "";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    // --- PHASE 1: THE EDITOR (Strategy) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('strategy');
        setStatusMessage('The Editor-in-Chief is devising a strategy...');

        // CRITICAL: Save original prompt
        setContextData({ originalPrompt: userPrompt });

        try {
            const data = await callAgent('editor', `Topic: "${userPrompt}". Develop a content strategy.`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory([{
                ...rawMsg,
                content: cleanContent,
                role: 'The Editor',
                type: 'strategy_options'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 2: THE LINGUIST (Voice) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('spec');
        setStatusMessage('The Linguist is fine-tuning the voice...');

        // choices = "Format: ..., Angle: ..., Tone: ..."
        const updatedContext = { ...contextData, strategy_choice: choices };
        setContextData(updatedContext);

        try {
            const contextString = `
                TOPIC: ${updatedContext.originalPrompt}
                STRATEGY: ${choices}
            `;
            const data = await callAgent('linguist', "Define the vocabulary, structure, and rhetoric.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                role: 'The Linguist',
                type: 'spec_options'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 3: THE SCRIBE (Manuscript) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');
        setStatusMessage('The Scribe is drafting the manuscript...');

        // specs = "Vocab: ..., Structure: ..., Rhetoric: ..."
        const updatedContext = { ...contextData, voice_spec: specs };
        setContextData(updatedContext);

        try {
            const contextString = `
                TOPIC: ${updatedContext.originalPrompt}
                STRATEGY: ${updatedContext.strategy_choice}
                VOICE: ${specs}
            `;
            // Note: Ensure you have a 'scribe' agent configured in backend, or use 'writer'
            const data = await callAgent('writer', "Write the full manuscript based on these specs.", contextString);

            const rawMsg = data.swarm[0];
            // The Scribe usually returns markdown/text, but if it returns JSON, parse it.
            // For safety, let's assume it returns JSON with a 'manuscript' field or raw text.
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                role: 'The Scribe',
                type: 'blueprint'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 4: PUBLICATION (Final) ---
    const compileManuscript = async () => {
        setLoading(true);
        setCurrentPhase('final');
        setStatusMessage('Finalizing publication...');

        // In a real app, we might run a final polish pass here. 
        // For now, we take the manuscript and "Publish" it.
        // We find the last message (the manuscript) to pass to the final view.

        try {
            await new Promise(r => setTimeout(r, 1500)); // Simulate processing

            const lastMsg = history[history.length - 1];
            let textContent = "";
            try {
                const parsed = JSON.parse(lastMsg.content);
                textContent = parsed.manuscript || parsed.content || parsed.text;
            } catch {
                textContent = lastMsg.content;
            }

            setHistory(prev => [...prev, {
                role: 'Publisher',
                type: 'final',
                content: JSON.stringify({
                    final_text: textContent,
                    publication_summary: "Draft Published."
                })
            }]);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // --- MANAGER FEEDBACK ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;

        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setLoading(true);

        try {
            const contextString = `
                Current Phase: ${currentPhase}
                Original Topic: ${contextData.originalPrompt}
                User Feedback: ${userText}
            `;

            const data = await callAgent('manager', "Analyze feedback and direct the swarm.", contextString);
            const decision = JSON.parse(cleanJson(data.swarm[0].content));

            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // EXECUTE THE PIVOT
            if (decision.target_phase && decision.revised_prompt) {

                // CASE A: User changed the TOPIC (Restart Editor)
                if (decision.target_phase === 'strategy' || decision.target_phase === 'editor') {
                    // Update Context
                    setContextData(prev => ({ ...prev, originalPrompt: decision.revised_prompt }));
                    // Restart Mission
                    await startMission(decision.revised_prompt);
                }

                // CASE B: User changed the VOICE (Restart Linguist)
                else if (decision.target_phase === 'spec' || decision.target_phase === 'linguist') {
                    // Update Context
                    setContextData(prev => ({ ...prev, strategy_choice: decision.revised_prompt }));
                    // Restart Linguist
                    await submitChoices(decision.revised_prompt);
                }
            }

        } catch (e) {
            console.error("Manager Error:", e);
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
        compileManuscript,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback
    };
};
