import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        const { prompt, apiKey, aspectRatio } = req.body;

        if (!apiKey) return res.status(400).json({ error: "Missing API Key" });
        if (!prompt) return res.status(400).json({ error: "Missing Prompt" });

        // FIX: Using the verified model ID from your history
        const modelVersion = 'imagen-4.0-generate-001';

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:predict`;

        console.log(`[Imagine] Requesting ${modelVersion}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                instances: [{ prompt: prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio || "16:9"
                }
            })
        });

        const data = await response.json();

        // FAIL CHECK
        if (!response.ok) {
            console.error("[Imagine] Google Error:", JSON.stringify(data));
            const msg = data.error?.message || "Google API Refused Connection";
            return res.status(response.status).json({ error: msg, details: data });
        }

        // DATA CHECK
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        const mimeType = data.predictions?.[0]?.mimeType || "image/png";

        if (!base64Image) {
            return res.status(500).json({ error: "Google returned success but no image.", raw: data });
        }

        return res.status(200).json({
            image: `data:${mimeType};base64,${base64Image}`
        });

    } catch (error) {
        console.error("[Imagine] Fatal:", error);
        return res.status(500).json({ error: error.message });
    }
}
