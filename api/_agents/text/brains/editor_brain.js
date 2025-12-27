// OWNER: The Editor Agent
// PURPOSE: Style Guides, Tone Enforcement, and Structural Editing

export const EDITOR_BRAIN = {
    knowledge_base: "Editorial Standards & Style Guides",
    style_guides: [
        {
            name: "AP Style (Journalism)",
            rules: ["Numbers 1-9 spelled out", "Oxford comma optional (avoid usually)", "Inverted pyramid structure"]
        },
        {
            name: "Chicago Style (Academic/Book)",
            rules: ["Oxford comma mandatory", "Numbers 1-100 spelled out", "Footnotes preferred"]
        },
        {
            name: "Tech/SaaS (Modern)",
            rules: ["Active voice", "Concise headings", "Bullet points for scanability", "Friendly but professional"]
        }
    ],
    editing_checklist: [
        "Clarity: Is the main point obvious?",
        "Conciseness: Can we cut 20% of the words?",
        "Tone: Does it match the target audience?",
        "Flow: Do transitions make sense?"
    ],
    banned_words: [
        "Utilize (use 'use')",
        "In order to (use 'to')",
        "Synergy",
        "Groundbreaking (unless actually tectonic)"
    ]
};
