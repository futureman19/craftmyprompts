import { checkRateLimit } from './_utils/rate-limiter.js';
import { getProviderGuide } from './_utils/doc-reader.js';

// IMPORT AGENTS
import { VISIONARY } from './_agents/visionary.js';
import { ARCHITECT } from './_agents/architect.js';
import { CRITIC } from './_agents/critic.js';
import { TECH_LEAD } from './_agents/tech_lead.js';
import { MANAGER_AGENT } from './_agents/executive.js';

export const config = {
    maxDuration: 60,
};

// --- MODEL REGISTRY ---
const MODELS = {
    gemini: 'gemini-2.5-flash-lite',
    claude: 'claude-haiku-4-5',
    openai: 'gpt-4o',
    groq: 'llama-3.1-8b-instant'
};

// --- SQUAD MAPPING ---
// We can expand this later, but for now we map the core squad
const AGENT_SQUADS = {
    code: [VISIONARY, ARCHITECT, CRITIC],
    default: [VISIONARY, ARCHITECT, CRITIC]
};

export default async function handler(req, res) {
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt, category, keys = {}, targetAgentId, context } = req.body;
    const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

    // --- AGENT RUNNER LOGIC ---
    const runAgent = async (agent, inputContext = "") => {
        try {
            const strictModel = MODELS[agent.provider || 'gemini'] || MODELS.gemini;
            const fullSystemPrompt = inputContext
                ? `${agent.systemPrompt}\n\n### PREVIOUS CONTEXT:\n${inputContext}`
                : agent.systemPrompt;

            let content = "";

            // --- OPENAI HANDLER ---
            if (agent.provider === 'openai') {
                if (!openAIKey) throw new Error("Missing OpenAI Key");

                const body = {
                    model: strictModel,
                    messages: [
                        { role: "system", content: fullSystemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                };

                // CRITICAL FIX: Only force JSON if the agent demands it
                if (agent.responseType === 'json') {
                    body.response_format = { type: "json_object" };
                }

                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                    body: JSON.stringify(body)
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "OpenAI Error");
                content = d.choices[0].message.content;
            }
            // ... (Other providers can be added back if needed, focusing on OpenAI for stability now) ...
            else if (agent.provider === 'gemini') {
                if (!geminiKey) throw new Error("Missing Gemini Key");
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${fullSystemPrompt}\n\nUser Query: ${prompt}` }] }] })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Gemini Error");
                content = d.candidates?.[0]?.content?.parts?.[0]?.text;
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

        // 1. TARGETED RUN (Specific Agent requested by Frontend)
        if (targetAgentId) {
            const allAgents = [VISIONARY, ARCHITECT, CRITIC, TECH_LEAD, MANAGER_AGENT];
            const targetAgent = allAgents.find(a => a.id === targetAgentId);

            if (!targetAgent) throw new Error(`Agent ID '${targetAgentId}' not found.`);

            const result = await runAgent(targetAgent, context);
            results.push(result);
        }
        // 2. SYNTHESIS RUN (Manager)
        else if (req.body.mode === 'synthesize') {
            const execResult = await runAgent(MANAGER_AGENT, context);
            results = [execResult];
        }
        // 3. BROADCAST RUN (Default / Fallback)
        else {
            // Default to Visionary if no target specified (Start of flow)
            const res = await runAgent(VISIONARY, context);
            results.push(res);
        }

        return res.status(200).json({ swarm: results, timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: "The Hivemind failed to synchronize." });
    }
}
