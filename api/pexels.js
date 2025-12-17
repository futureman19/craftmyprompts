// This function runs on Vercel's servers.
// It acts as a secure proxy to the Pexels API for visual assets.
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
  // 1. Rate Limit Check (Protect Pexels Quota)
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
      return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, color, apiKey: userKey } = req.body;

  // 3. Determine API Key
  // Priority: User's manual key -> Global Environment Variable
  const apiKey = userKey || process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Pexels API Key is missing. Please configure it in Vercel settings." });
  }

  // HELPER: Sanitize logs to remove sensitive tokens
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/[a-zA-Z0-9]{56}/g, '***REDACTED***'); // Pexels keys are long alphanumeric strings
    }
    return msg;
  };

  try {
    // 4. Construct Pexels URL
    const baseUrl = 'https://api.pexels.com/v1/search';
    const params = new URLSearchParams({
        query: query || 'abstract', // Default fallback
        per_page: 12,              // Fetch 12 images for a grid
        orientation: 'landscape'   // Good default for reference images
    });

    // Add color filter if provided (e.g., #FF0000)
    if (color) {
        params.append('color', color.replace('#', ''));
    }

    // 5. Call Pexels API
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.error || `Pexels API Error (${response.status})`;
        console.error("Pexels Error Details:", sanitizeLog(JSON.stringify(data)));
        throw new Error(errorMsg);
    }

    // 6. Success - Return optimized data structure
    const photos = data.photos.map(photo => ({
        id: photo.id,
        url: photo.src.medium, // Use medium size for previews
        fullUrl: photo.src.original,
        alt: photo.alt,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        avg_color: photo.avg_color
    }));

    return res.status(200).json({ photos });

  } catch (error) {
    console.error("Pexels Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}