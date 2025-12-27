import { checkRateLimit } from './_utils/rate-limiter.js';
import { GALLERY_BRAIN } from './_agents/art/brains/gallery_brain.js'; // Import The Gallery's Brain

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const limitStatus = checkRateLimit(req);
    if (!limitStatus.success) return res.status(429).json({ error: limitStatus.error });

    try {
        // 1. INPUTS
        // We now expect 'modelId' from the frontend.
        const { prompt, apiKey, aspectRatio, modelId } = req.body;

        if (!apiKey) return res.status(400).json({ error: "Missing API Key" });
        if (!prompt) return res.status(400).json({ error: "Missing Prompt" });

        // 2. IDENTIFY MODEL
        // Map the brain data to a usable config list
        const MODEL_CONFIG = GALLERY_BRAIN.models;

        // Default to Imagen 3 if no ID provided (Safe Fallback)
        const targetId = modelId || 'imagen-3.0-generate-001';
        const modelConfig = MODEL_CONFIG.find(m => m.id === targetId) || MODEL_CONFIG.find(m => m.id === 'imagen-3.0-generate-001');

        console.log(`[Imagine] Selected Brain: ${modelConfig.label} (${modelConfig.id})`);

        // 3. ENFORCE CAPABILITIES (The Guardrails)
        let safeRatio = aspectRatio || "16:9";

        // Rule: If the model is STRICT (like Imagen 4/DALL-E) and the ratio isn't supported, SNAP to default.
        if (!modelConfig.capabilities.flexible_ratios && !modelConfig.capabilities.ratios.includes(safeRatio)) {
            console.warn(`[Imagine] ${modelConfig.label} prohibits '${safeRatio}'. Auto-correcting to 16:9.`);
            safeRatio = "16:9";
        }

        // 4. PROVIDER ROUTING
        // This structure allows us to easily add OpenAI/Midjourney logic later.
        if (modelConfig.provider === 'Google') {
            return await handleGoogleRequest(res, apiKey, modelConfig.id, prompt, safeRatio);
        } else {
            // Fallback for providers we haven't wired up backend logic for yet
            return res.status(400).json({ error: `Provider '${modelConfig.provider}' is not yet connected to the backend.` });
        }

    } catch (error) {
        console.error("[Imagine] Fatal:", error.message);
        return res.status(500).json({ error: error.message });
    }
}

// --- GOOGLE IMAGEN HANDLER ---
async function handleGoogleRequest(res, apiKey, modelId, prompt, aspectRatio) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict`;

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
                    aspectRatio: aspectRatio
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[Google] Error:`, JSON.stringify(data));
            const msg = data.error?.message || "Google API Refused";

            // Smart Fallback: If Imagen 4 fails (404/400), try Imagen 3 automatically
            if (modelId.includes('imagen-4.0')) {
                console.log("[Google] Imagen 4 failed. Retrying with Imagen 3 Fast...");
                return handleGoogleRequest(res, apiKey, 'imagen-3.0-generate-001', prompt, aspectRatio);
            }

            return res.status(400).json({ error: msg, details: data });
        }

        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        const mimeType = data.predictions?.[0]?.mimeType || "image/png";

        if (!base64Image) throw new Error("Google returned success but no image.");

        return res.status(200).json({
            image: `data:${mimeType};base64,${base64Image}`
        });

    } catch (e) {
        throw e;
    }
}
