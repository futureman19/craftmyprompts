import { flattenPrompt } from './promptEngine.js'; // Reuse existing Art engine

export const generateFinalOutput = (mode, history) => {
    // 1. EXTRACT DECISIONS (Parse JSON from content strings)
    const parseContent = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            return typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        } catch (e) {
            return null;
        }
    };

    const strategy = parseContent(history.find(m => m.type === 'vision_options' || m.type === 'visionary_options'));
    const specs = parseContent(history.find(m => m.type === 'spec_options'));
    const draft = parseContent(history.find(m => m.type === 'blueprint'));
    const critique = parseContent(history.find(m => m.type === 'critique'));

    // 2. TEXT MODE GENERATOR
    if (mode === 'text') {
        const headline = draft?.modules?.find(m => m.id === 'headline' || m.label === 'Headline')?.value || "Pending Title";
        const body = draft?.modules?.find(m => m.id === 'body' || m.label === 'Key Points')?.value || "Pending Content";

        return `
# ${headline}

## Strategy
* **Format:** ${strategy?.selected_option || 'N/A'}
* **Audience:** ${strategy?.target_audience || 'General'}
* **Tone:** ${specs?.selected_tone || 'Neutral'}

## Content Draft
${body}

## Critique Notes
${critique?.risks?.map(r => `- [${r.severity}] ${r.message}`).join('\n') || 'No major risks found.'}
        `.trim();
    }

    // 3. ART/VIDEO MODE (Keep existing logic or add placeholders)
    if (mode === 'art' || mode === 'video') {
        return JSON.stringify({ strategy, specs, draft }, null, 2);
    }

    return "Output Generation Pending for this mode.";
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
