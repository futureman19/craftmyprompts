export const KNOWLEDGE_BASE = {
    // --- CODING KNOWLEDGE ---
    
    scrypt: `
        // --- sCrypt (Bitcoin Smart Contracts) Cheat Sheet ---
        // Library: scrypt-ts (Modern TypeScript version)
        
        // 1. Basic Contract Structure
        import { SmartContract, method, prop, assert } from 'scrypt-ts';

        export class MyContract extends SmartContract {
            @prop()
            readonly x: bigint;

            constructor(x: bigint) {
                super(...arguments);
                this.x = x;
            }

            @method()
            public unlock(y: bigint) {
                assert(this.x === y, 'x must equal y');
            }
        }
        
        // 2. Key Rules
        // - All contract properties must be decorated with @prop().
        // - All public methods (entry points) must be decorated with @method().
        // - Use 'assert()' instead of 'if/throw' for verification logic.
        // - Use 'bigint' for all numbers to handle satoshis safely.
        // - State updates must be explicit (e.g., this.ctx.hashOutputs).
    `,

    tailwind: `
        // --- Modern Tailwind CSS Best Practices ---
        // 1. Layouts: Use Flexbox and Grid extensively.
        //    Example: 'flex flex-col md:flex-row gap-4 items-center'
        // 2. Dark Mode: Use the 'dark:' prefix for all color changes.
        //    Example: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
        // 3. Spacing: Prefer standard scales (p-4, m-2, gap-4).
        // 4. Mobile First: Write base styles for mobile, then use 'md:', 'lg:' for larger screens.
        // 5. Typography: Use 'font-sans', 'font-mono', 'text-sm', 'leading-relaxed'.
    `,

    // --- WRITING KNOWLEDGE ---

    viral_hooks: `
        // --- Viral Hook Structures ---
        // 1. The Contrarian: "Most people think X. Here is why they are wrong."
        // 2. The Data Drop: "I analyzed 1,000 datasets. Here are the 3 patterns I found."
        // 3. The Transformation: "How I went from [Bad State] to [Good State] in [Time]."
        // 4. The Listicle: "7 tools that feel illegal to know."
    `,

    // --- META KNOWLEDGE ---

    prompt_engineering: `
        // --- Advanced Prompt Engineering Guide ---
        // 1. Role Prompting: Always assign a specific expert persona (e.g., "Act as a Senior React Engineer").
        // 2. Chain of Thought: Ask the model to "Think step-by-step" before answering.
        // 3. Few-Shot Learning: Provide 2-3 examples of the desired input/output format.
        // 4. Constraints: Explicitly state what NOT to do (Negative Prompting).
        // 5. Output Format: Define the exact structure (JSON, Markdown, CSV).
    `
};