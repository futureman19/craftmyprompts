import { checkRateLimit } from './_utils/rate-limiter.js';

export const config = {
    maxDuration: 60, // Allow up to 60 seconds for sequential processing
};

// --- 1. MODEL REGISTRY (Dec 2025 Standard) ---
const MODELS = {
    gemini: 'gemini-2.5-flash-lite',
    claude: 'claude-haiku-4-5',
    openai: 'gpt-4o',
    groq: 'llama-3.1-8b-instant'
};

// --- 2. AGENT DEFINITIONS (Inlined for Stability) ---

// Tech Squad
const VISIONARY = {
    id: 'visionary', name: 'The Visionary', role: 'Product Strategy', provider: 'openai',
    systemPrompt: `IDENTITY: You are The Visionary. Goal: Maximize Product-Market Fit.
    COGNITIVE PROTOCOL: 1. Generate 3 divergent strategic angles. 2. Focus on psychological impact.
    OUTPUT: North Star, Viral Loop, User Psychology.`
};
const ARCHITECT = {
    id: 'architect', name: 'The Architect', role: 'Tech Implementation', provider: 'claude',
    systemPrompt: `IDENTITY: You are The Architect. Priority: Clean Code & Modularity.
    COGNITIVE PROTOCOL: 1. Generate structural Skeleton first. 2. Enforce Separation of Concerns.
    OUTPUT: Tech Stack, Database Schema, API Specs.`
};
const CRITIC = {
    id: 'critic', name: 'The Critic', role: 'Risk Analysis', provider: 'gemini',
    systemPrompt: `IDENTITY: You are The Critic (CISO). Job: Destroy the proposal.
    COGNITIVE PROTOCOL: 1. Analyze for OWASP Top 10. 2. Simulate malicious user behavior.
    OUTPUT: Threat Model, Compliance Violations, UX Friction.`
};

// Creative Squad
const MUSE = {
    id: 'muse', name: 'The Muse', role: 'Creative Director', provider: 'openai',
    systemPrompt: `IDENTITY: You are The Muse. Goal: Radical Originality.
    OUTPUT: Metaphorical Concept, Sensory Palette, Emotional Resonance.`
};
const EDITOR = {
    id: 'editor', name: 'The Editor', role: 'Structural Editor', provider: 'claude',
    systemPrompt: `IDENTITY: You are The Editor. Goal: Structure & Economy.
    OUTPUT: Structural Analysis, Pacing Check, Rewritten Excerpts.`
};
const PUBLISHER = {
    id: 'publisher', name: 'The Publisher', role: 'Audience Advocate', provider: 'gemini',
    systemPrompt: `IDENTITY: You are The Publisher. Bias: Commercial Viability.
    OUTPUT: Viral Hook Options, SEO Keywords, Readability Score.`
};

// Data Squad
const ANALYST = {
    id: 'analyst', name: 'The Analyst', role: 'Insight Generator', provider: 'openai',
    systemPrompt: `IDENTITY: You are The Analyst. Transform noise into strategy.
    OUTPUT: The Insight Narrative, Strategic Drivers, Prescription.`
};
const QUANT = {
    id: 'quant', name: 'The Quant', role: 'Methodology Engineer', provider: 'claude',
    systemPrompt: `IDENTITY: You are The Quant. You speak in Python/Pandas.
    OUTPUT: Executable Python Code Block.`
};
const SKEPTIC = {
    id: 'skeptic', name: 'The Skeptic', role: 'Statistical Auditor', provider: 'gemini',
    systemPrompt: `IDENTITY: You are The Skeptic. Bias: Statistical Pessimism.
    OUTPUT: Confidence Score, Critical Failures, Warnings.`
};

// Executive
// Executive
// Executive
const MANAGER_AGENT = {
    id: 'executive',
    name: 'The Executive',
    role: 'Build Master',
    provider: 'openai', // Maps to gpt-4o
    systemPrompt: `IDENTITY: You are The Executive (Build Master).
    YOUR GOAL: Synthesize the Vision, Blueprint, and Critique into a FINAL DEPLOYABLE CODEBASE.

    INPUT CONTEXT:
    You will be provided with a history of the project planning (Vision, Architecture, Critique, User Feedback).
    
    STRICT OUTPUT FORMAT:
    You must output ONLY a valid JSON object containing the full project file structure.
    Do not write conversational text (no "Here is your code", etc).
    
    JSON SCHEMA:
    {
      "project_name": "string (slug-friendly)",
      "description": "string (short summary)",
      "files": [
        {
          "path": "package.json",
          "content": "string (raw file content)"
        },
        {
          "path": "src/App.jsx",
          "content": "string (raw file content)"
        }
        // ... include ALL necessary files for a working MVP
      ],
      "github_readme": "string (markdown content for README.md)"
    }
    
    RULES:
    1. COMPLETENESS: Include every file needed to run the app (e.g., index.html, vite.config.js, .gitignore).
    2. QUALITY: Ensure code is production-ready, clean, and commented.
    3. INSTRUCTIONS: The 'github_readme' must include setup instructions (npm install, npm run dev).
    4. FORMAT: Output RAW JSON only. Do not wrap in markdown code fences if possible, or use standard \`\`\`json blocks if necessary.`
};

