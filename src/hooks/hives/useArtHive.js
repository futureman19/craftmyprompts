import { useState } from 'react';

export const useArtHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // vision -> specs -> maverick -> blueprint -> done
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState({});

    // MANAGER STATE
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mode = 'art';

    const getEffectiveKeys = () => ({
        gemini: localStorage.getItem('gemini_key') || initialKeys.gemini || '',
        openai: localStorage.getItem('openai_key') || initialKeys.openai || '',
        anthropic: localStorage.getItem('anthropic_key') || initialKeys.anthropic || '',
        groq: localStorage.getItem('groq_key') || initialKeys.groq || ''
    });

    const callAgent = async (agentId, prompt, context = "") => {
        const keys = getEffectiveKeys();
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
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('The Muse is brainstorming...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('muse', prompt);
            setHistory([{ ...data.swarm[0], role: 'The Muse', type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- PHASE 2: SPECS (Cinematographer) ---
    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Cinematographer is choosing lenses...');
        setContextData(prev => ({ ...prev, vision_choices: choices }));

        const contextStr = `USER VISION: ${JSON.stringify(choices)}`;

        try {
            const data = await callAgent('cinematographer', "Generate technical specs.", contextStr);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Cinematographer', type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 3: MAVERICK (Chaos Engine) ---
    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('maverick'); setStatusMessage('The Maverick is finding wildcards...');
        setContextData(prev => ({ ...prev, spec_choices: specs }));

        const contextStr = `
        VISION: ${JSON.stringify(contextData.vision_choices)}
        SPECS: ${JSON.stringify(specs)}
        `;

        try {
            const data = await callAgent('maverick', "Inject creative chaos.", contextStr);
            // INJECT ROLE SO FEED FINDS IT
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Maverick', type: 'maverick_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 4: BLUEPRINT (Stylist) ---
    const refineBlueprint = async (maverickChoices) => {
        setLoading(true); setCurrentPhase('blueprint'); setStatusMessage('The Stylist is composing...');

        // Pass the wildcards to the Stylist
        const chaos = maverickChoices && maverickChoices.length > 0
            ? `INTEGRATE WILDCARDS: ${JSON.stringify(maverickChoices)}`
            : "No wildcards added.";

        const contextStr = `
        VISION: ${JSON.stringify(contextData.vision_choices)}
        SPECS: ${JSON.stringify(contextData.spec_choices)}
        ${chaos}
        `;

        try {
            const data = await callAgent('stylist', "Create final composition.", contextStr);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Stylist', type: 'blueprint' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- PHASE 5: FINAL (Gallery) ---
    // --- PHASE 5: FINAL (Gallery + Imagine) ---
    const renderFinal = async () => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('The Gallery is crafting the prompt...');

        try {
            // 1. Get the Prompt
            const fullHistory = history.map(m => `${m.role}: ${m.content}`).join('\n');
            const agentData = await callAgent('gallery', "Generate final prompts.", fullHistory);

            // Parse the response to get the clean prompt
            let cleanPrompt = "";
            try {
                const raw = agentData.swarm[0].content;
                const json = JSON.parse(raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
                cleanPrompt = json.clean_prompt || json.final_prompt;
            } catch (e) { console.error("Prompt Parse Error", e); }

            if (!cleanPrompt) throw new Error("Failed to generate prompt text.");

            // 2. Generate the Image (The "Hands")
            setStatusMessage('Igniting Google Imagen Engine...');
            const keys = getEffectiveKeys();

            const imgRes = await fetch('/api/imagine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: cleanPrompt,
                    apiKey: keys.gemini, // Use Gemini Key for Imagen
                    aspectRatio: "16:9" // Default to cinematic
                })
            });

            if (!imgRes.ok) throw new Error("Image Generation failed.");
            const imgData = await imgRes.json();

            // 3. Save EVERYTHING to History
            // We attach the 'generatedImage' property to the agent's message
            setHistory(prev => [...prev, {
                ...agentData.swarm[0],
                role: 'The Gallery',
                type: 'final',
                generatedImage: imgData.image // <--- The Base64 string
            }]);

        } catch (e) {
            console.error(e);
            // If image fails, still show the text message so user isn't blank
            setStatusMessage("Rendering failed, but prompt is saved.");
        }
        finally { setLoading(false); }
    };

    // --- MANAGER ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        if (setInput) setInput('');
        setLoading(true);
        try {
            setManagerMessages(prev => [...prev, { role: 'assistant', content: `Acknowledged: "${userText}"` }]);
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
