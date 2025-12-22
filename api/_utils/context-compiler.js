import fs from 'fs';
import path from 'path';

// 1. Doc Reader Helper
const getProviderGuide = (provider) => {
    try {
        if (!provider) return null;
        // Normalize names: 'claude-3-opus' -> 'anthropic'
        let filename = provider.toLowerCase();
        if (filename.includes('claude') || filename.includes('anthropic')) filename = 'anthropic';
        else if (filename.includes('gpt') || filename.includes('openai')) filename = 'openai';
        else if (filename.includes('gemini') || filename.includes('google')) filename = 'google';
        else return null; // Unknown provider

        const filePath = path.join(process.cwd(), 'src', 'data', 'docs', `${filename}.md`);
        if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
    } catch (e) { console.error("Doc read error:", e); }
    return null;
};

// 2. The Compiler Function
export const compileContext = async (rawPrompt, provider) => {
    // If no provider or guide found, return raw (Pass-through)
    const guide = getProviderGuide(provider);
    if (!guide) return rawPrompt;

    console.log(`⚙️ Compiling context for ${provider}...`);

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("Context Compiler: Missing OpenAI Key.");
            return rawPrompt;
        }

        // Use fetch instead of 'openai' package to keep dependencies clean
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast, cheap, smart enough for this
                messages: [
                    {
                        role: "system",
                        content: `IDENTITY: You are a Context Compiler. 
                        GOAL: Rewrite the USER PROMPT to strictly follow the PROVIDER GUIDELINES.
                        
                        GUIDELINES:
                        ${guide}
                        
                        RULES:
                        1. Preserve user intent 100%. Do not add new ideas.
                        2. Apply structure/tags from guidelines.
                        3. Output ONLY the optimized prompt.`
                    },
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

        return optimized || rawPrompt;

    } catch (error) {
        console.error("Compilation failed:", error);
        return rawPrompt; // Fail safe
    }
};
