import { checkRateLimit } from './_utils/rate-limiter.js';

// --- AGENT IMPORTS ---

// 1. CODING SQUAD
import { VISIONARY } from './_agents/coding/visionary.js';
import { ARCHITECT } from './_agents/coding/architect.js';
import { CRITIC } from './_agents/coding/critic.js';
import { TECH_LEAD } from './_agents/coding/tech_lead.js';
import { EXECUTIVE_AGENT } from './_agents/coding/executive.js';

// 2. SHARED MANAGEMENT
import { MANAGER_AGENT } from './_agents/manager.js';

// 3. ART SQUAD
import { MUSE_AGENT } from './_agents/art/muse.js';
import { CINEMATOGRAPHER_AGENT } from './_agents/art/cinematographer.js';
import { STYLIST_AGENT } from './_agents/art/stylist.js';
import { GALLERY_AGENT } from './_agents/art/gallery.js';
import { MAVERICK_AGENT } from './_agents/art/maverick.js'; // <--- NEW HIRE

// 4. TEXT SQUAD
import { EDITOR_AGENT } from './_agents/text/editor.js';
import { LINGUIST_AGENT } from './_agents/text/linguist.js';
import { WRITER_AGENT } from './_agents/text/writer.js';
import { PUBLISHER_AGENT } from './_agents/text/publisher.js';

// 5. VIDEO SQUAD
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
        const { prompt, category, keys = {}, targetAgentId, context, mode } = req.body;
        const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

        // 2. DEFINE SQUADS
        const SQUADS = {
            coding: VISIONARY,
            art: MUSE_AGENT,
            text: EDITOR_AGENT,
            video: PRODUCER_AGENT
        };

        // 3. DEFINE ROSTER (All Agents for Lookup)
        const ROSTER = [
            // Coding
            VISIONARY, ARCHITECT, CRITIC, TECH_LEAD, EXECUTIVE_AGENT,
            // Management
            MANAGER_AGENT,
            // Art (Note: CRITIC removed, MAVERICK added)
            MUSE_AGENT, CINEMATOGRAPHER_AGENT, STYLIST_AGENT, GALLERY_AGENT, MAVERICK_AGENT,
            // Text
            EDITOR_AGENT, LINGUIST_AGENT, WRITER_AGENT, PUBLISHER_AGENT,
            // Video
            PRODUCER_AGENT, DIRECTOR_AGENT, VFX_AGENT
        ].filter(Boolean);

        // 4. DETERMINE TARGET AGENT
        let agentToRun = null;

        if (targetAgentId && targetAgentId !== 'manager') {
            agentToRun = ROSTER.find(a => a.id === targetAgentId);
            if (!agentToRun) throw new Error(`Agent '${targetAgentId}' not found in roster.`);
        } else if (targetAgentId === 'manager' || req.body.mode === 'synthesize') {
            agentToRun = MANAGER_AGENT;
        } else {
            agentToRun = SQUADS[category] || SQUADS.coding;
        }

        if (!agentToRun) throw new Error("Could not determine which agent to run.");

        // 5. RUN AGENT LOGIC
        const runAgent = async (agent, inputContext = "") => {
            let provider = agent.provider || 'gemini'; // Default if undefined

            // Override provider based on available keys if specific one is missing
            let apiKey = keys[provider];
            if (!apiKey) {
                if (geminiKey) { provider = 'gemini'; apiKey = geminiKey; }
                else if (openAIKey) { provider = 'openai'; apiKey = openAIKey; }
                else if (groqKey) { provider = 'groq'; apiKey = groqKey; }
                else { throw new Error(`No API Key found. (Agent wanted ${agent.provider})`); }
            }

            const strictModel = MODELS[provider] || MODELS.gemini;

            // --- CONSTRUCT PROMPT ---
            let fullSystemPrompt = inputContext
                ? `${agent.systemPrompt}\n\n### CONTEXT:\n${inputContext}`
                : agent.systemPrompt;

            if (mode === 'chat') {
                fullSystemPrompt += `\n### INTERACTION MODE: CONVERSATIONAL\nSpeak naturally. Use Markdown.`;
            } else {
                if (agent.responseType === 'json' && !fullSystemPrompt.toLowerCase().includes('json')) {
                    fullSystemPrompt += `\n\nIMPORTANT: Output STRICT JSON ONLY.`;
                }
            }

            let content = "";

            // Call Provider API
            if (provider === 'openai') {
                const body = {
                    model: strictModel,
                    messages: [{ role: "system", content: fullSystemPrompt }, { role: "user", content: prompt }],
                    temperature: 0.7
                };
                if (agent.responseType === 'json' && mode !== 'chat') {
                    body.response_format = { type: "json_object" };
                }

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
                if (agent.responseType === 'json' && mode !== 'chat') body.response_format = { type: "json_object" };

                const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify(body)
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error?.message || "Groq Error");
                content = d.choices[0].message.content;
            }

            // Cleanup JSON markers
            if (mode !== 'chat' && content) {
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: content,
                meta: { model: strictModel, provider: provider, status: 'success' }
            };
        };

        const result = await runAgent(agentToRun, context);
        return res.status(200).json({ swarm: [result], timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: `Hivemind Crash: ${globalError.message}`, details: globalError.toString() });
    }
}
