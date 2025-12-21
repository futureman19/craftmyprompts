import { checkRateLimit } from './_utils/rate-limiter.js';
// FIXED IMPORT: Reading from local utils instead of src
import { AGENT_SQUADS, MANAGER_AGENT, CRITIC } from './_utils/squad-config.js';

export const config = {
    maxDuration: 60, // Allow up to 60 seconds for sequential processing
};

// --- MODEL REGISTRY (2025 STANDARD) ---
const MODELS = {
    gemini: 'gemini-2.5-flash-lite',
    claude: 'claude-haiku-4-5',
    openai: 'gpt-4o',
    groq: 'llama-3.1-8b-instant'
};

/**
 * THE CORTEX: Hivemind Orchestrator
 * Implements Sequential Dependency (Waterfall) logic.
 * Flow: Squad (Parallel) -> Critic (Audit) -> Executive (Synthesis)
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
    const { openai: openAIKey, anthropic: anthropicKey, gemini: geminiKey, groq: groqKey } = keys;

    // Helper: Execute a single agent
    const runAgent = async (agent, context = "") => {
        try {
            // A. Resolve Model ID
            // We map the abstract provider name (e.g. 'gemini') to the strict model ID
            const strictModel = MODELS[agent.provider || 'gemini'] || MODELS.gemini;

            // B. Construct Prompt
            // If context exists (from previous steps), inject it
            const fullSystemPrompt = context
                ? `${agent.systemPrompt}\n\n### PREVIOUS CONTEXT (AUDIT MATERIAL):\n${context}`
                : agent.systemPrompt;

            let content = "";

            // C. Provider Dispatch
            if (agent.provider === 'openai') {
                if (!openAIKey) throw new Error("Missing OpenAI Key");
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                    body: JSON.stringify({
                        model: strictModel,
                        messages: [
                            { role: "system", content: fullSystemPrompt },
                            { role: "user", content: prompt }
                        ],
                        temperature: agent.temperature || 0.7
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || "OpenAI Error");
                content = data.choices[0].message.content;

            } else if (agent.provider === 'claude') {
                if (!anthropicKey) throw new Error("Missing Anthropic Key");
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': anthropicKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: strictModel,
                        max_tokens: 1024,
                        system: fullSystemPrompt,
                        messages: [{ role: "user", content: prompt }],
                        temperature: agent.temperature || 0.7
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error?.message || "Anthropic Error");
                content = data.content?.[0]?.text;

            } else if (agent.provider === 'gemini') {
                if (!geminiKey) throw new Error("Missing Gemini Key");
                const modelPath = strictModel.startsWith('models/') ? strictModel : `models/${strictModel}`;
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{ text: `${fullSystemPrompt}\n\nUser Query: ${prompt}` }]
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
                meta: { model: strictModel, status: 'success' }
            };

        } catch (error) {
            console.error(`Hivemind Agent Failed (${agent.name}):`, error.message);
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

        // MODE 1: SYNTHESIZE (Executive Only)
        if (mode === 'synthesize') {
            const executiveResult = await runAgent(MANAGER_AGENT);
            results = [executiveResult];
        }
        // MODE 2: FULL HIVE (Sequential Waterfall)
        else {
            const activeSquad = AGENT_SQUADS[category] || AGENT_SQUADS.default;

            // --- STEP 1: GENERATION (Parallel) ---
            const creators = activeSquad.filter(a => a.id !== 'critic');
            const step1Results = await Promise.all(creators.map(agent => runAgent(agent)));
            results.push(...step1Results);

            // Construct context for the Critic
            const step1Context = step1Results.map(r => `[${r.role}]: ${r.content}`).join('\n\n');

            // --- STEP 2: AUDIT (Sequential) ---
            let criticAgent = activeSquad.find(a => a.id === 'critic');
            if (!criticAgent) criticAgent = CRITIC;

            const step2Result = await runAgent(criticAgent, step1Context);
            results.push(step2Result);
        }

        return res.status(200).json({
            swarm: results,
            timestamp: new Date().toISOString()
        });

    } catch (globalError) {
        console.error("Hivemind Orchestration Failed:", globalError);
        return res.status(500).json({ error: "The Hivemind failed to synchronize." });
    }
}
