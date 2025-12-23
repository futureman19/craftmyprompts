import { useState, useEffect } from 'react';

export const useHivemind = (initialKeys = {}) => {
    // --- STATE ---
    const [history, setHistory] = useState([]);
    const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'vision', 'blueprint', 'critique', 'done'
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextData, setContextData] = useState({}); // Stores user choices
    const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || ''); // <--- NEW TOKEN STATE
    const [managerMessages, setManagerMessages] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mode, setMode] = useState('coding'); // 'coding' | 'art'

    // --- HELPER: CLEAN JSON (Strip Markdown) ---
    const cleanJson = (text) => {
        if (!text) return "";
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    // --- HELPER: GET AGENT BY PHASE & MODE ---
    const getAgentForPhase = (phase, currentMode) => {
        const map = {
            vision: {
                coding: { id: 'visionary', role: 'The Visionary' },
                art: { id: 'muse', role: 'The Muse' },
                text: { id: 'editor', role: 'The Editor-in-Chief' },
                video: { id: 'producer', role: 'The Producer' }
            },
            specs: {
                coding: { id: 'tech_lead', role: 'The Tech Lead' },
                art: { id: 'cinematographer', role: 'The Cinematographer' },
                text: { id: 'linguist', role: 'The Linguist' },
                video: { id: 'director', role: 'The Director' }
            },
            blueprint: {
                coding: { id: 'architect', role: 'The Architect' },
                art: { id: 'stylist', role: 'The Stylist' },
                text: { id: 'scribe', role: 'The Scribe' },
                video: { id: 'vfx', role: 'The VFX Supervisor' }
            }
        };
        return map[phase]?.[currentMode] || map[phase]?.['coding'];
    };

    // --- KEY MANAGEMENT (Self-Healing) ---
    // User Manual Input (localStorage) > Environment Variables (initialKeys)
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
    // --- STEP 1: VISION (Start) ---
    const startMission = async (userPrompt, selectedMode) => {
        const targetMode = selectedMode || mode || 'coding';
        console.log("🚀 Starting Mission:", { prompt: userPrompt, mode: targetMode });

        setLoading(true);
        setHistory([]);
        setMode(targetMode);
        setCurrentPhase('vision');

        const { id, role } = getAgentForPhase('vision', targetMode); // <--- USE HELPER

        setStatusMessage(`${role} is analyzing your request...`);
        setContextData({ originalPrompt: userPrompt, mode: targetMode });

        try {
            const data = await callAgent(id, userPrompt);
            const rawMsg = data.swarm[0];
            const cleanContent = cleanJson(rawMsg.content);
            setHistory([{ ...rawMsg, content: cleanContent, text: cleanContent, role: role, type: 'vision_options' }]);
        } catch (e) { console.error(e); setStatusMessage("Error: " + e.message); }
        finally { setLoading(false); }
    };

    // --- STEP 2: SPECS (Tech Lead) ---
    // --- STEP 2: SPECS (Tech Lead) ---
    const submitChoices = async (choices) => {
        setLoading(true);
        setCurrentPhase('specs');

        const { id, role } = getAgentForPhase('specs', mode); // <--- USE HELPER

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

    // --- STEP 3: BLUEPRINT (Architect) ---
    // --- STEP 3: BLUEPRINT (Architect) ---
    const submitSpecs = async (specs) => {
        setLoading(true);
        setCurrentPhase('blueprint');

        const { id, role } = getAgentForPhase('blueprint', mode); // <--- USE HELPER

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

    // --- SWARM OPS: MANAGER FEEDBACK ---
    const handleManagerFeedback = async (userText, setInput) => {
        if (!userText.trim()) return;

        // 1. Add User Message to Chat
        const userMsg = { role: 'user', content: userText };
        setManagerMessages(prev => [...prev, userMsg]);
        setInput(''); // Clear input
        setLoading(true);

        try {
            // 2. Call Manager Agent
            // Context includes current phase and recent history
            const contextString = `Current Phase: ${currentPhase}\nUser Request: ${userText}`;

            const data = await callAgent('manager', "Analyze feedback and direct the swarm.", contextString);
            // CLEAN BEFORE PARSING
            const decision = JSON.parse(cleanJson(data.swarm[0].content));

            // 3. Add Manager Reply to Chat
            setManagerMessages(prev => [...prev, { role: 'assistant', content: decision.reply }]);

            // 4. EXECUTE REWIND / PIVOT
            if (decision.target_phase === 'specs') {
                // Rewind to Tech Lead (Specs)
                setStatusMessage("Manager: Rewinding to Specifications...");
                // We re-run submitChoices but pass the *existing* strategy + the new instruction
                const updatedStrategy = { ...contextData.strategy, _refinement: decision.refined_instruction };
                await submitChoices(updatedStrategy);
            }
            else if (decision.target_phase === 'blueprint') {
                // Rewind to Architect (Blueprint)
                setStatusMessage("Manager: Updating Blueprint...");
                const updatedSpecs = { ...contextData.specs, _refinement: decision.refined_instruction };
                await submitSpecs(updatedSpecs);
            }
            else if (decision.target_phase === 'vision') {
                // Total Reset (Vision)
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

        // Prepare payload based on type
        let payload = {};

        if (type === 'create_gist') {
            const filesObj = {};

            projectData.files.forEach(f => {
                if (!f.path) return;

                // 1. Flatten Folders (Gists don't support folders)
                const name = f.path.replace(/\//g, '_');

                // 2. Ensure Content is NOT empty (GitHub validation requirement)
                // If content is empty/null, use a single space or placeholder
                const safeContent = (f.content && f.content.trim().length > 0)
                    ? f.content
                    : '// Empty file';

                filesObj[name] = { content: safeContent };
            });

            // 3. Ensure at least one file exists
            if (Object.keys(filesObj).length === 0) {
                filesObj["README.md"] = { content: "# Project \nGenerated by Hivemind." };
            }

            payload = {
                description: projectData.description || "Generated by Hivemind",
                public: false, // Force private for safety
                files: filesObj
            };
        }
        else if (type === 'create_repo') {
            // For now, we just create the empty repo. 
            // Full file pushing requires Git commands or extensive API calls.
            // We'll start simple: Create Repo -> User pushes code manually via Zip.
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

        return await response.json(); // Returns the GitHub URL
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
        compileBuild,
        githubToken, // <--- Expose state
        saveGithubToken, // <--- Expose setter
        deployToGithub, // <--- Expose action
        managerMessages,
        isDrawerOpen,
        setIsDrawerOpen,
        handleManagerFeedback,
        mode // <--- Expose Mode
    };
};