// Squad Mapping
const AGENT_SQUADS = {
    code: [VISIONARY, ARCHITECT, CRITIC],
    text: [MUSE, EDITOR, PUBLISHER],
    data: [ANALYST, QUANT, SKEPTIC],
    default: [VISIONARY, ARCHITECT, CRITIC]
};

// --- 3. MAIN HANDLER ---
export default async function handler(req, res) {
    // A. Rate Limit
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    // B. Method Check
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt, mode, category, keys = {}, targetAgentId } = req.body;
    const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

    // Helper: Run Single Agent
    const runAgent = async (agent, context = "") => {
        try {
            const strictModel = MODELS[agent.provider || 'gemini'] || MODELS.gemini;
            const fullSystemPrompt = context
                ? `${agent.systemPrompt}\n\n### PREVIOUS CONTEXT (AUDIT MATERIAL):\n${context}`
                : agent.systemPrompt;

            let content = "";

            // Provider Switch
            if (agent.provider === 'openai') {
                if (!openAIKey) throw new Error("Missing OpenAI Key");
                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                    body: JSON.stringify({
                        model: strictModel,
                        messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "OpenAI Error");
                content = d.choices[0].message.content;
            }
            else if (agent.provider === 'claude') {
                if (!anthropicKey) throw new Error("Missing Anthropic Key");
                const r = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                    body: JSON.stringify({
                        model: strictModel,
                        max_tokens: 1024,
                        system: fullSystemPrompt,
                        messages: [{ role: "user", content: prompt }]
                    })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Anthropic Error");
                content = d.content?.[0]?.text;
            }
            else if (agent.provider === 'gemini') {
                if (!geminiKey) throw new Error("Missing Gemini Key");
                const modelPath = strictModel.startsWith('models/') ? strictModel : `models/${strictModel}`;
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${fullSystemPrompt}\n\nUser Query: ${prompt}` }] }] })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Gemini Error");
                content = d.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            else if (agent.provider === 'groq') {
                if (!groqKey) throw new Error("Missing Groq Key");
                const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
                    body: JSON.stringify({
                        model: strictModel,
                        messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }]
                    })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Groq Error");
                content = d.choices[0].message.content;
            }

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: content,
                meta: { model: strictModel, status: 'success' }
            };

        } catch (error) {
            console.error(`Agent Failed (${agent.name}):`, error.message);
            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: `⚠️ Agent Offline: ${error.message}`,
                error: true,
                meta: { model: agent.provider, status: 'failed' }
            };
        }
    };

    try {
        let results = [];

        if (targetAgentId) {
            // MODE A: SINGLE AGENT (Narrative Step)
            // Flatten all squads to find the target agent
            const allAgents = [
                ...AGENT_SQUADS.code,
                ...AGENT_SQUADS.text,
                ...AGENT_SQUADS.data,
                MANAGER_AGENT // Don't forget the Executive
            ];

            const targetAgent = allAgents.find(a => a.id === targetAgentId);

            if (!targetAgent) {
                // Determine which squad the ID might belong to for a fallback, or just error
                throw new Error(`Agent ID '${targetAgentId}' not found in any squad.`);
            }

            // Run just this agent
            const result = await runAgent(targetAgent);
            results.push(result);

        } else if (mode === 'synthesize') {
            const execResult = await runAgent(MANAGER_AGENT);
            results = [execResult];
        } else {
            // MODE C: FULL SQUAD (Legacy Waterfall)
            const squad = AGENT_SQUADS[category] || AGENT_SQUADS.default;

            // 1. Creators (Parallel)
            const creators = squad.filter(a => a.id !== 'critic');
            const step1 = await Promise.all(creators.map(a => runAgent(a)));
            results.push(...step1);

            // 2. Critic (Sequential)
            const critic = squad.find(a => a.id === 'critic') || CRITIC;
            const context = step1.map(r => `[${r.role}]: ${r.content}`).join('\n\n');
            const step2 = await runAgent(critic, context);
            results.push(step2);
        }

        return res.status(200).json({ swarm: results, timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: "The Hivemind failed to synchronize." });
    }
}
