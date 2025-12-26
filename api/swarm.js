import { checkRateLimit } from './_utils/rate-limiter.js';

// --- AGENT IMPORTS ---

// 1. CODING SQUAD (Moved to /coding folder)
import { VISIONARY } from './_agents/coding/visionary.js';
import { ARCHITECT } from './_agents/coding/architect.js';
import { CRITIC } from './_agents/coding/critic.js';
import { TECH_LEAD } from './_agents/coding/tech_lead.js';
import { EXECUTIVE_AGENT } from './_agents/coding/executive.js';

// 2. SHARED MANAGEMENT (Stays in root or shared folder)
import { MANAGER_AGENT } from './_agents/manager.js';

// 3. ART SQUAD
import { MUSE_AGENT } from './_agents/art/muse.js';
import { CINEMATOGRAPHER_AGENT } from './_agents/art/cinematographer.js';
import { STYLIST_AGENT } from './_agents/art/stylist.js';
import { CRITIC_AGENT as ART_CRITIC } from './_agents/art/critic.js';
import { GALLERY_AGENT } from './_agents/art/gallery.js';

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
        // ADDED 'mode' to destructured body
        const { prompt, category, keys = {}, targetAgentId, context, mode } = req.body;
        const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

        // 2. DEFINE SQUADS (Mapping Categories to Start Agents)
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
            // Art
            MUSE_AGENT, CINEMATOGRAPHER_AGENT, STYLIST_AGENT, ART_CRITIC, GALLERY_AGENT,
            // Text
            EDITOR_AGENT, LINGUIST_AGENT, WRITER_AGENT, PUBLISHER_AGENT,
            // Video
            PRODUCER_AGENT, DIRECTOR_AGENT, VFX_AGENT
        ].filter(Boolean); // Safety filter for broken imports

        // 4. DETERMINE TARGET AGENT
        let agentToRun = null;

        if (targetAgentId && targetAgentId !== 'manager') {
            // Case A: Specific Agent Requested (e.g. Phase 2/3)
            agentToRun = ROSTER.find(a => a.id === targetAgentId);
            if (!agentToRun) throw new Error(`Agent '${targetAgentId}' not found in roster.`);
        } else if (targetAgentId === 'manager' || req.body.mode === 'synthesize') {
            // Case B: Manager Synthesis
            agentToRun = MANAGER_AGENT;
        } else {
            // Case C: Start of Mission (Use Category)
            // Default to 'coding' (Visionary) if category is unknown
            agentToRun = SQUADS[category] || SQUADS.coding;
        }

        if (!agentToRun) throw new Error("Could not determine which agent to run.");

        // 5. RUN AGENT LOGIC (Updated for Chat Mode)
        const runAgent = async (agent, inputContext = "") => {
            let provider = agent.provider;
            let apiKey = keys[provider];

            if (!apiKey) {
                if (openAIKey) { provider = 'openai'; apiKey = openAIKey; }
                else if (geminiKey) { provider = 'gemini'; apiKey = geminiKey; }
                else if (groqKey) { provider = 'groq'; apiKey = groqKey; }
                else { throw new Error(`No API Key found. (Agent wanted ${agent.provider})`); }
            }

            const strictModel = MODELS[provider] || MODELS.gemini;

            // --- CONSTRUCT PROMPT ---
            let fullSystemPrompt = inputContext
                ? `${agent.systemPrompt}\n\n### CONTEXT:\n${inputContext}`
                : agent.systemPrompt;

            // --- OVERRIDE LOGIC ---
            if (mode === 'chat') {
                // RELAXED MODE: For Agent View
                fullSystemPrompt += `
                
                ### INTERACTION MODE: CONVERSATIONAL
                - You are conversing directly with the user.
                - IGNORE your default "JSON ONLY" constraints for the format.
                - Speak naturally in the voice of your persona.
                - Use Markdown.
                - ONLY output JSON if the user explicitly asks for a UI component or data structure.
                `;
            } else {
                // STRICT MODE: For Hivemind
                if (agent.responseType === 'json' && !fullSystemPrompt.toLowerCase().includes('json')) {
                    fullSystemPrompt += `\n\nIMPORTANT: You are a system process. Output STRICT JSON ONLY based on your schema.`;
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
                // Only force JSON object if NOT in chat mode
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

            // Cleanup JSON markers only if not in chat mode (or if we want to be safe)
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

        // Execute
        const result = await runAgent(agentToRun, context);
        return res.status(200).json({ swarm: [result], timestamp: new Date().toISOString() });

    } catch (globalError) {
        console.error("Swarm Fatal Error:", globalError);
        return res.status(500).json({ error: `Hivemind Crash: ${globalError.message}`, details: globalError.toString() });
    }
}
