import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    // 1. Safety Checks
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        const { prompt, apiKey } = req.body;

        if (!apiKey) throw new Error("Missing Google API Key. Please add it in Settings.");
        if (!prompt) throw new Error("No prompt provided.");

        // 2. Call Google Imagen 3 (via REST API)
        // UPDATED MODEL: imagen-3.0-generate-002
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    // Imagen 3 supports: "1:1", "3:4", "4:3", "9:16", "16:9"
                    aspectRatio: "1:1"
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error:", data);
            throw new Error(data.error?.message || "Imagen Generation Failed");
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
