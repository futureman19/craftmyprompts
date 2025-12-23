import { useState, useEffect } from 'react';

export const useCodingHive = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'vision', 'spec', 'blueprint', 'critique', 'done'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextData, setContextData] = useState({}); // Stores user choices
    const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '');
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Implicit Mode
    const mode = 'coding';

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

    // Helper to save GitHub Token
    const saveGithubToken = (token) => {
        setGithubToken(token);
        localStorage.setItem('github_token', token);
    };

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

    // --- STEP 1: VISION (The Visionary) ---
    const startMission = async (userPrompt) => {
        console.log("🚀 Starting Coding Mission:", { prompt: userPrompt });

        setLoading(true);
        setHistory([]);
        setCurrentPhase('vision');

        const role = 'The Visionary';
        const id = 'visionary';

        setStatusMessage(`${role} is analyzing your request...`);
        setContextData({ originalPrompt: userPrompt, mode: 'coding' });

        try {
            const data = await callAgent(id, userPrompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: SPECS (The Tech Lead) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('specs');

        const role = 'The Tech Lead';
        const id = 'tech_lead';

        setStatusMessage(`${role} is defining specifications...`);
        const newContext = { ...contextData, strategy: choices };
        setContextData(newContext);
        const contextString = `ORIGINAL PROMPT: "${newContext.originalPrompt}"\nSTRATEGY CHOICES: ${JSON.stringify(choices)}`;

        try {
            const data = await callAgent(id, "Define technical specs based on this strategy.", contextString);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory(prev => [...prev, { ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'spec_options' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 3: BLUEPRINT (The Architect) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');

        const role = 'The Architect';
        const id = 'architect';

        setStatusMessage(`${role} is drafting the blueprint...`);

        const newContext = { ...contextData, specs };
        setContextData(newContext);

        const contextString = `
        ORIGINAL PROMPT: "${newContext.originalPrompt}"
        STRATEGY CHOICES: ${JSON.stringify(newContext.strategy)}
        TECHNICAL SPECS: ${JSON.stringify(specs)}
        `;

        try {
            const data = await callAgent(id, "Generate detailed plan based on these specs.", contextString);
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
        setStatusMessage('The Critic is reviewing the code...');

        const fullContext = history.map(m => `${m.role}: ${m.text}`).join('\n\n');

        try {
            const data = await callAgent('critic', "Review this blueprint for flaws.", fullContext);
            const msg = data.swarm[0];
            setHistory(prev => [...prev, { ...msg, text: msg.content, role: 'The Critic', type: 'critique' }]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // --- STEP 5: COMPILE (The Executive) ---
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
                setStatusMessage("Manager: Rewinding to Specifications...");
                const updatedStrategy = { ...contextData.strategy, _refinement: decision.refined_instruction };
                await submitChoices(updatedStrategy);
            }
            else if (decision.target_phase === 'blueprint') {
                setStatusMessage("Manager: Updating Blueprint...");
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

    // --- ACTION: DEPLOY (GitHub) ---
    const deployToGithub = async (type, projectData) => {
        if (!githubToken) throw new Error("No GitHub Token provided.");

        let payload = {};

        if (type === 'create_gist') {
            const filesObj = {};

            projectData.files.forEach(f => {
                if (!f.path) return;
                const name = f.path.replace(/\//g, '_');
                const safeContent = (f.content && f.content.trim().length > 0) ? f.content : '// Empty file';
                filesObj[name] = { content: safeContent };
            });

            if (Object.keys(filesObj).length === 0) {
                filesObj["README.md"] = { content: "# Project \nGenerated by Hivemind." };
            }

            payload = {
                description: projectData.description || "Generated by Hivemind",
                public: false,
                files: filesObj
            };
        }
        else if (type === 'create_repo') {
            payload = {
                name: projectData.project_name || 'hivemind-project',
                description: projectData.description,
                private: false
            };
        }

        const response = await fetch('/api/github', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: githubToken,
                action: type,
                payload
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Deployment Failed");
        }

        return await response.json();
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
        githubToken,
        saveGithubToken,
        deployToGithub,
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode
    };
};
