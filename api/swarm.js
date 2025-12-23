import { checkRateLimit } from './_utils/rate-limiter.js';

// --- AGENT IMPORTS ---
// We import these safely. If a file is missing/broken during dev, we catch it later.
import { VISIONARY } from './_agents/visionary.js';
import { ARCHITECT } from './_agents/architect.js';
import { CRITIC } from './_agents/critic.js';
import { TECH_LEAD } from './_agents/tech_lead.js';
import { MANAGER_AGENT } from './_agents/manager.js';
import { EXECUTIVE_AGENT } from './_agents/executive.js';

import { MUSE_AGENT } from './_agents/art/muse.js';
import { CINEMATOGRAPHER_AGENT } from './_agents/art/cinematographer.js';
import { STYLIST_AGENT } from './_agents/art/stylist.js';

import { EDITOR_AGENT } from './_agents/text/editor.js';
import { LINGUIST_AGENT } from './_agents/text/linguist.js';
import { SCRIBE_AGENT } from './_agents/text/scribe.js';

import { PRODUCER_AGENT } from './_agents/video/producer.js';
import { DIRECTOR_AGENT } from './_agents/video/director.js';
import { VFX_AGENT } from './_agents/video/vfx.js';

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

export default async function handler(req, res) {
    // 1. Rate Limit Check
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { prompt, category, keys = {}, targetAgentId, context } = req.body;
        const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

        // 2. DEFINE SQUADS (Mapping Categories to Start Agents)
        // This ensures 'text' mode wakes up the Editor, not the Visionary.
        const SQUADS = {
            coding: VISIONARY,
            art: MUSE_AGENT,
            text: EDITOR_AGENT,
            video: PRODUCER_AGENT
        };

        // 3. DEFINE ROSTER (All Agents for Lookup)
        const ROSTER = [
            VISIONARY, ARCHITECT, CRITIC, TECH_LEAD, MANAGER_AGENT, EXECUTIVE_AGENT,
            MUSE_AGENT, CINEMATOGRAPHER_AGENT, STYLIST_AGENT,
            EDITOR_AGENT, LINGUIST_AGENT, SCRIBE_AGENT,
            PRODUCER_AGENT, DIRECTOR_AGENT, VFX_AGENT
        ].filter(Boolean); // Safety filter for broken imports

        // 4. DETERMINE TARGET AGENT
        let agentToRun = null;

        if (targetAgentId) {
            // Case A: Specific Agent Requested (e.g. Phase 2/3)
            agentToRun = ROSTER.find(a => a.id === targetAgentId);
            if (!agentToRun) throw new Error(`Agent '${targetAgentId}' not found in roster.`);
        } else if (req.body.mode === 'synthesize') {
            // Case B: Manager Synthesis
            agentToRun = MANAGER_AGENT;
        } else {
            // Case C: Start of Mission (Use Category)
            // Default to 'coding' (Visionary) if category is unknown
            agentToRun = SQUADS[category] || SQUADS.coding;
        }

        if (!agentToRun) throw new Error("Could not determine which agent to run.");

        // 5. RUN AGENT LOGIC (With Smart Fallback)
        const runAgent = async (agent, inputContext = "") => {
            // Provider Fallback Logic
            let provider = agent.provider;
            let apiKey = keys[provider];

            if (!apiKey) {
                if (openAIKey) { provider = 'openai'; apiKey = openAIKey; }
                else if (geminiKey) { provider = 'gemini'; apiKey = geminiKey; }
                else if (groqKey) { provider = 'groq'; apiKey = groqKey; }
                else { throw new Error(`No API Key found. (Agent wanted ${agent.provider})`); }
            }

            const strictModel = MODELS[provider] || MODELS.gemini;
            const fullSystemPrompt = inputContext
                ? `${agent.systemPrompt}\n\n### PREVIOUS CONTEXT:\n${inputContext}`
                : agent.systemPrompt;

            let content = "";

            // Call Provider API
            if (provider === 'openai') {
                const body = {
                    model: strictModel,
                    messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }],
                    temperature: 0.7
                };
                if (agent.responseType === 'json') body.response_format = { type: "json_object" };

                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify(body)
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "OpenAI Error");
                content = d.choices[0].message.content;
            }
            else if (provider === 'gemini') {
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${strictModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${fullSystemPrompt}\n\nUser Query: ${prompt}` }] }] })
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Gemini Error");
                content = d.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            else if (provider === 'groq') {
                const body = {
                    model: strictModel,
                    messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }]
                };
                if (agent.responseType === 'json') body.response_format = { type: "json_object" };

                const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify(body)
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Groq Error");
                content = d.choices[0].message.content;
            }

            // Cleanup
            if (content) content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: content,
                meta: { model: strictModel, provider: provider, status: 'success' }
            };
        };

        // Execute
        const result = await runAgent(agentToRun, context);
        return res.status(200).json({ swarm: [result], timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: `Hivemind Crash: ${globalError.message}`, details: globalError.toString() });
    }
}
