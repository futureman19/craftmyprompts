// This function runs on Vercel's servers.
// It securely handles requests to Groq's API for high-speed Llama inference.
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

  // 3. Parse the body
  const { apiKey: userKey, prompt, model } = req.body;

  // 4. Determine which Key to use
  // Priority: User's manual key -> Global Environment Variable
  const apiKey = userKey || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Groq API Key is missing. Please enter one in settings." });
  }

  // HELPER: Sanitize logs to remove API keys (Bearer tokens)
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        // Groq keys usually start with gsk_
        return msg.replace(/Bearer\s+gsk_[a-zA-Z0-9]+/g, 'Bearer gsk_***');
    }
    return msg;
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "llama3-70b-8192", // Default to Llama 3 70B if not specified
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
        // Log the error for debugging
        console.error("Groq API Error Details:", JSON.stringify(data));
        throw new Error(data.error?.message || `Groq API Error (${response.status})`);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Groq Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}