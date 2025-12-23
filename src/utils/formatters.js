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
        const getText = (keys) => {
            const module = modules.find(m => keys.includes(m.category) || keys.includes(m.question));
            if (!module) return null;

            // Case A: It's a string value (Coding style)
            if (module.value) return module.value;

            // Case B: It's an options array (Text style)
            if (module.options && Array.isArray(module.options)) {
                // Return the recommended one, or the first one, or join them
                const rec = module.options.find(o => o.recommended);
                return rec ? (rec.label || rec.name || rec) : module.options.map(o => o.label || o).join('\n\n');
            }
            return null;
        };

        const headline = getText(['Headline', 'Title', 'Hook']) || "Pending Title";
        const body = getText(['Body', 'Content', 'Key Points', 'Draft']) || "Pending Content";

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
