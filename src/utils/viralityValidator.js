/**
 * Virality Validator
 * Enforces retention protocols defined in "Engineering Viral Architecture".
 * * Analyzes generated content against rigid structural rules (Hooks, Duration, Syntax).
 */

export const validateVirality = (content, presetLabel) => {
    const checks = [];
    let score = 100;

    if (!content) return { score: 0, checks: [] };

    // Clean content for analysis (remove markdown bolding etc.)
    const cleanContent = content.replace(/\*\*/g, '').trim();
    const lines = cleanContent.split('\n').filter(l => l.trim().length > 0);
    const wordCount = cleanContent.split(/\s+/).length;
    
    // Estimate Duration (Avg speaking rate ~150 wpm = 2.5 words/sec)
    const durationSec = Math.ceil(wordCount / 2.5);

    // --- 1. GOLDEN DURATION CHECK (Section 5.1) ---
    // Logic: Short-form videos have a strict "Sweet Spot" for algorithm insertion.
    if (presetLabel?.toLowerCase().includes('short') || presetLabel?.toLowerCase().includes('tiktok') || presetLabel?.toLowerCase().includes('reel')) {
        if (durationSec < 15) {
            checks.push({ status: 'warning', message: `Too Short: ~${durationSec}s. Algorithm prefers >15s for ad insertion.` });
            score -= 10;
        } else if (durationSec > 60) {
            checks.push({ status: 'fail', message: `Too Long: ~${durationSec}s. Shorts/Reels hard limit is often 60s.` });
            score -= 20;
        } else {
            checks.push({ status: 'pass', message: `Golden Duration: ~${durationSec}s (Optimal range 15-60s).` });
        }
    }

    // --- 2. HOOK VELOCITY (Section 3.3) ---
    // Logic: The first 3 seconds determine retention. The hook must be concise.
    const firstLine = lines[0] || "";
    const hookWords = firstLine.split(/\s+/).length;

    // We allow a bit more leeway for Title presets vs Script presets
    const isTitle = presetLabel?.toLowerCase().includes('title');
    const hookLimit = isTitle ? 20 : 15;

    if (hookWords > hookLimit) {
        checks.push({ status: 'fail', message: `Hook too long (${hookWords} words). First sentence must be < ${hookLimit} words to arrest the scroll.` });
        score -= 15;
    } else {
        checks.push({ status: 'pass', message: `Hook Velocity: ${hookWords} words (Concise & Punchy).` });
    }

    // --- 3. ARCHETYPE COMPLIANCE (Section 2 & 3) ---
    // Logic: Specific presets require specific psychological triggers.

    // A. Negative Warning (Must contain "Stop", "Don't", "Never")
    if (presetLabel?.includes("Negative Warning")) {
        if (/stop/i.test(firstLine) || /don'?t/i.test(firstLine) || /never/i.test(firstLine) || /warning/i.test(firstLine)) {
            checks.push({ status: 'pass', message: "Negative Pattern Interrupt detected." });
        } else {
            checks.push({ status: 'fail', message: "Missing Negative Trigger ('Stop', 'Don't', 'Never') in hook." });
            score -= 25;
        }
    }

    // B. Survivorship/High Stakes (Must contain "Survived" or "Built")
    if (presetLabel?.includes("High Stakes") || presetLabel?.includes("Survivorship")) {
        if (/survived/i.test(cleanContent) || /built/i.test(cleanContent)) {
            checks.push({ status: 'pass', message: "High Stakes syntax ('Survived'/'Built') detected." });
        } else {
            checks.push({ status: 'fail', message: "Missing 'Survived' or 'Built' keyword for High Stakes format." });
            score -= 25;
        }
    }

    // C. Listicle/Steps (Must contain numbering)
    if (presetLabel?.includes("Step-by-Step") || presetLabel?.includes("Listicle") || presetLabel?.includes("Tier List")) {
        // Look for "1.", "2.", or "Tier"
        const hasNumbers = lines.some(l => /^\d+\./.test(l.trim()));
        const hasTiers = cleanContent.match(/[SABC]-Tier/i);
        
        if (hasNumbers || hasTiers) {
            checks.push({ status: 'pass', message: "Structured List/Tier formatting detected." });
        } else {
            checks.push({ status: 'warning', message: "Content lacks clear numbered steps (1., 2.) or Tier rankings." });
            score -= 10;
        }
    }

    // --- 4. READABILITY GATE (Section 6.2) ---
    // Logic: Complex words kill retention. 
    // Check for words > 14 characters (roughly equates to complex academic language)
    const longWords = cleanContent.split(/\s+/).filter(w => w.length > 14);
    if (longWords.length > 1) {
        checks.push({ status: 'warning', message: `Detected ${longWords.length} complex words (e.g., "${longWords[0]}"). Simplify for mass appeal.` });
        score -= 5;
    }

    return { score: Math.max(0, score), checks };
};