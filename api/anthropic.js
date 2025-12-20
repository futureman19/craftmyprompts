// This function runs on Vercel's servers.
// It securely handles requests to Anthropic's Claude API.
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

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Parse the body
  const { apiKey: userKey, prompt, model } = req.body;

  // 4. Determine which Key to use
  // Priority: User's manual key -> Global Environment Variable
  const apiKey = userKey || process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Anthropic API Key is missing. Please enter one in settings." });
  }

  // HELPER: Sanitize logs to remove API keys
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
      // Remove standard API key formats or x-api-key headers
      return msg.replace(/x-api-key=[^&]*/g, 'x-api-key=***').replace(/sk-ant-[a-zA-Z0-9\-\._]+/g, 'sk-ant-***');
    }
    return msg;
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01', // Required header for Claude
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Log secure error details
      console.error("Anthropic API Error:", JSON.stringify(data.error || {}));
      throw new Error(data.error?.message || `Anthropic API Error (${response.status})`);
    }

    // Anthropic returns data.content[0].text
    return res.status(200).json(data);

  } catch (error) {
    console.error("Anthropic Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}