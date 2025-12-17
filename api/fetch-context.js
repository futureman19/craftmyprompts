// This function runs on the server to bypass CORS restrictions when fetching external URLs.
// It acts as a bridge: Your App -> This Function -> External Website -> Your App
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
  // 1. Rate Limit Check (Prevent scraping abuse)
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
      return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // 3. Validation
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // HELPER: Sanitize logs to remove sensitive query params from URLs
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        // Regex to catch common secret params (key, token, auth, secret, password)
        return msg.replace(/([?&](key|token|auth|secret|password|apikey|access_token)=)[^&]+/gi, '$1***');
    }
    return msg;
  };

  try {
    // 4. Fetch the external resource
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    // 5. Get the text content
    const text = await response.text();

    // 6. Safety Truncate
    // Prevent massive payloads from crashing the UI (Limit to ~50k chars)
    const truncatedText = text.length > 50000 ? text.substring(0, 50000) + "\n...[Truncated]..." : text;

    return res.status(200).json({ content: truncatedText });

  } catch (error) {
    // Log the sanitized error
    const cleanError = sanitizeLog(error.message);
    console.error("Context Fetch Error:", cleanError);
    return res.status(500).json({ error: "Failed to retrieve context. The URL might be private or blocked." });
  }
}