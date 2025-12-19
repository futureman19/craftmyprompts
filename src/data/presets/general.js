export const GENERAL_PRESETS = [
    // --- WRITING FRAMEWORKS ---
    { 
        label: "Viral X/Twitter Thread", 
        platform: "X (Twitter)",
        framework: "Storytelling", 
        intent: "Inspire", 
        style: "TechCrunch Style",
        topic: "Write a {Number}-tweet thread about {Topic}. Hook the reader immediately with a surprising fact about {Key_Fact}. Use '1/x' numbering. Target audience: {Audience}." 
    },
    { 
        label: "B2B Cold Email", 
        intent: "Sell", 
        framework: "AIDA (Attention, Interest, Desire, Action)", 
        style: "TechCrunch Style", 
        topic: "Write a cold email pitching {Product} to a {Target_Role} at {Company}. Focus on the pain point of {Pain_Point}. Keep it under 75 words. CTA: '{Call_To_Action}'." 
    },
    { 
        label: "SEO Blog Post", 
        intent: "Inform", 
        framework: "PAS (Problem, Agitate, Solution)", 
        topic: "Outline a blog post about {Topic} for {Audience}. Target keywords: {Keywords}. Include H2 headers for 'People Also Ask'. Tone: {Tone}." 
    },
    { 
        label: "LinkedIn Authority Op-Ed", 
        intent: "Persuade", 
        style: "Malcolm Gladwell",
        topic: "Write a contrarian post about {Industry_Trend}. Argue that {Opinion}. Use short, punchy sentences (Broetry style). End with a question for {Audience}." 
    },

    // --- GENERAL PERSONAS ---
    { 
        label: "ELI5 Explainer", 
        persona: "Physics Tutor", 
        tone: "Friendly", 
        language_style: "Simple English",
        topic: "Explain {Complex_Concept} using a {Real_World_Object} analogy. Keep it simple enough for a 5-year-old. Avoid jargon." 
    },
    { 
        label: "Executive Summary", 
        persona: "Project Manager", 
        format: "Structured", 
        length: "Brief",
        topic: "Summarize this text into bullet points with key action items and owners: {Insert_Text_Here}. Focus on ROI and next steps for {Stakeholders}." 
    },
    { 
        label: "Tough Interviewer", 
        persona: "HR Specialist", 
        context: "Situation", 
        topic: "Act as a sceptical interviewer for a {Job_Role} position at {Company}. Ask me 3 hard questions about {Skill}. Grade my answers on clarity and depth." 
    },
    {
        label: "Debate Opponent",
        persona: "Devil's Advocate", 
        tone: "Critical",
        topic: "I believe that {Opinion}. Argue against this position using logic, data, and historical examples. Find the weak points in my argument."
    }
];