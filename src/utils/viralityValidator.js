import { SOCIAL_RULES } from '../data/rules/socialRules.js';

/**
 * Virality Validator
 * Enforces retention protocols defined in "Engineering Viral Architecture".
 * Analyzes generated content against rigid structural rules (Hooks, Duration, Syntax)
 * and Platform Constraints (Rules Engine).
 */

export const validateVirality = (content, promptContext) => {
    const checks = [];
    let score = 100;

    if (!content) return { score: 0, checks: [] };

    // Clean content for analysis (remove markdown bolding etc.)
    const cleanContent = content.replace(/\*\*/g, '').trim();
    const lines = cleanContent.split('\n').filter(l => l.trim().length > 0);
    const wordCount = cleanContent.split(/\s+/).length;
    const charCount = cleanContent.length;
    
    // Estimate Duration (Avg speaking rate ~150 wpm = 2.5 words/sec)
    const durationSec = Math.ceil(wordCount / 2.5);

    // --- 0. PLATFORM DETECTION & RULES ENGINE ---
    // Detect which platform the prompt was targeting to apply specific rules
    let activePlatformRule = null;
    let platformName = "";

    // Iterate through SOCIAL_RULES to find a match in the promptContext
    // The promptContext typically contains "Act as a... for [Platform]"
    Object.keys(SOCIAL_RULES).forEach(key => {
        // Simple heuristic: if the prompt mentions the platform name, use those rules
        // Removing special chars for easier matching (e.g., "X (Twitter)" -> "Twitter")
        const keyword = key.includes('(') ? key.split('(')[1].replace(')', '') : key;
        
        if (promptContext?.toLowerCase().includes(keyword.toLowerCase()) || 
            promptContext?.toLowerCase().includes(key.toLowerCase())) {
            activePlatformRule = SOCIAL_RULES[key];
            platformName = key;
        }
    });

    // --- 1. HARD CONSTRAINTS (From Rules Engine) ---
    if (activePlatformRule) {
        // Character Limit Check
        const maxChars = activePlatformRule.max_chars_post || activePlatformRule.max_chars_caption || activePlatformRule.max_chars_free;
        if (maxChars) {
            if (charCount > maxChars) {
                checks.push({ status: 'fail', message: `Exceeds ${platformName} limit: ${charCount}/${maxChars} chars.` });
                score -= 30; // Heavy penalty for breaking platform physics
            } else {
                checks.push({ status: 'pass', message: `Within limits: ${charCount}/${maxChars} chars.` });
            }
        }

        // Video Duration Check (if applicable)
        const maxVideoSec = activePlatformRule.video_limit_sec;
        if (maxVideoSec) {
            if (durationSec > maxVideoSec) {
                checks.push({ status: 'fail', message: `Script too long for ${platformName}: ~${durationSec}s (Limit: ${maxVideoSec}s).` });
                score -= 20;
            }
        }
    }

    // --- 2. GOLDEN DURATION CHECK (Section 5.1) ---
    // Logic: Short-form videos have a strict "Sweet Spot" for algorithm insertion.
    // Only run this if we identified it as a video platform OR if we lack specific rules but it looks like a script
    if (activePlatformRule?.video_limit_sec || activePlatformRule?.video_limit_min || promptContext?.toLowerCase().includes('script')) {
        if (durationSec < 15) {
            checks.push({ status: 'warning', message: `Too Short: ~${durationSec}s. Algorithm prefers >15s for ad insertion.` });
            score -= 10;
        } else if (durationSec > 60 && !activePlatformRule?.video_limit_min) { 
            // Only warn about >60s if we don't have a specific long-form rule saying it's okay
            checks.push({ status: 'fail', message: `Too Long: ~${durationSec}s. Shorts/Reels hard limit is often 60s.` });
            score -= 20;
        } else if (!activePlatformRule?.video_limit_sec) {
            // Default success message if not failed above
            checks.push({ status: 'pass', message: `Golden Duration: ~${durationSec}s.` });
        }
    }

    // --- 3. HOOK VELOCITY (Section 3.3) ---
    // Logic: The first 3 seconds determine retention. The hook must be concise.
    const firstLine = lines[0] || "";
    const hookWords = firstLine.split(/\s+/).length;

    // We allow a bit more leeway for Title presets vs Script presets
    const isTitle = promptContext?.toLowerCase().includes('title');
    const hookLimit = isTitle ? 20 : 15;

    if (hookWords > hookLimit) {
        checks.push({ status: 'fail', message: `Hook too long (${hookWords} words). First sentence must be < ${hookLimit} words to arrest the scroll.` });
        score -= 15;
    } else {
        checks.push({ status: 'pass', message: `Hook Velocity: ${hookWords} words (Concise & Punchy).` });
    }

    // --- 4. ARCHETYPE COMPLIANCE (Section 2 & 3) ---
    // Logic: Specific presets require specific psychological triggers.

    // A. Negative Warning
    if (promptContext?.includes("Negative Warning") || promptContext?.includes("Negativity")) {
        if (/stop/i.test(firstLine) || /don'?t/i.test(firstLine) || /never/i.test(firstLine) || /warning/i.test(firstLine) || /avoid/i.test(firstLine)) {
            checks.push({ status: 'pass', message: "Negative Pattern Interrupt detected." });
        } else {
            checks.push({ status: 'fail', message: "Missing Negative Trigger ('Stop', 'Don't', 'Never') in hook." });
            score -= 25;
        }
    }

    // B. Survivorship/High Stakes
    if (promptContext?.includes("High Stakes") || promptContext?.includes("Survivorship")) {
        if (/survived/i.test(cleanContent) || /built/i.test(cleanContent)) {
            checks.push({ status: 'pass', message: "High Stakes syntax detected." });
        } else {
            checks.push({ status: 'fail', message: "Missing 'Survived' or 'Built' keyword." });
            score -= 25;
        }
    }

    // C. Listicle/Steps
    if (promptContext?.includes("Step-by-Step") || promptContext?.includes("Listicle") || promptContext?.includes("Tier List")) {
        const hasNumbers = lines.some(l => /^\d+\./.test(l.trim()));
        const hasTiers = cleanContent.match(/[SABC]-Tier/i);
        
        if (hasNumbers || hasTiers) {
            checks.push({ status: 'pass', message: "Structured List/Tier formatting detected." });
        } else {
            checks.push({ status: 'warning', message: "Content lacks clear numbered steps (1., 2.) or Tier rankings." });
            score -= 10;
        }
    }

    // --- 5. READABILITY GATE (Section 6.2) ---
    // Logic: Complex words kill retention. 
    const longWords = cleanContent.split(/\s+/).filter(w => w.length > 14);
    if (longWords.length > 1) {
        checks.push({ status: 'warning', message: `Detected complex words (e.g. "${longWords[0]}"). Simplify for mass appeal.` });
        score -= 5;
    }

    return { score: Math.max(0, score), checks };
};