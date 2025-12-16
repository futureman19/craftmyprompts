/**
 * AI Art Model & Platform Constraints
 * Defines hard technical limits for Image Generation models.
 * Used to validate parameters and aspect ratios.
 */

export const ART_RULES = {
    // --- MODELS ---
    "Midjourney v6": {
        supported_ratios: ["1:1", "16:9", "9:16", "4:5", "2:3", "21:9"],
        parameters: {
            stylize: { min: 0, max: 1000, default: 100 },
            chaos: { min: 0, max: 100, default: 0 },
            weird: { min: 0, max: 3000, default: 0 }
        },
        features: ["--tile", "--sref", "--cref", "--niji"]
    },
    "DALL-E 3": {
        supported_ratios: ["1:1 (1024x1024)", "16:9 (1792x1024)", "9:16 (1024x1792)"],
        parameters: {
            quality: ["standard", "hd"],
            style: ["vivid", "natural"]
        },
        // DALL-E 3 doesn't support negative prompts or weights in the standard API way
        restrictions: ["No Negative Prompts", "No Weights (::)"] 
    },
    "Stable Diffusion XL": {
        supported_ratios: ["1:1", "16:9", "9:16", "3:2", "2:3"], // Flexible resolution
        features: ["LoRA", "Negative Prompt", "ControlNet"]
    },
    "Flux.1": {
        supported_ratios: ["Flexible"], // Flux handles most ratios well
        strengths: ["Text Rendering", "Complex Composition"],
        restrictions: ["Negative Prompts (Ignored by some schedulers)"]
    },

    // --- PLATFORM OUTPUT SPECS (Reference) ---
    // These help the user select the right ratio for the destination
    "Instagram Post": { ratio: "4:5", resolution: "1080x1350" },
    "Instagram Story": { ratio: "9:16", resolution: "1080x1920" },
    "YouTube Thumbnail": { ratio: "16:9", resolution: "1280x720" },
    "Pinterest Pin": { ratio: "2:3", resolution: "1000x1500" },
    "Twitter Header": { ratio: "3:1", resolution: "1500x500" }
};