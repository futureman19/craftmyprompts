
// This function attempts to generate an image using Gemini, preserving Pexels as a fallback.
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
    // 1. Rate Limit Check
    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) {
        return res.status(429).json({ error: limitStatus.error });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, apiKey: userKey } = req.body;
    const apiKey = userKey || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key is missing." });
    }

    // Helper for Pexels Fallback
    const fetchPexels = async () => {
        try {
            const pexelsKey = process.env.PEXELS_API_KEY;
            if (!pexelsKey) throw new Error("Pexels API Key missing");

            const baseUrl = 'https://api.pexels.com/v1/search';
            const params = new URLSearchParams({
                query: prompt || 'abstract',
                per_page: 1,
                orientation: 'landscape'
            });

            const response = await fetch(`${baseUrl}?${params.toString()}`, {
                method: 'GET',
                headers: { 'Authorization': pexelsKey }
            });

            if (!response.ok) throw new Error(`Pexels Error: ${response.status}`);

            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                return {
                    imageUrl: data.photos[0].src.medium,
                    source: 'pexels',
                    photographer: data.photos[0].photographer
                };
            }
            throw new Error("No photos found on Pexels");
        } catch (err) {
            console.error("Pexels Fallback Failed:", err);
            throw err;
        }
    };

    try {
        // ATTEMPT 1: GEMINI 2.5 FLASH IMAGE (Experimental / if available)
        // Note: The specific endpoint for image generation might vary. 
        // If this fails (404/400), we catch and use Pexels.

        // Constructing the request for the image model
        // As of late 2024, if "gemini-2.5-flash-image" isn't a standard endpoint yet, this will error out.
        // We treat it as an optimistic attempt.
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

        // Image generation payload structure differs from text. 
        // Assuming a standard 'generateContent' with text that triggers image gen, OR specific structure.
        // If the model is purely text-to-image, it might use a different JSON structure. 
        // For now, we'll try the standard content generation structure hoping standard multimodal capabilities

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                // generationConfig parameter for output modality if applicable
            })
        });

        const data = await response.json();

        // Check for success - this involves parsing the specific response structure for images
        // Usually images come as base64 in the response parts
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.inline_data) {
            const base64Data = data.candidates[0].content.parts[0].inline_data.data;
            const mimeType = data.candidates[0].content.parts[0].inline_data.mime_type;
            return res.status(200).json({
                imageUrl: `data:${mimeType};base64,${base64Data}`,
                source: 'gemini'
            });
        } else {
            // If response is OK but structure isn't what we expect for images (e.g. it returned text), throw.
            throw new Error("Gemini did not return an image.");
        }

    } catch (geminiError) {
        console.warn("Gemini Image Gen Failed, switching to fallback:", geminiError.message);

        // ATTEMPT 2: PEXELS FALLBACK
        try {
            const pexelsResult = await fetchPexels();
            return res.status(200).json(pexelsResult);
        } catch (fallbackError) {
            return res.status(500).json({
                error: "Image generation failed on both providers.",
                details: fallbackError.message
            });
        }
    }
}
