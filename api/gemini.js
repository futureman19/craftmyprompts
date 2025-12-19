// This function runs on Vercel's servers.
// It securely handles requests to Google's Gemini API (Text & Vision).
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
  const { apiKey: userKey, prompt, model, endpoint, imageUrl } = req.body;

  // 4. Determine Key
  const apiKey = userKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key is missing." });
  }

  // HELPER: Sanitize logs
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/key=[^&]*/g, 'key=***');
    }
    return msg;
  };

  try {
    // --- SCENARIO A: LIST MODELS ---
    if (endpoint === 'listModels') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch models");
      return res.status(200).json(data);
    }

    // --- SCENARIO B: GENERATE CONTENT (Text or Vision) ---
    // Default to Flash 1.5 if not specified, as it has stable Vision support
    const targetModel = model || 'models/gemini-1.5-flash';
    const modelPath = targetModel.startsWith('models/') ? targetModel : `models/${targetModel}`;

    const contents = [];

    // VISION LOGIC: If an image URL is provided, fetch and format it for Gemini
    if (imageUrl) {
        try {
            // 1. Fetch image from URL (Server-side fetch avoids CORS issues)
            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) throw new Error(`Failed to fetch reference image: ${imgRes.statusText}`);
            
            // 2. Convert to ArrayBuffer -> Base64
            const arrayBuffer = await imgRes.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

            // 3. Construct Multimodal Part
            contents.push({
                role: "user",
                parts: [
                    { text: prompt || "Describe this image in detail for an AI art prompt." },
                    { 
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            });
        } catch (imgError) {
            console.error("Image Fetch Error:", imgError);
            return res.status(400).json({ error: "Could not process reference image. " + imgError.message });
        }
    } else {
        // STANDARD TEXT LOGIC
        contents.push({ 
            role: "user",
            parts: [{ text: prompt }] 
        });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Gemini API Error:", JSON.stringify(data.error || {}));
        throw new Error(data.error?.message || `Gemini API Error (${response.status})`);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Gemini Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}