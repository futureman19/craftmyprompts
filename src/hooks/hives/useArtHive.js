import { useState } from 'react';

export const useArtHive = (initialKeys = {}) => {
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle');
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
        if (!keys.openai && !keys.gemini && !keys.anthropic && !keys.groq) throw new Error("No API Keys found.");
        const res = await fetch('/api/swarm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, targetAgentId: agentId, context, keys })
        });
        if (!res.ok) throw new Error("Agent Connection Failed");
        return await res.json();
    };

    // 1. VISION (Muse)
    const startMission = async (prompt) => {
        setLoading(true); setCurrentPhase('vision'); setStatusMessage('The Muse is brainstorming...');
        setContextData({ originalPrompt: prompt });
        try {
            const data = await callAgent('muse', prompt);
            setHistory([{ ...data.swarm[0], role: 'The Muse', type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); } finally { setLoading(false); }
    };

    // 2. SPECS (Cinematographer)
    const submitChoices = async (choices) => {
        setLoading(true); setCurrentPhase('specs'); setStatusMessage('The Cinematographer is analyzing...');
        setContextData(prev => ({ ...prev, vision_choices: choices }));
        try {
            const data = await callAgent('cinematographer', "Generate technical specs.", `USER VISION: ${JSON.stringify(choices)}`);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Cinematographer', type: 'spec_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // 3. MIMIC (New)
    const submitSpecs = async (specs) => {
        setLoading(true); setCurrentPhase('mimic'); setStatusMessage('The Mimic is curating styles...');
        setContextData(prev => ({ ...prev, spec_choices: specs }));
        try {
            const context = `VISION: ${JSON.stringify(contextData.vision_choices)}\nSPECS: ${JSON.stringify(specs)}`;
            const data = await callAgent('mimic', "Suggest artistic influences.", context);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Mimic', type: 'mimic_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // 4. MAVERICK (Chaos)
    const submitMimic = async (mimicSelections) => {
        setLoading(true); setCurrentPhase('maverick'); setStatusMessage('The Maverick is finding wildcards...');
        setContextData(prev => ({ ...prev, mimic_choices: mimicSelections }));
        try {
            const context = `VISION: ${JSON.stringify(contextData.vision_choices)}\nSTYLES: ${JSON.stringify(mimicSelections)}`;
            const data = await callAgent('maverick', "Inject creative chaos.", context);
            setHistory(prev => [...prev, { ...data.swarm[0], role: 'The Maverick', type: 'maverick_options' }]);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // 5. TECHNICAL (Manual - No Agent Call)
    const submitMaverick = async (maverickChoices) => {
        // No loading state, just switching UI to Tech Deck
        setContextData(prev => ({ ...prev, maverick_choices: maverickChoices }));
        setCurrentPhase('technical');
        setStatusMessage('Configure Render Parameters...');
    };

    // 6. RENDER FINAL
    const renderFinal = async (technicalSpecs) => {
        setLoading(true); setCurrentPhase('done'); setStatusMessage('The Gallery is finalizing...');

        try {
            // Include Tech Specs in the history for the Gallery Agent
            const fullContext = {
                vision: contextData.vision_choices,
                specs: contextData.spec_choices,
                styles: contextData.mimic_choices,
                chaos: contextData.maverick_choices,
                technical: technicalSpecs // e.g. { ratio: "16:9", model: "Midjourney" }
            };

            const promptContext = `FULL MANIFEST: ${JSON.stringify(fullContext)}`;
            const agentData = await callAgent('gallery', "Generate final prompts.", promptContext);

            // Extract Clean Prompt
            let cleanPrompt = "";
            try {
                const raw = agentData.swarm[0].content;
                const json = JSON.parse(raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
                cleanPrompt = json.clean_prompt || json.final_prompt;
            } catch (e) { console.error("Prompt Parse Error", e); }

            // Generate Image
            setStatusMessage(`Rendering with ${technicalSpecs.model || 'Google'}...`);
            const keys = getEffectiveKeys();
            const googleKey = keys.gemini || keys.google;

            // Pass aspect ratio from Technical Specs
            const imgRes = await fetch('/api/imagine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: cleanPrompt,
                    apiKey: googleKey,
                    aspectRatio: technicalSpecs.ratio || "16:9",
                    modelId: technicalSpecs.modelId // <--- PASS THE ID HERE
                })
            });

            if (!imgRes.ok) throw new Error("Image Gen Failed");
            const imgData = await imgRes.json();

            setHistory(prev => [...prev, { ...agentData.swarm[0], role: 'The Gallery', type: 'final', generatedImage: imgData.image }]);

        } catch (e) { console.error(e); setStatusMessage(`Error: ${e.message}`); } finally { setLoading(false); }
    };

    // Manager
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;
        setManagerMessages(prev => [...prev, { role: 'user', content: userText }]);
        if (setInput) setInput('');
        // ... (existing manager logic)
    };

    return {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, submitMimic, submitMaverick, renderFinal,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback, mode
    };
};
