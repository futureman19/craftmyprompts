import { useState } from 'react';

export const useArtHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Context Retention
    const [contextData, setContextData] = useState({});

    // Image Generation State
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
        if (!effectiveKeys.openai && !effectiveKeys.gemini) {
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
                    category: 'art'
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

    // --- PHASE 1: THE MUSE (Strategy) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('strategy');
        setStatusMessage('The Muse is dreaming up concepts...');

        // CRITICAL: Save the original User Prompt for the end
        setContextData({ originalPrompt: userPrompt });

        try {
            const data = await callAgent('muse', `User Idea: "${userPrompt}". Generate creative concepts.`);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory([{
                ...rawMsg,
                content: cleanContent,
                role: 'The Muse',
                type: 'strategy_options'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 2: THE STYLIST (Specs) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('spec');
        setStatusMessage('The Stylist is defining the palette...');

        const updatedContext = { ...contextData, strategy_choice: choices };
        setContextData(updatedContext);

        try {
            const contextString = `
                ORIGINAL IDEA: ${updatedContext.originalPrompt}
                CHOSEN CONCEPT: ${choices}
            `;
            const data = await callAgent('stylist', "Define materials, lighting, and palette.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                role: 'The Stylist',
                type: 'spec_options'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 3: THE CINEMATOGRAPHER (Blueprint) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');
        setStatusMessage('The Cinematographer is composing the shot...');

        const updatedContext = { ...contextData, visual_specs: specs };
        setContextData(updatedContext);

        try {
            const contextString = `
                ORIGINAL IDEA: ${updatedContext.originalPrompt}
                CONCEPT: ${updatedContext.strategy_choice}
                VISUAL SPECS: ${specs}
            `;
            const data = await callAgent('cinematographer', "Build the visual blueprint.", contextString);

            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);

            setHistory(prev => [...prev, {
                ...rawMsg,
                content: cleanContent,
                role: 'The Cinematographer',
                type: 'blueprint'
            }]);
        } catch (e) {
            setStatusMessage(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- PHASE 4: GENERATION (Final) ---
    const generateImage = async (technicalSpecs) => {
        setIsGeneratingImage(true);
        setStatusMessage('Developing Masterpiece...');

        try {
            // FIX: Construct the FULL prompt including the original User Input
            const fullPrompt = `${contextData.originalPrompt}. ${contextData.strategy_choice}, ${contextData.visual_specs}. Aspect Ratio: ${technicalSpecs.aspect_ratio || '1:1'}`;

            setCurrentPhase('final');

            // Simulate Generation Delay
            await new Promise(r => setTimeout(r, 2000));

            setHistory(prev => [...prev, {
                role: 'The Gallery',
                type: 'final',
                content: JSON.stringify({
                    final_prompt: fullPrompt, // Passing the corrected full prompt
                    publication_summary: "Image Generation Complete."
                })
            }]);

            // Mock Image URL (In a real app, this comes from the API)
            // Using the fullPrompt now for better context in the placeholder
            setGeneratedImage(`https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true`);

        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingImage(false);
            setLoading(false);
            setStatusMessage('');
        }
    };

    // --- MANAGER FEEDBACK ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;

        // 1. Show User Message immediately
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setLoading(true);

        try {
            // 2. Ask Manager what to do
            const contextString = `
                Current Phase: ${currentPhase}
                Current Prompt: ${contextData.originalPrompt}
                User Feedback: ${userText}
            `;

            const data = await callAgent('manager', "Analyze feedback and direct the swarm.", contextString);
            const decision = JSON.parse(cleanJson(data.swarm[0].content));

            // 3. Show Manager Reply
            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // 4. EXECUTE THE PIVOT
            if (decision.target_phase && decision.revised_prompt) {

                // CASE A: User changed the CORE IDEA (Back to Start)
                if (decision.target_phase === 'strategy' || decision.target_phase === 'muse') {
                    console.log("Manager Pivoting Strategy to:", decision.revised_prompt);
                    // CRITICAL: Overwrite the original prompt in state
                    setContextData(prev => ({ ...prev, originalPrompt: decision.revised_prompt }));
                    // Restart Muse with new prompt
                    await startMission(decision.revised_prompt);
                }

                // CASE B: User changed the STYLE (Re-run Stylist)
                else if (decision.target_phase === 'spec' || decision.target_phase === 'stylist') {
                    console.log("Manager Pivoting Specs to:", decision.revised_prompt);
                    // Update context
                    setContextData(prev => ({ ...prev, strategy_choice: decision.revised_prompt }));
                    // Restart Stylist
                    await submitChoices(decision.revised_prompt);
                }
            }

        } catch (e) {
            console.error("Manager Error:", e);
            setManagerMessages(prev => [...prev, { role: 'assistant', content: "I couldn't reach the agent network. Please try again." }]);
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
        generateImage,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        generatedImage,
        isGeneratingImage
    };
};
