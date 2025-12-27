// OWNER: The Gallery Agent
// PURPOSE: Knowledge of Image Generation Models & Prompt Syntax

export const GALLERY_BRAIN = {
    knowledge_base: "Image Generation Technical Specifications",
    models: [
        {
            id: "midjourney-v6",
            label: "Midjourney v6.1",
            provider: "Midjourney",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"],
                flexible_ratios: true,
                negative_prompt: true,
                raw_mode: true
            },
            syntax_rules: "Use --ar for aspect ratio. Use --no for negative prompts."
        },
        {
            id: "dall-e-3",
            label: "DALL-E 3",
            provider: "OpenAI",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16"],
                flexible_ratios: false,
                negative_prompt: false,
                raw_mode: false
            },
            syntax_rules: "Natural language only. No negative prompts."
        },
        {
            id: "imagen-4.0-generate-001",
            label: "Google Imagen 4",
            provider: "Google",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16", "3:4", "4:3"],
                flexible_ratios: false,
                negative_prompt: false,
                raw_mode: false
            },
            syntax_rules: "Strict aspect ratio strings. No exclusion parameters."
        },
        {
            id: "imagen-3.0-generate-001",
            label: "Google Imagen 3",
            provider: "Google",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16", "3:4", "4:3"],
                flexible_ratios: false,
                negative_prompt: false,
                raw_mode: false
            },
            syntax_rules: "Strict aspect ratio strings."
        },
        {
            id: "stable-diffusion-3.5-large",
            label: "Stable Diffusion 3.5",
            provider: "Stability AI",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
                flexible_ratios: true,
                negative_prompt: true,
                raw_mode: false
            },
            syntax_rules: "Separate negative_prompt parameter."
        },
        {
            id: "flux-1.1-pro",
            label: "Flux 1.1 Pro",
            provider: "Black Forest Labs",
            capabilities: {
                ratios: ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"],
                flexible_ratios: true,
                negative_prompt: false,
                raw_mode: true
            },
            syntax_rules: "Distilled model. Rejects negative prompts."
        }
    ]
};
