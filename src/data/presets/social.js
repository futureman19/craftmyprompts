export const SOCIAL_PRESETS = [
    // --- X / TWITTER ---
    { 
        label: "Viral Thread (Storytelling)", 
        platform: "X (Twitter)", 
        content_type: "Thread", 
        framework: "Storytelling", 
        goal: "Viral Reach", 
        topic: "Write a {Number}-tweet thread about {Topic}. Tweet 1: Hook using the '{Hook_Type}' strategy targeting {Audience}. Tweet 2: The Context. Tweets 3-N: The Story. Final Tweet: CTA to follow @{Handle}." 
    },
    { 
        label: "Contrarian 'Hot Take'", 
        platform: "X (Twitter)", 
        content_type: "Text Post", 
        hook_type: "Curiosity", 
        goal: "Engagement/Debate", 
        topic: "Write a short, punchy tweet arguing that '{Popular_Opinion}' is actually wrong. Use a {Tone} tone. End with a question to spark debate among {Audience}." 
    },
    { 
        label: "The 'Listicle' Tweet", 
        platform: "X (Twitter)", 
        content_type: "Text Post", 
        framework: "Educational", 
        goal: "Saves", 
        topic: "List {Number} tools/tips for {Topic} that helps {Audience} achieve {Outcome}. Use emoji bullet points. Keep it concise. Add a 'Bookmark this' CTA at the end." 
    },

    // --- LINKEDIN ---
    { 
        label: "Authority Op-Ed", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        style: "Modern/Business", 
        goal: "Thought Leadership", 
        topic: "Write a LinkedIn post about {Industry_Trend}. Use short sentences (one per line). Hook: 'Unpopular opinion: {Opinion}'. Body: The Argument. Conclusion: The Lesson for {Audience}." 
    },
    { 
        label: "Personal Story (Vulnerability)", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        framework: "Hero's Journey", 
        goal: "Connection", 
        topic: "Share a story about a time you failed at {Activity}. Structure: The Failure -> The Realization -> The Comeback -> The Advice for {Target_Role}." 
    },
    { 
        label: "The 'How-To' Text Guide", 
        platform: "LinkedIn", 
        content_type: "Text Post", 
        framework: "Actionable Advice", 
        goal: "Value", 
        topic: "Break down how to achieve {Result} in {Number} steps for {Audience}. Use clear headings. Focus on actionable insights, not fluff." 
    },

    // --- THREADS / INSTAGRAM ---
    {
        label: "Carousel Caption",
        platform: "Instagram",
        content_type: "Carousel",
        goal: "Saves",
        topic: "Write a caption for a {Number}-slide carousel about {Topic}. Slide 1 Hook: '{Headline}'. CTA: 'Swipe left to learn more'. Tone: {Tone}."
    },
    {
        label: "Cold Email Outreach",
        platform: "Cold Email",
        content_type: "Email",
        framework: "PAS",
        goal: "Meeting",
        topic: "Write a cold email to {Prospect_Name} at {Company}. Pain point: {Pain_Point}. Solution: {My_Solution}. CTA: 'Worth a chat?'. Keep under 75 words."
    }
];