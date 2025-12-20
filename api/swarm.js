import { checkRateLimit } from './_utils/rate-limiter.js';
import { AGENT_SQUADS, MANAGER_AGENT } from '../src/lib/swarm-agents.js';

export const config = {
    maxDuration: 60, // Allow up to 60 seconds for parallel processing
};

/**
 * THE CORTEX: Swarm Intelligence Orchestrator
 * Handles parallel execution of multiple AI agents with specialized roles.
 */
export default async function handler(req, res) {
    // 1. Rate Limit Check
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) {
        return res.status(429).json({ error: limitStatus.error });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, mode, category, keys = {} } = req.body;
    const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey } = keys;

    // Helper: Knowledge Base Stub (RAG)
    const searchKnowledgeBase = async (query) => {
        if (!query) return ""; // Handle undefined query
        // In a real implementation, this would query Pinecone/Supabase
        // For now, we return a mock context based on the query signature
        return `[Knowledge Base Result] Optimized patterns found for: ${query}. (Stub)`;
    };

    // Helper: Execute a single agent
    const runAgent = async (agent) => {
        try {
            // A. Thought Process (RAG)
            // Handle agents without RAG modifiers (like the Executive)
            let ragContext = "";
            if (agent.ragQueryModifier) {
                const ragQuery = `${prompt} ${agent.ragQueryModifier}`;
                ragContext = await searchKnowledgeBase(ragQuery);
            }

            // B. Construct System Prompt
            const fullSystemPrompt = ragContext
                ? `${agent.systemPrompt}\n\nCONTEXT FROM KNOWLEDGE BASE:\n${ragContext}`
                : agent.systemPrompt;

            // C. Inference (Provider Dispatch)
            let content = "";
            let usedModel = agent.model; // For metadata

            if (agent.model.startsWith('gpt-')) {
                // OpenAI Handling
                const targetKey = openAIKey || process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
                if (!targetKey) throw new Error("Missing OpenAI Key");

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${targetKey}`
                    },
                    body: JSON.stringify({
                        model: agent.model,
                        messages: [
                            { role: "system", content: fullSystemPrompt },
                            { role: "user", content: prompt }
                        ],
                        temperature: agent.temperature
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || "OpenAI Error");
                content = data.choices[0].message.content;

            } else if (agent.model.includes('claude')) {
                // Anthropic Handling
                const targetKey = anthropicKey || process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
                if (!targetKey) throw new Error("Missing Anthropic Key");

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': targetKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: agent.model, // e.g. claude-haiku-4-5
                        max_tokens: 1024,
                        system: fullSystemPrompt, // Claude supports top-level system field
                        messages: [{ role: "user", content: prompt }],
                        temperature: agent.temperature
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || "Anthropic Error");
                content = data.content?.[0]?.text;

            } else if (agent.model.includes('gemini')) {
                // Google Gemini Handling
                const targetKey = geminiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
                if (!targetKey) throw new Error("Missing Gemini Key");

                // Construct model path (e.g. models/gemini-2.0-flash...)
                const modelPath = agent.model.startsWith('models/') ? agent.model : `models/${agent.model}`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${targetKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{ text: `${fullSystemPrompt}\n\nUser Query: ${prompt}` }] // Gemini System Prompt is complex, usually just prepend
                        }]
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || "Gemini Error");
                content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            }

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: content,
                meta: {
                    trace: agent.ragQueryModifier ? `Searched for: "${agent.ragQueryModifier}"` : "Synthesis Mode",
                    model: agent.model
                }
            };

        } catch (error) {
            console.error(`Swarm Agent Failed (${agent.name}):`, error.message);
            return {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                content: `⚠️ Agent Offline (${agent.name} experienced a connection error: ${error.message})`,
                error: true,
                meta: {
                    trace: "Connection Failed",
                    model: agent.model
                }
            };
        }
    };

    try {
        let results = [];

        // MODE SWITCH: SYNTHESIZE vs PARALLEL
        if (mode === 'synthesize') {
            // Run only the Executive
            const executiveResult = await runAgent(MANAGER_AGENT);
            results = [executiveResult];
        } else {
            // DYNAMIC SQUAD SELECTION
            // Default to 'tech' (code) if no category provided
            const activeSquad = AGENT_SQUADS[category] || AGENT_SQUADS.default;

            console.log(`[Cortex] Activating Squad: ${category || 'default'} (${activeSquad.length} agents)`);

            // Run all Swarm Agents simultaneously
            results = await Promise.all(activeSquad.map(agent => runAgent(agent)));
        }

        return res.status(200).json({
            swarm: results,
            timestamp: new Date().toISOString()
        });

    } catch (globalError) {
        console.error("Swarm Orchestration Failed:", globalError);
        return res.status(500).json({ error: "The Cortex failed to synchronize agents." });
    }
}
