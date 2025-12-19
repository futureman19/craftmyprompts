export const WRITING_KNOWLEDGE = {
  // --- SOCIAL TEXT STRUCTURES ---

  "linkedin_viral": {
    "rule": "Use 'Bro-etry' spacing (one sentence per line). No block paragraphs.",
    "mechanic": "The first 2 lines must force a 'See more' click (The Hook). Use 'White Space' to control reading pacing.",
    "pitfall": "AI writes formal intros like 'Dear Network' or groups text into dense paragraphs."
  },

  "twitter_threads": {
    "rule": "Tweet 1 is the Hook: Must include 'Social Proof' + 'The Promise'.",
    "mechanic": "Use '1/x' or 🧵 to signal a thread. Final Tweet is the CTA: 'Follow me' + 'RT the first tweet'.",
    "pitfall": "AI uses hashtags in the middle of sentences or fails to number the tweets."
  },

  // --- CONTENT MARKETING ---

  "seo_blog": {
    "rule": "Primary Keyword in H1. Target 'People Also Ask' questions as H2 headers.",
    "mechanic": "Answer the H2 immediately in the next paragraph (Definition format for Snippets).",
    "pitfall": "AI writes long fluff intros before answering the user query or uses H4s instead of H2s for main sections."
  },

  // --- SALES & OUTREACH ---

  "cold_email_b2b": {
    "rule": "Max 75 words. Ideally 3-4 sentences.",
    "mechanic": "No 'I hope you are well.' Start with the specific Trigger. CTA: Ask for *interest*, not *time* ('Worth a chat?' vs 'Tuesday at 2?').",
    "pitfall": "AI writes passive openings ('I wanted to reach out...') or asks for a 30-minute meeting immediately."
  },

  // --- META PROMPTING (LOGIC) ---

  "chain_of_thought": {
    "rule": "Force output of '## Reasoning' before '## Answer'. Use trigger phrase: 'Let's think step by step.'",
    "mechanic": "'You are a logic engine. 1. Break the problem down. 2. Output your reasoning in steps. 3. Final Answer.'",
    "pitfall": "AI skips the step-by-step reasoning and jumps straight to the answer, reducing accuracy on complex tasks."
  },

  "tree_of_thoughts": {
    "rule": "Request 3 distinct solutions (Experts). Force a 'Critique' phase. Force a 'Synthesis' phase.",
    "mechanic": "'Expert 1: Propose solution A. Expert 2: Propose solution B. Expert 3: Critique A and B. Synthesis: Combine best of both.'",
    "pitfall": "AI generates only one solution or fails to synthesize the best parts of multiple approaches."
  }
};