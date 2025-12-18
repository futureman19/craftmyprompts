// This function runs on Vercel's servers.
// It acts as a "Meta-Agent" that analyzes a prompt and recommends the best AI model.
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
  // 1. Rate Limit Check
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
      return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey: userKey } = req.body;

  // 3. Determine API Key (Using the VITE_GEMINI_API_KEY for the router itself)
  const apiKey = userKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key is missing for the Router." });
  }

  if (!prompt) {
      return res.status(400).json({ error: "Prompt is required for routing analysis." });
  }

  // HELPER: Sanitize logs
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/key=[^&]*/g, 'key=***');
    }
    return msg;
  };

  try {
    // 4. Construct the Classification Prompt
    // We ask Gemini to analyze the user's intent and output a JSON decision.
    const routerSystemPrompt = `
    You are an AI Model Orchestrator. Analyze the user's prompt and determine the best AI model to handle it based on complexity and domain.

    AVAILABLE MODELS:
    - "anthropic" (Claude 3.5 Sonnet): Best for Coding, Complex Logic, Nuance, Safety.
    - "openai" (GPT-4o): Best for General Knowledge, Reasoning, Multi-step tasks.
    - "gemini" (Gemini 1.5 Pro): Best for Creative Writing, Long Context, Speed.
    - "groq" (Llama 3): Best for Ultra-fast simple queries, Summarization.

    RULES:
    1. Coding/Programming -> Recommend "anthropic".
    2. Complex Logic/Math -> Recommend "openai".
    3. Creative Writing/Brainstorming -> Recommend "gemini".
    4. Simple/Fast Queries -> Recommend "groq" (or "gemini" if groq not preferred).
    
    OUTPUT FORMAT:
    Return ONLY a JSON object (no markdown):
    {
      "provider": "gemini" | "openai" | "anthropic" | "groq",
      "reasoning": "Brief explanation why."
    }
    `;

    // CTO UPDATE: Using the standardized gemini-2.5-flash-lite model as requested
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
            role: "user",
            parts: [{ text: routerSystemPrompt + "\n\nUSER PROMPT:\n" + prompt }] 
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Router API Error:", sanitizeLog(JSON.stringify(data.error || {})));
        throw new Error(data.error?.message || "Failed to route prompt");
    }

    // 5. Parse Decision
    const rawDecision = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const decision = JSON.parse(rawDecision);

    // 6. Return Recommendation
    return res.status(200).json({ 
        provider: decision.provider,
        reasoning: decision.reasoning
    });

  } catch (error) {
    console.error("Router Proxy Error:", sanitizeLog(error.message));
    // Fallback to Gemini if routing fails so the user isn't stuck
    return res.status(200).json({ 
        provider: "gemini", 
        reasoning: "Router fallback due to error." 
    });
  }
}