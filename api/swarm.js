import { checkRateLimit } from './_utils/rate-limiter.js';
import { getProviderGuide } from './_utils/doc-reader.js';
import { compileContext } from './_utils/context-compiler.js';

export const config = {
    maxDuration: 60,
};

// --- 1. MODEL REGISTRY ---
const MODELS = {
    gemini: 'gemini-2.5-flash-lite',
    claude: 'claude-haiku-4-5',
    openai: 'gpt-4o',
    groq: 'llama-3.1-8b-instant'
};

// --- 2. STRICT AGENT DEFINITIONS ---

// Tech Squad
const VISIONARY = {
    id: 'visionary', name: 'The Visionary', role: 'Product Strategy', provider: 'openai',
    systemPrompt: `You are a JSON Generator. You do NOT write text. You ONLY output JSON.
    
    TASK: Receive a user idea and convert it into a structured strategy deck.
    
    INPUT: "Build a snake game"
    
    REQUIRED OUTPUT FORMAT (Exact JSON):
    {
      "analysis": "A classic arcade game requiring a game loop, grid rendering, and input handling.",
      "strategy_options": [
        {
          "category": "Platform",
          "question": "Where should this run?",
          "options": ["Web (React)", "Desktop (Python)", "Mobile (React Native)"]
        },
        {
          "category": "Visual Style",
          "question": "Choose the aesthetic:",
          "options": ["Retro Pixel Art", "Modern Minimalist", "Neon Cyberpunk"]
        }
      ]
    }
    
    CRITICAL: Do NOT output markdown code fences. Start with { and end with }.`
};

const ARCHITECT = {
    id: 'architect', name: 'The Architect', role: 'Tech Implementation', provider: 'openai',
    systemPrompt: `You are a Filesystem Generator. You do not speak. You only output JSON.

    TASK: Generate a complete file structure based on the strategy.

    REQUIRED OUTPUT FORMAT (Exact JSON):
    {
      "blueprint_summary": "React app with Canvas API...",
      "structure": [
        { "path": "package.json", "type": "file" },
        { "path": "src/App.jsx", "type": "file" }
      ],
      "modules": [
        {
          "path": "package.json",
          "language": "json",
          "code": "{\n  \"name\": \"app\",\n  \"version\": \"1.0.0\"\n}"
        },
        {
          "path": "src/App.jsx",
          "language": "javascript",
          "code": "import React from 'react';\\n\\nexport default function App() {\\n  return <h1>Hello</h1>;\\n}"
        }
      ]
    }

    CRITICAL: Do NOT output markdown. Return raw JSON.`
};

const CRITIC = {
    id: 'critic', name: 'The Critic', role: 'Risk Audit', provider: 'openai',
    systemPrompt: `You are a Code Review Bot.
    TASK: Analyze the provided code for bugs and risks.
    OUTPUT: Return a plain text list of issues (Red Flags 🔴 and Questions ❓). Be blunt.`
};

// Creative Squad
const MUSE = {
    id: 'muse', name: 'The Muse', role: 'Creative Director', provider: 'openai',
    systemPrompt: `IDENTITY: You are The Muse. Output JSON concepts. FORMAT: { "concepts": ["Concept A", "Concept B"] }`
};
const EDITOR = {
    id: 'editor', name: 'The Editor', role: 'Structural Editor', provider: 'claude',
    systemPrompt: `IDENTITY: You are The Editor. Refine text for clarity.`
};
const PUBLISHER = {
    id: 'publisher', name: 'The Publisher', role: 'Audience Advocate', provider: 'gemini',
    systemPrompt: `IDENTITY: You are The Publisher. Optimize for viral reach.`
};

// Data Squad
const ANALYST = {
    id: 'analyst', name: 'The Analyst', role: 'Insight Generator', provider: 'openai',
    systemPrompt: `IDENTITY: You are The Analyst. Extract insights from data.`
};
const QUANT = {
    id: 'quant', name: 'The Quant', role: 'Methodology Engineer', provider: 'claude',
    systemPrompt: `IDENTITY: You are The Quant. Generate Python analysis code.`
};
const SKEPTIC = {
    id: 'skeptic', name: 'The Skeptic', role: 'Statistical Auditor', provider: 'gemini',
    systemPrompt: `IDENTITY: You are The Skeptic. Find flaws in data logic.`
};

// Executive
const MANAGER_AGENT = {
    id: 'executive', name: 'The Executive', role: 'Build Master', provider: 'openai',
    systemPrompt: `You are the Build Master.
    TASK: Combine all previous outputs into a final project manifest.
    REQUIRED OUTPUT FORMAT (JSON):
    {
      "project_name": "project-alpha",
      "description": "A generated project.",
      "files": [ { "path": "README.md", "content": "# Project" } ]
    }
    CRITICAL: Return JSON only. No markdown.`
};

const TRANSLATOR = {
    id: 'translator', name: 'The Polyglot', role: 'Model Optimization', provider: 'openai',
    systemPrompt: `Optimize the prompt. Return JSON: { "optimized_prompt": "..." }`
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
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt: rawPrompt, mode, category, keys = {}, targetAgentId, targetProvider: reqProvider, context } = req.body;
    const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

    let prompt = rawPrompt;

    // Helper: Run Single Agent
    const runAgent = async (agent, context = "") => {
        try {
            const strictModel = MODELS[agent.provider || 'gemini'] || MODELS.gemini;
            const fullSystemPrompt = context
                ? `${agent.systemPrompt}\n\n### PREVIOUS CONTEXT:\n${context}`
                : agent.systemPrompt;

            let content = "";

            if (agent.provider === 'openai') {
                if (!openAIKey) throw new Error("Missing OpenAI Key");
                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                    body: JSON.stringify({
                        model: strictModel,
                        messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }],
                        temperature: 0.7,
                        response_format: { type: "json_object" } // Force JSON mode for OpenAI
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
                        max_tokens: 4096,
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
                        messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }],
                        response_format: { type: "json_object" }
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
            const allAgents = [...AGENT_SQUADS.code, ...AGENT_SQUADS.text, ...AGENT_SQUADS.data, MANAGER_AGENT, TRANSLATOR];
            const targetAgent = allAgents.find(a => a.id === targetAgentId);
            if (!targetAgent) throw new Error(`Agent ID '${targetAgentId}' not found.`);

            const result = await runAgent(targetAgent, context); // Pass context properly
            results.push(result);
        } else if (mode === 'synthesize') {
            const execResult = await runAgent(MANAGER_AGENT, context);
            results = [execResult];
        } else {
            // Default Mode: Visionary Only (Step 1)
            const squad = AGENT_SQUADS[category] || AGENT_SQUADS.default;
            const visionary = squad[0];
            const res = await runAgent(visionary, context);
            results.push(res);
        }

        return res.status(200).json({ swarm: results, timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: "The Hivemind failed to synchronize." });
    }
}
