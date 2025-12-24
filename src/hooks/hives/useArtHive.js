import { useState, useEffect } from 'react';

export const useArtHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'muse', 'stylist', 'cinematographer', 'critic', 'gallery'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextData, setContextData] = useState({});
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // NEW: Image Generation State
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // Implicit Mode
    const mode = 'art';

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
        if (!effectiveKeys.openai && !effectiveKeys.gemini) {
            throw new Error("No API Keys found.");
        }

        const response = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                targetAgentId: agentId,
                context,
                keys: effectiveKeys,
                category: 'art', // Ensures we use the Art Squad
                ...extraPayload
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Agent Unreachable");
        }

        return await response.json();
    };

    // --- STEP 1: THE MUSE (Strategy) ---
    const startMission = async (userPrompt) => {
        setLoading(true);
        setHistory([]);
        setCurrentPhase('muse');

        const role = 'The Muse';
        const id = 'muse';

        setStatusMessage(`${role} is curating aesthetics...`);

        // 1. Detect Context (Avatar vs General)
        const isAvatar = /avatar|character|person|portrait|face|girl|boy|man|woman/i.test(userPrompt);
        const contextType = isAvatar ? "AVATAR/CHARACTER" : "GENERAL/SCENERY";

        setContextData({ originalPrompt: userPrompt, contextType, mode: 'art' });

        // 2. Add Context to Prompt
        const augmentedPrompt = `USER REQUEST: "${userPrompt}"\nCONTEXT: ${contextType}`;

        try {
            const data = await callAgent(id, augmentedPrompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'strategy_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: THE STYLIST (Specs) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('stylist');

        const role = 'The Stylist';
        const id = 'stylist';

        setStatusMessage(`${role} is defining the palette...`);

        // 1. Detect Auto-Pilot
        const isAutoPilot = Object.keys(choices).length === 0;

        // 2. Formulate Context
        let contextString = `ORIGINAL PROMPT: "${contextData.originalPrompt}"\nCONTEXT TYPE: ${contextData.contextType}\n`;

        if (isAutoPilot) {
            contextString += `MUSE STRATEGY: AUTO-PILOT. The user trusts your judgment. Pick the best aesthetic combination.`;
        } else {
            // Convert Array selections to readable strings
            const formattedChoices = Object.entries(choices).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n');
            contextString += `MUSE STRATEGY CHOICES:\n${formattedChoices}`;
        }

        const newContext = { ...contextData, strategy: choices };
        setContextData(newContext);

        try {
            const data = await callAgent(id, "Define visual specifications based on this strategy.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: THE CINEMATOGRAPHER (Blueprint) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('cinematographer');

        const role = 'The Cinematographer';
        const id = 'cinematographer';

        setStatusMessage(`${role} is framing the shot...`);

        const newContext = { ...contextData, specs };
        setContextData(newContext);

        // Handle Auto-Pilot for Specs
        const isAutoPilot = Object.keys(specs).length === 0;
        let specsString = isAutoPilot ? "AUTO-PILOT: Choose the best lighting and medium." : JSON.stringify(specs);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        CONTEXT TYPE: ${newContext.contextType}
        STYLE SPECS: ${specsString}
        `;

        try {
            const data = await callAgent(id, "Compose the scene layers and camera settings.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'blueprint' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 4: THE CRITIC (Audit) ---
    const sendToAudit = async () => {
        setLoading(true);
        setCurrentPhase('critic');
        setStatusMessage('The Critic is looking for artifacts...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('art_critic', "Review this composition for artifacts and logic errors.", fullContext);
            const msg = data.swarm[0];
            const cleanContent = cleanJson(msg.content);
            setHistory(prev => [...prev, { ...msg, content: cleanContent, text: cleanContent, role: 'The Critic', type: 'critique' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 5: LOOP BACK (Refine) ---
    const refineBlueprint = async (critiqueSelections) => {
        setLoading(true);
        setCurrentPhase('cinematographer');
        setStatusMessage('The Cinematographer is adjusting the frame...');

        const isAutoPilot = Object.keys(critiqueSelections).length === 0;

        let contextString = "";
        if (isAutoPilot) {
            contextString = `USER DECISION: AUTO-FIX. Resolve all HIGH severity visual risks immediately.`;
        } else {
            const feedbackList = Object.entries(critiqueSelections).map(([cat, val]) => `- ${cat}: ${val}`).join('\n');
            contextString = `CRITICAL FEEDBACK:\n${feedbackList}\nTASK: Adjust layers to fix these issues.`;
        }

        try {
            const data = await callAgent('cinematographer', "Refine the composition.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: 'The Cinematographer', type: 'blueprint' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 6: GENERATE (The Gallery + The Darkroom) ---
    // --- STEP 6: GENERATE (The Gallery + The Darkroom) ---
    // UPDATED: Now accepts technical overrides (aspect ratio, etc.)
    const generateImage = async (technicalOverrides = {}) => {
        setLoading(true);
        setCurrentPhase('gallery');
        setStatusMessage('Synthesizing final prompt...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            // A. Call Gallery Agent (Text)
            const data = await callAgent('gallery', "Create the final optimized prompt.", fullContext);
            const msg = data.swarm[0];
            const cleanContent = cleanJson(msg.content);

            // Save text history immediately
            setHistory(prev => [...prev, { ...msg, content: cleanContent, role: 'The Gallery', type: 'final' }]);

            // B. Call Darkroom (Image)
            const parsedData = JSON.parse(cleanContent);

            if (parsedData.final_prompt) {
                setLoading(false); // Text is done
                setIsGeneratingImage(true); // Image starts
                setStatusMessage("Developing image in Darkroom...");

                const keys = getEffectiveKeys();

                // Merge Agent defaults with User overrides
                // Note: overrides take precedence
                const finalAspectRatio = technicalOverrides.aspectRatio || "1:1";
                const finalPersonGen = technicalOverrides.personGeneration || "allow_adult";

                const imgResponse = await fetch('/api/imagine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: parsedData.final_prompt,
                        apiKey: keys.gemini,
                        // Pass the new technical specs to the API
                        aspectRatio: finalAspectRatio,
                        personGeneration: finalPersonGen
                    })
                });

                const imgData = await imgResponse.json();

                if (!imgResponse.ok) throw new Error(imgData.error || "Image Generation Failed");

                setGeneratedImage(imgData.image);
                setStatusMessage("Masterpiece developed successfully.");
            }

        } catch (e) {
            console.error(e);
            setStatusMessage("Error: " + e.message);
        } finally {
            setLoading(false);
            setIsGeneratingImage(false);
        }
    };

    // --- MANAGER FEEDBACK (Pivot) ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        const userMsg = { role: 'user', content: userText };
        setManagerMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const contextString = `Current Phase: ${currentPhase}\nUser Request: ${userText}`;
            const data = await callAgent('manager', "Analyze feedback and direct the Art Swarm.", contextString);
            const decision = JSON.parse(cleanJson(data.swarm[0].content));

            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // Pivot Logic
            if (decision.target_phase === 'muse') {
                setStatusMessage("Manager: Pivoting Concept...");
                startMission(userText); // Restart with new idea
            } else if (decision.target_phase === 'stylist') {
                setStatusMessage("Manager: Adjusting Palette...");
                // Soft rewind to Stylist
                await submitChoices(contextData.strategy || {});
            }

        } catch (e) {
            console.error(e);
            setManagerMessages(prev => [...prev, { role: 'assistant', content: "I couldn't process that request." }]);
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
        generateImage,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode,
        // NEW EXPORTS
        generatedImage,
        isGeneratingImage
    };
};
