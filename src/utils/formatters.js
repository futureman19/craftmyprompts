import { flattenPrompt } from './promptEngine.js'; // Reuse existing Art engine

export const generateFinalOutput = (mode, history) => {
    // 1. Find the final "Build" message based on mode
    const roles = {
        art: 'The Stylist',
        text: 'The Scribe',
        video: 'The VFX Supervisor'
    };

    const role = roles[mode];
    const msg = history.findLast(m => m.role === role);

    if (!msg) return "Error: Could not retrieve final data.";

    // 2. Parse the JSON
    let data;
    try {
        const raw = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        data = JSON.parse(raw.substring(start, end + 1));
    } catch (e) { return "Error: Data corruption."; }

    // 3. Format based on Mode
    if (mode === 'art') {
        // We might need to merge previous steps for Art, 
        // but for now, let's assume the Stylist output contains the structure 
        // OR we just format the modules nicely.
        // Ideally, we'd grab the Muse/Cine data too, but let's start by listing the choices.
        return formatModules(data.modules);
    }

    if (mode === 'text' || mode === 'video') {
        return formatModules(data.modules);
    }

    return "Process Complete.";
};

// Helper to turn the "Modules" array into a string
const formatModules = (modules) => {
    if (!modules || !Array.isArray(modules)) return "";

    return modules.map(m => {
        // Find selected option (this logic relies on us storing the selection, 
        // but since we don't have the user's *selection* state here easily without prop drilling,
        // we might just list the "Recommended" ones or the Agent's blueprint).

        // BETTER APPROACH: Just list the questions and the agent's recommended answers.
        const rec = m.options.find(o => o.recommended);
        const val = rec ? (rec.label || rec.name) : "User Choice";
        return `[${m.category}]: ${val}`;
    }).join('\n');
};
