import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    // 1. Safety Checks
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        // CTO NOTE: We accept technical specs from the frontend
        const { prompt, apiKey, aspectRatio, personGeneration } = req.body;

        if (!apiKey) throw new Error("Missing Google API Key. Please add it in Settings.");
        if (!prompt) throw new Error("No prompt provided.");

        // 2. Call Google Imagen 3 (standard stable version) or 4 if available
        // Note: Using imagen-3.0-generate-001 as it's widely available on Gemini keys right now.
        // If you specifically have access to 4, keep it as 4.
        const modelVersion = 'imagen-3.0-generate-001';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    // Dynamic Aspect Ratio (Default to 1:1 if undefined)
                    aspectRatio: aspectRatio || "1:1",
                    // Dynamic Person Filter (Default to allow_adult)
                    personGeneration: personGeneration || "allow_adult",
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", data);
            throw new Error(data.error?.message || `Imagen Generation Failed: ${data.error?.status || 'Unknown Error'}`);
        }

        // 3. Extract Image Data
        // Google returns: { predictions: [ { bytesBase64Encoded: "..." } ] }
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        const mimeType = data.predictions?.[0]?.mimeType || "image/png";

        if (!base64Image) throw new Error("No image data received from Google.");

        // Return ready-to-render string
        return res.status(200).json({
            image: `data:${mimeType};base64,${base64Image}`
        });

    } catch (error) {
        console.error("Imagine Route Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
