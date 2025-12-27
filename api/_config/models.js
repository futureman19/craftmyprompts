// The Platinum Standard: Unified Image Generation Schema
// Source: Technical Audit 2025-12-26

export const MODEL_CONFIG = [
    {
        id: "midjourney-v6",
        label: "Midjourney v6.1",
        provider: "Midjourney",
        type: "hybrid", // Discord Relay
        capabilities: {
            ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"], // Highly flexible
            flexible_ratios: true, // Accepts custom --ar
            resolutions: ["Dynamic"], // Determined by model
            negative_prompt: true, // Supported via --no
            raw_mode: true, // Supported via --style raw
            magic_prompt: true // Supports prompt enhancement
        },
        notes: "High latency (30-60s). Best for aesthetics."
    },
    {
        id: "dall-e-3",
        label: "DALL-E 3",
        provider: "OpenAI",
        type: "strict_enum",
        capabilities: {
            ratios: ["1:1", "16:9", "9:16"], // STRICT: Only these 3
            flexible_ratios: false,
            resolutions: ["1024x1024", "1792x1024", "1024x1792"],
            negative_prompt: false, // UNSUPPORTED
            raw_mode: false, // Natural/Vivid only
            magic_prompt: true // Built-in rewriting
        },
        notes: "Strict 400 Error on unsupported ratios."
    },
    {
        id: "imagen-4.0-generate-001",
        label: "Google Imagen 4",
        provider: "Google",
        type: "strict_enum",
        capabilities: {
            ratios: ["1:1", "16:9", "9:16", "3:4", "4:3"], // NO 21:9
            flexible_ratios: false,
            resolutions: ["2048x2048", "1024x1024"],
            negative_prompt: false, // DEPRECATED in v2/v4
            raw_mode: false,
            magic_prompt: false
        },
        notes: "Rejects numeric types. Requires valid Aspect Ratio string."
    },
    {
        id: "imagen-3.0-generate-001",
        label: "Google Imagen 3 (Fast)",
        provider: "Google",
        type: "strict_enum",
        capabilities: {
            ratios: ["1:1", "16:9", "9:16", "3:4", "4:3"],
            flexible_ratios: false,
            resolutions: ["1024x1024"],
            negative_prompt: false,
            raw_mode: false,
            magic_prompt: false
        },
        notes: "Public Stable fallback."
    },
    {
        id: "stable-diffusion-3.5-large",
        label: "Stable Diffusion 3.5",
        provider: "Stability AI",
        type: "flexible_pixel",
        capabilities: {
            ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], // Supports buckets
            flexible_ratios: true,
            resolutions: ["1024x1024", "1344x768", "1216x832", "1536x640"],
            negative_prompt: true, // CRITICAL feature
            raw_mode: false,
            magic_prompt: false
        },
        notes: "Control-centric. Needs negative prompts."
    },
    {
        id: "flux-1.1-pro",
        label: "Flux 1.1 Pro",
        provider: "Black Forest Labs",
        type: "hybrid",
        capabilities: {
            ratios: ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"],
            flexible_ratios: true,
            resolutions: ["Multiples of 32"],
            negative_prompt: false, // UNSUPPORTED (Distilled)
            raw_mode: true, // Supported
            magic_prompt: false
        },
        notes: "Precision model. Rejects negative prompts."
    }
];
