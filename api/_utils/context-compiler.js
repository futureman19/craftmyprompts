import { getProviderGuide } from './doc-reader.js';

export const compileContext = async (rawPrompt, provider) => {
    console.log(`⚙️ Compiling context for provider: ${provider}`);

    // 1. Fetch the Knowledge Base
    const guide = getProviderGuide(provider);
    if (!guide || guide.startsWith("No specific")) {
        console.log("No specific guide found, passing raw prompt.");
        return rawPrompt;
    }

    // 2. The Compiler System Prompt (The Polyglot Logic)
    const compilerSystemPrompt = `
    IDENTITY: You are a Context Compiler. 
    GOAL: Rewrite the USER PROMPT to strictly follow the PROVIDER GUIDELINES.
    
    PROVIDER GUIDELINES:
    ${guide}
    
    RULES:
    1. Do not change the user's intent.
    2. Apply the formatting (XML, Markdown, etc) strictly as defined in the guidelines.
    3. Output ONLY the optimized prompt. No chat.
    `;

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("Missing OpenAI Key for compilation, skipping.");
            return rawPrompt;
        }

        // 3. Run the Compilation (Fast Model) using Fetch to avoid dependencies
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: compilerSystemPrompt },
                    { role: "user", content: rawPrompt }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Compilation API Error:", err);
            return rawPrompt;
        }

        const data = await response.json();
        const optimized = data.choices[0]?.message?.content;

        if (!optimized) return rawPrompt;

        console.log("✅ Context Compiled.");
        return optimized;

    } catch (error) {
        console.error("Context Compilation Failed:", error);
        return rawPrompt; // Fail safe: return original
    }
};
