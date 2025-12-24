// Shared Agent Definitions for the Frontend Chat View
// These mirror the backend agents but are safe for frontend imports

export const AGENT_ROSTER = {
    // --- CODING SQUAD ---
    visionary: {
        id: 'visionary',
        name: 'The Visionary',
        role: 'Product Strategy',
        provider: 'openai',
        systemPrompt: "You are The Visionary. You define the product strategy."
    },
    architect: {
        id: 'architect',
        name: 'The Architect',
        role: 'System Design',
        provider: 'openai',
        systemPrompt: "You are The Architect. You design the file structure."
    },
    techLead: {
        id: 'tech_lead',
        name: 'The Tech Lead',
        role: 'Technical Specs',
        provider: 'openai',
        systemPrompt: "You are The Tech Lead. You decide the stack."
    },

    // --- TEXT SQUAD ---
    editor: {
        id: 'editor',
        name: 'Editor-in-Chief',
        role: 'Editorial Strategy',
        provider: 'openai',
        systemPrompt: "You are the Editor-in-Chief. You set the content strategy."
    },
    linguist: {
        id: 'linguist',
        name: 'The Linguist',
        role: 'Voice & Tone',
        provider: 'openai',
        systemPrompt: "You are The Linguist. You define the voice and tone."
    },
    scribe: {
        id: 'scribe',
        name: 'The Scribe',
        role: 'Blueprint & Draft',
        provider: 'openai',
        systemPrompt: "You are The Scribe. You write the outline and draft."
    },

    // --- ART SQUAD ---
    muse: {
        id: 'muse',
        name: 'The Muse',
        role: 'Art Concept',
        provider: 'openai',
        systemPrompt: "You are The Muse. You propose artistic concepts."
    },
    cinematographer: {
        id: 'cinematographer',
        name: 'The Cinematographer',
        role: 'Visual Specs',
        provider: 'openai',
        systemPrompt: "You are The Cinematographer. You define lighting and camera angles."
    },
    stylist: {
        id: 'stylist',
        name: 'The Stylist',
        role: 'Wardrobe & Style',
        provider: 'openai',
        systemPrompt: "You are The Stylist. You define the subject's look."
    },

    // --- VIDEO SQUAD ---
    producer: {
        id: 'producer',
        name: 'The Producer',
        role: 'Video Concept',
        provider: 'openai',
        systemPrompt: "You are The Producer. You pitch video concepts."
    },
    director: {
        id: 'director',
        name: 'The Director',
        role: 'Visual Direction',
        provider: 'openai',
        systemPrompt: "You are The Director. You define the shot list."
    }
};

export const SQUAD_LIST = [
    {
        id: 'coding',
        name: 'Coding Squad',
        color: 'text-cyan-500',
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        agents: [AGENT_ROSTER.visionary, AGENT_ROSTER.architect, AGENT_ROSTER.techLead]
    },
    {
        id: 'text',
        name: 'Editorial Squad',
        color: 'text-indigo-500',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        agents: [AGENT_ROSTER.editor, AGENT_ROSTER.linguist, AGENT_ROSTER.scribe]
    },
    {
        id: 'art',
        name: 'Art Studio',
        color: 'text-pink-500',
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        agents: [AGENT_ROSTER.muse, AGENT_ROSTER.cinematographer, AGENT_ROSTER.stylist]
    },
    {
        id: 'video',
        name: 'Video Set',
        color: 'text-purple-500',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        agents: [AGENT_ROSTER.producer, AGENT_ROSTER.director]
    }
];
