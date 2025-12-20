// This file runs on Vercel's servers, not in the user's browser.
// It acts as a secure proxy to talk to OpenAI.
import { checkRateLimit } from './_utils/rate-limiter.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // 1. Rate Limit Check
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
    return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Get the API Key
  // Priority: User's manual key (passed in body) -> Global Environment Variable
  // Checks both standard and VITE_ prefixed env vars for maximum compatibility
  const apiKey = req.body.apiKey || process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API Key is missing. Please enter one in settings." });
  }

  // HELPER: Sanitize logs to remove API keys (Bearer tokens)
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
      // Replace "Bearer sk-..." with "Bearer ***"
      return msg.replace(/Bearer\s+[a-zA-Z0-9\-\._]+/g, 'Bearer ***');
    }
    return msg;
  };

  // 4. Extract prompt from request
  const { prompt, model } = req.body;

  try {
    // 5. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Log secure error details
      console.error("OpenAI API Error:", JSON.stringify(data.error || {}));
      throw new Error(data.error?.message || "OpenAI API Error");
    }

    // 6. Send result back to frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("OpenAI Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}