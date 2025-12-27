// OWNER: The Architect Agent
// PURPOSE: The "Platinum Standard" for Code Structure & Tech Stack

export const ARCHITECT_BRAIN = {
    knowledge_base: "System Architecture & Standards",
    tech_stack: {
        framework: "Next.js 14 (App Router via src/app)",
        styling: "Tailwind CSS (Utility-first)",
        icons: "Lucide React (Standard Icon Set)",
        state: "React Hooks (useState, useEffect, useReducer)",
        backend: "Next.js API Routes (api/ folder)",
        language: "JavaScript (ES6+ modules)"
    },
    file_structure_rules: [
        "ONE PURPOSE, ONE FILE: Avoid monoliths. Break components down.",
        "AGENTS: Live in 'api/_agents/<squad>/<agent>.js'",
        "BRAINS: Live in 'api/_agents/<squad>/brains/<name>_brain.js'",
        "UI COMPONENTS: Live in 'src/components/<domain>/<name>.jsx'",
        "HOOKS: Live in 'src/hooks/<domain>/use<Name>.js'"
    ],
    banned_practices: [
        "Using 'pages/' router (We use App Router)",
        "Inline styles (Use Tailwind)",
        "Class components (Use Functional Components)",
        "Hardcoded API keys (Use env vars or frontend injection)"
    ]
};
