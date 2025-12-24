import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    // 1. Safety Checks
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        // CTO NOTE: We now accept technical specs from the frontend
        const { prompt, apiKey, aspectRatio, personGeneration } = req.body;

        if (!apiKey) throw new Error("Missing Google API Key. Please add it in Settings.");
        if (!prompt) throw new Error("No prompt provided.");

        // 2. Call Google Imagen 4 (via REST API)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

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
                    // Note: imageSize is rarely supported in the generic API, 
                    // defaulting to standard resolution usually works best.
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
