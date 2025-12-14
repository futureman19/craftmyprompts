export const GENERAL_PRESETS = [
    // --- WRITING FRAMEWORKS ---
    { 
        label: "Viral X/Twitter Thread", 
        platform: "X (Twitter)",
        framework: "Storytelling", 
        intent: "Inspire", 
        style: "TechCrunch Style",
        topic: "Write a thread about {Topic}. Hook the reader immediately with a surprising fact. Use '1/x' numbering." 
    },
    { 
        label: "B2B Cold Email", 
        intent: "Sell", 
        framework: "AIDA (Attention, Interest, Desire, Action)", 
        style: "TechCrunch Style", 
        topic: "Write a cold email pitching {Product} to a {Target Role}. Focus on the pain point of {Pain Point}. Keep it under 75 words." 
    },
    { 
        label: "SEO Blog Post", 
        intent: "Inform", 
        framework: "PAS (Problem, Agitate, Solution)", 
        topic: "Outline a blog post about {Topic}. Target keywords: {Keywords}. Include H2 headers for 'People Also Ask'." 
    },
    { 
        label: "LinkedIn Authority Op-Ed", 
        intent: "Persuade", 
        style: "Malcolm Gladwell",
        topic: "Write a contrarian post about {Industry Trend}. Argue that {Opinion}. Use short, punchy sentences (Broetry style)." 
    },

    // --- GENERAL PERSONAS ---
    { 
        label: "ELI5 Explainer", 
        persona: "Physics Tutor", 
        tone: "Friendly", 
        language_style: "Simple English",
        topic: "Explain {Complex Concept} using a {Real World Object} analogy. Keep it simple enough for a 5-year-old." 
    },
    { 
        label: "Executive Summary", 
        persona: "Project Manager", 
        format: "Structured", 
        length: "Brief",
        topic: "Summarize this text into bullet points with key action items and owners: {Insert Text Here}" 
    },
    { 
        label: "Tough Interviewer", 
        persona: "HR Specialist", 
        context: "Situation", 
        topic: "Act as a sceptical interviewer for a {Job Role} position. Ask me 3 hard questions about {Skill}." 
    },
    {
        label: "Debate Opponent",
        persona: "Devil's Advocate",
        tone: "Critical",
        topic: "I believe that {Opinion}. Argue against this position using logic and data."
    }
];