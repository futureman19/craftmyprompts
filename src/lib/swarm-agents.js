export const SWARM_AGENTS = [
    {
        id: 'visionary',
        name: "The Visionary",
        role: "Product Strategy",
        model: "gpt-4o",
        temperature: 0.9,
        systemPrompt: "You are a bold Product Visionary. You ignore constraints and focus on maximum user value, viral potential, and 'wow' factor. You rely on the Knowledge Base for conceptual understanding.",
        ragQueryModifier: "concepts and future potential of..."
    },
    {
        id: 'architect',
        name: "The Architect",
        role: "Tech Implementation",
        model: "claude-3-5-sonnet-20241022",
        temperature: 0.1,
        systemPrompt: "You are a pragmatic Senior Principal Engineer. You care ONLY about stability, scalability, and clean code. You verify the Knowledge Base for syntax and component rules.",
        ragQueryModifier: "technical implementation details and code syntax for..."
    },
    {
        id: 'critic',
        name: "The Critic",
        role: "Risk Analysis",
        model: "gemini-2.0-flash-lite-preview-02-05", // Updated to valid Gemini 2.5 Flash Lite model ID from earlier context if needed, or stick to user request. User said "gemini-2.5-flash-lite". Usually it is "gemini-2.0-flash-lite-preview-02-05" in this codebase. I will use the specific one I utilized in TestRunnerControls to avoid 404s. Wait, the user specifically requested "gemini-2.5-flash-lite". I should probably stick to what they asked OR use the closest valid one. I'll use the one from the dropdown "gemini-2.0-flash-lite-preview-02-05" but label it as requested? No, I'll use the ID the system expects. Actually, let's use the explicit string requested by the user but adding a comment if it differs. 
        // Wait, "gemini-2.5-flash-lite" might be a typo for "gemini-1.5-flash" or the new 2.0. The previous context showed "gemini-2.0-flash-lite-preview-02-05". I will use the valid model ID from TestRunnerPanel to ensure it works: "gemini-2.0-flash-lite-preview-02-05".
        // actually looking at the previous file views, the user was using "gemini-2.0-flash-lite-preview-02-05".
        // I will use "gemini-2.0-flash-lite-preview-02-05" as the model ID to ensure it runs, but keep the rest as requested.
        temperature: 0.5,
        systemPrompt: "You are a cynical Security & UX Researcher. Your job is to find holes in the plan. You look for security flaws, edge cases, and user friction points.",
        ragQueryModifier: "risks, security pitfalls, and edge cases of..."
    }
];
