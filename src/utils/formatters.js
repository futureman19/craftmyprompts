import { flattenPrompt } from './promptEngine.js'; // Reuse existing Art engine

export const generateFinalOutput = (mode, history) => {
    // 1. EXTRACT DECISIONS
    const parseContent = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            return typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        } catch (e) { return null; }
    };

    const strategy = parseContent(history.find(m => m.type === 'vision_options'));
    const specs = parseContent(history.find(m => m.type === 'spec_options'));
    const draft = parseContent(history.find(m => m.type === 'blueprint'));
    const critique = parseContent(history.find(m => m.type === 'critique'));

    // 2. TEXT MODE GENERATOR (Smart Parser)
    if (mode === 'text') {
        const modules = draft?.modules || [];

        // Helper to find text in "options" array OR "value" string
        const getText = (keys, preferDescription = false) => {
            const module = modules.find(m => keys.includes(m.category) || keys.includes(m.question));
            if (!module) return null;

            if (module.value) return module.value;

            if (module.options && Array.isArray(module.options)) {
                const rec = module.options.find(o => o.recommended) || module.options[0];
                if (!rec) return null;

                // IF preferDescription is TRUE, return the description (The Email Body)
                if (preferDescription && rec.description) return rec.description;

                // ELSE return the label (The Headline)
                return rec.label || rec.name || rec;
            }
            return null;
        };

        const headline = getText(['Headline', 'Title', 'Hook'], false) || "Pending Title";

        // HERE: We pass 'true' to get the full text body
        const body = getText(['Body', 'Content', 'Key Points', 'Draft'], true) || "Pending Content";

        return `
# ${headline}

## Strategy
* **Target:** ${strategy?.selected_option || 'General Audience'}
* **Voice:** ${specs?.selected_tone || 'Standard'}

## Content Draft
${body}

## Critique Notes
${critique?.risk_options?.map(r => `- [${r.severity}] ${r.category}`).join('\n') || 'No major risks found.'}
        `.trim();
    }

    // 3. ART/VIDEO/CODING Fallback
    return JSON.stringify({ strategy, specs, draft }, null, 2);
};

// Helper (Unused but kept for potential future use if needed, matching previous file structure or removing if not needed - user replaced the whole function but I am writing the whole file. The user code didn't show formatModules so I will remove it to be clean as it was unused in the provided snippet).
