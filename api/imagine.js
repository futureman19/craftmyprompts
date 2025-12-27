import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    // 1. Safety Checks
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        const { prompt, apiKey, aspectRatio } = req.body;

        if (!apiKey) {
            console.error("Imagine Error: Missing API Key");
            return res.status(400).json({ error: "Missing Google API Key" });
        }
        if (!prompt) return res.status(400).json({ error: "No prompt provided" });

        // 2. Configuration
        // Using the standard Imagen 3 model ID for AI Studio
        const modelVersion = 'imagen-3.0-generate-001';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:predict?key=${apiKey}`;

        // 3. Call Google API
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    // valid ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
                    aspectRatio: aspectRatio || "16:9"
                }
            })
        });

        const data = await response.json();

        // 4. Detailed Error Handling
        if (!response.ok) {
            console.error("Google Imagen API Failed:", JSON.stringify(data, null, 2));
            // Return the specific error message from Google so the frontend sees it
            const googleMessage = data.error?.message || data.error?.status || "Unknown Google Error";
            throw new Error(`Google Refused: ${googleMessage}`);
        }

        // 5. Extract Image
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        const mimeType = data.predictions?.[0]?.mimeType || "image/png";

        if (!base64Image) {
            console.error("Google Response Empty:", data);
            throw new Error("Google returned success but no image data.");
        }

        return res.status(200).json({
            image: `data:${mimeType};base64,${base64Image}`
        });

    } catch (error) {
        console.error("Imagine Route Fatal Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
