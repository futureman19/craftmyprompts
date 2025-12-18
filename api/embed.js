// This function runs on Vercel's servers.
// It converts text into Vector Embeddings using Google's Gemini API.
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
  // 1. Rate Limit Check (Protect Wallet)
  const limitStatus = checkRateLimit(req, 20, 60 * 1000); // Higher limit (20/min) for batch processing
  if (!limitStatus.success) {
      return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, apiKey: userKey } = req.body;

  // 3. Determine API Key
  const apiKey = userKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key is missing." });
  }

  if (!text) {
      return res.status(400).json({ error: "Text content is required." });
  }

  // HELPER: Sanitize logs
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/key=[^&]*/g, 'key=***');
    }
    return msg;
  };

  try {
    // 4. Call Google Embedding API
    // Model: text-embedding-004 (Optimized for RAG)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: text }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Embedding API Error:", sanitizeLog(JSON.stringify(data.error || {})));
        throw new Error(data.error?.message || "Failed to generate embedding");
    }

    // 5. Return the Vector
    // Google returns { embedding: { values: [0.1, 0.2, ...] } }
    return res.status(200).json({ embedding: data.embedding.values });

  } catch (error) {
    console.error("Embedding Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}