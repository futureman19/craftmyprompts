export const SOCIAL_PRESETS = [
    // --- X / TWITTER ---
    { 
        label: "Viral Thread (Storytelling)", 
        platform: "X (Twitter)", 
        content_type: "Thread", 
        framework: "Storytelling", 
        goal: "Viral Reach", 
        topic: "Write a thread about {Topic}. Tweet 1: Hook with a surprising fact/stat. Tweet 2: The Context. Tweets 3-N: The Story. Final Tweet: CTA to follow." 
    },
    { 
        label: "Contrarian 'Hot Take'", 
        platform: "X (Twitter)", 
        content_type: "Text Post", 
        hook_type: "Curiosity", 
        goal: "Engagement/Debate", 
        topic: "Write a short, punchy tweet arguing that '{Popular Opinion}' is actually wrong. Use a tone of conviction. End with a question to spark debate." 
    },
    { 
        label: "The 'Listicle' Tweet", 
        platform: "X (Twitter)", 
        content_type: "Text Post", 
        framework: "Educational", 
        goal: "Saves", 
        topic: "List 5 tools/tips for {Topic}. Use emoji bullet points. Keep it concise. Add a 'Bookmark this' CTA at the end." 
    },

    // --- LINKEDIN ---
    { 
        label: "Authority Op-Ed", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        style: "Modern/Business", 
        goal: "Thought Leadership", 
        topic: "Write a LinkedIn post about {Industry Trend}. Use short sentences (one per line). Hook: 'Unpopular opinion:'. Body: The Argument. Conclusion: The Lesson." 
    },
    { 
        label: "Personal Story (Vulnerability)", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        framework: "Hero's Journey", 
        goal: "Connection", 
        topic: "Share a story about a time you failed at {Activity}. Structure: The Failure -> The Realization -> The Comeback -> The Advice for others." 
    },
    { 
        label: "The 'How-To' Text Guide", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        framework: "Actionable Advice", 
        goal: "Value", 
        topic: "Break down how to achieve {Result} in 5 steps. Use clear headings. Focus on actionable insights, not fluff." 
    }
];