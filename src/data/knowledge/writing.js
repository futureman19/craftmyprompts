export const WRITING_KNOWLEDGE = {
    // --- SOCIAL TEXT STRUCTURES ---

    linkedin_viral: `
        // TOPIC: LinkedIn "Bro-etry" Style
        // 1. Critical Rules
        // - One sentence per line (max 2). No block paragraphs.
        // - The first 2 lines must force a "See more" click (The Hook).
        // - Use "White Space" to control reading pacing.
        
        // 2. Structure
        // [Hook: Information Gap or Strong Opinion]
        // [Space]
        // [The "Turn": Reversal of expectation]
        // [List of Value:]
        // - Insight 1
        // - Insight 2
        // [CTA: Question or "Follow me"]

        // 3. Common Mistakes
        // - AI writes formal intros like "Dear Network".
        // - AI groups text into dense paragraphs.
    `,

    twitter_threads: `
        // TOPIC: Twitter/X Threads
        // 1. Critical Rules
        // - Tweet 1 is the Hook: Must include "Social Proof" + "The Promise".
        // - Use "1/x" or 🧵 to signal a thread.
        // - Final Tweet is the CTA: "Follow me" + "RT the first tweet".

        // 2. Syntax Pattern
        // Hook: "I analyzed 500 sales calls. Here is the script that doubles conversions: 🧵"
        // Body: "1. The Permission Ask..."
        // CTA: "If you found this useful, RT the first tweet."

        // 3. Common Mistakes
        // - AI uses hashtags in the middle of sentences.
        // - AI fails to number the tweets.
    `,

    // --- CONTENT MARKETING ---

    seo_blog: `
        // TOPIC: SEO Blog Structure
        // 1. Critical Rules
        // - Primary Keyword in H1.
        // - Target "People Also Ask" questions as H2 headers.
        // - Answer the H2 immediately in the next paragraph (Definition format for Snippets).

        // 2. Structure
        // <article>
        //   <h1>Guide to [Keyword]</h1>
        //   <h2>What is [Keyword]?</h2>
        //   <p>[Keyword] is... (40-60 words)</p>
        //   <h2>Benefits</h2>
        //   <ul>...</ul>
        // </article>

        // 3. Common Mistakes
        // - AI writes long fluff intros before answering the user query.
        // - AI uses H4s instead of H2s for main sections.
    `,

    // --- SALES & OUTREACH ---

    cold_email_b2b: `
        // TOPIC: Cold Email (B2B)
        // 1. Critical Rules
        // - Max 75 words. Ideally 3-4 sentences.
        // - No "I hope you are well." Start with the specific Trigger.
        // - CTA: Ask for *interest*, not *time* ("Worth a chat?" vs "Tuesday at 2?").

        // 2. Framework (The 3-Sentence Rule)
        // Hi [Name],
        // Saw you are hiring for [Role] — typically means [Pain Point].
        // We help [Competitor] solve this by [Mechanism].
        // Worth a quick conversation?

        // 3. Common Mistakes
        // - AI writes passive openings ("I wanted to reach out...").
        // - AI asks for a 30-minute meeting immediately.
    `,

    // --- META PROMPTING (LOGIC) ---

    chain_of_thought: `
        // TOPIC: Chain of Thought (CoT)
        // 1. Critical Rules
        // - Force output of "## Reasoning" before "## Answer".
        // - Use trigger phrase: "Let's think step by step."
        
        // 2. System Instruction
        // "You are a logic engine. 
        // 1. Break the problem down. 
        // 2. Output your reasoning in steps. 
        // 3. Final Answer."
    `,

    tree_of_thoughts: `
        // TOPIC: Tree of Thoughts (ToT)
        // 1. Critical Rules
        // - Request 3 distinct solutions (Experts).
        // - Force a "Critique" phase.
        // - Force a "Synthesis" phase.

        // 2. Prompt Structure
        // "Expert 1: Propose solution A.
        // Expert 2: Propose solution B.
        // Expert 3: Critique A and B.
        // Synthesis: Combine best of both."
    `
};