import { CODING_KNOWLEDGE } from './knowledge/coding.js';
import { SOCIAL_KNOWLEDGE } from './knowledge/social.js';
import { ART_KNOWLEDGE } from './knowledge/art.js';
import { WRITING_KNOWLEDGE } from './knowledge/writing.js';

// This is the Central Knowledge Hub.
// It aggregates specialized knowledge modules into a single object 
// that can be easily accessed by the Prompt Builder logic.

export const KNOWLEDGE_BASE = {
    ...CODING_KNOWLEDGE,
    ...SOCIAL_KNOWLEDGE,
    ...ART_KNOWLEDGE,
    ...WRITING_KNOWLEDGE,

    // --- META KNOWLEDGE (Global strategies) ---
    // Kept here or can be moved to its own module later if it grows.

    prompt_engineering: `
        // --- Advanced Prompt Engineering Guide ---
        // 1. Role Prompting: Always assign a specific expert persona.
        // 2. Chain of Thought: Ask the model to "Think step-by-step".
        // 3. Few-Shot Learning: Provide 2-3 examples of desired output.
        // 4. Constraints: Explicitly state what NOT to do.
        // 5. Output Format: Define the exact structure (JSON, Markdown, CSV).
    `
};