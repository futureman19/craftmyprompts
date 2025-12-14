export const ART_KNOWLEDGE = {
    midjourney_v6: `
        // TOPIC: Midjourney v6 Parameters
        // 1. Critical Rules
        // - Use \`--sref\` for style consistency.
        // - Use \`--cref\` for character consistency.
        // - \`--stylize\` (0-1000) = adherence to MJ style; \`--raw\` = adherence to prompt.

        // 2. Syntax Pattern
        // /imagine prompt: Cyberpunk street detective --ar 16:9 --v 6.0 --sref [url] --cref [url] --cw 100 --stylize 250 --weird 100

        // 3. Common Mistakes
        // - AI places parameters at the beginning (must be at the end).
        // - AI uses \`--cw 0\` (face only) when it should use \`--cw 100\` (full outfit).
    `,

    runway_camera: `
        // TOPIC: Runway Gen-2 Camera Control
        // 1. Critical Rules
        // - Separate "Camera Motion" (Global) from "Motion Brush" (Local).
        // - Use values 1-10. Keep values low (3-5) for realism; high values cause warping.
        // - Specific Keywords: "Pan", "Tilt", "Zoom", "Roll".

        // 2. Settings Format
        // Camera Motion: Pan Right (+2), Zoom In (+3)
        // Motion Brush (Car): Horizontal Speed (+8)

        // 3. Common Mistakes
        // - AI prompts "Drone shot" without specific camera motion sliders.
        // - AI sets values to max (10), resulting in distortion.
    `,

    flux_prompts: `
        // TOPIC: Flux (Open Source Art)
        // 1. Critical Rules
        // - Use natural language sentences, not comma-separated tags.
        // - Enclose text to be rendered in quotes: "a sign saying 'HELLO'".
        // - Flux does NOT support negative prompts; omit unwanted elements or use positive description.

        // 2. Syntax Pattern
        // A photo of a woman in a cafe holding a cup that says "FLUX". Cinematic lighting, 35mm film grain.

        // 3. Common Mistakes
        // - AI uses negative prompts (Flux ignores them).
        // - AI uses "tag soup" which confuses the flow matching.
    `
};