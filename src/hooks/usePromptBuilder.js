import { useReducer, useMemo, useEffect } from 'react';
import {
    GENERAL_DATA, CODING_DATA, WRITING_DATA, ART_DATA, AVATAR_DATA, VIDEO_DATA,
    SOCIAL_DATA,
    RANDOM_TOPICS
} from '../data/constants.jsx';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase.js';
import { INSTRUCTIONS } from '../data/instructions.js';

// --- Rules Engine ---
import { SOCIAL_RULES } from '../data/rules/socialRules.js';
import { ART_RULES } from '../data/rules/artRules.js';
import { CODING_RULES } from '../data/rules/codingRules.js';

// --- INITIAL STATE ---
const initialState = {
    mode: 'text', // 'text' | 'art' | 'video'
    textSubMode: 'general', // general | coding | social
    targetModel: 'midjourney',
    customTopic: '',
    selections: {},
    negativePrompt: '',
    referenceImage: '',
    imageDescription: '', // NEW: Stores the AI analysis of the reference image
    loraName: '',
    loraWeight: 1.0,
    seed: '',
    chainOfThought: false,
    codeOnly: false,
    codeContext: '',
    variables: {}
};

// --- REDUCER ---
function builderReducer(state, action) {
    switch (action.type) {
        case 'SET_MODE':
        case 'SET_MODE':
            const newMode = action.payload;
            // If switching to coding, ensure subMode reflects that for backward compat
            const subMode = newMode === 'coding' ? 'coding' : (newMode === 'text' ? 'general' : state.textSubMode);
            return { ...state, mode: newMode, textSubMode: subMode, selections: {} };
        case 'SET_SUBMODE':
            return { ...state, textSubMode: action.payload };
        case 'SET_TARGET_MODEL':
            return { ...state, targetModel: action.payload };
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'UPDATE_VARIABLE':
            return {
                ...state,
                variables: { ...state.variables, [action.key]: action.value }
            };
        case 'TOGGLE_SELECTION': {
            const { categoryId, option, isSingleSelect } = action.payload;
            const current = state.selections[categoryId] || [];
            const exists = current.find(item => item.value === option);

            let newCatSelections;

            if (isSingleSelect) {
                if (exists) newCatSelections = [];
                else newCatSelections = [{ value: option, weight: 1 }];
            } else {
                if (exists) newCatSelections = current.filter(item => item.value !== option);
                else newCatSelections = [...current, { value: option, weight: 1 }];
            }

            const newSelections = { ...state.selections, [categoryId]: newCatSelections };
            if (newCatSelections.length === 0) delete newSelections[categoryId];

            return { ...state, selections: newSelections };
        }
        case 'UPDATE_WEIGHT': {
            const { categoryId, optionValue, newWeight } = action.payload;
            const current = state.selections[categoryId] || [];
            const newCatSelections = current.map(item =>
                item.value === optionValue ? { ...item, weight: parseFloat(newWeight) } : item
            );
            return { ...state, selections: { ...state.selections, [categoryId]: newCatSelections } };
        }
        case 'LOAD_PRESET':
            const newSels = {};
            const addSel = (cat, val) => { newSels[cat] = [{ value: val, weight: 1 }]; };
            const p = action.payload;

            // Handle explicit selections object (Saved Preset) or flat keys (Quick Start)
            if (p.selections) {
                Object.assign(newSels, p.selections);
            } else {
                // Parse legacy/flat preset keys...
                if (p.lang) addSel('language', p.lang);
                if (p.task) addSel('task', p.task);
                if (p.framework) addSel('framework', p.framework);
                if (p.intent) addSel('intent', p.intent);
                if (p.style) addSel('style', p.style);
                if (p.persona) addSel('persona', p.persona);
                if (p.tone) addSel('tone', p.tone);
                if (p.author) addSel('author', p.author);

                // Social keys
                if (p.platform) addSel('platform', p.platform);
                if (p.hook_type) addSel('hook_type', p.hook_type);
                if (p.content_type) addSel('content_type', p.content_type);
                if (p.goal) addSel('goal', p.goal);

                // Art keys
                if (p.genre) addSel('genre', p.genre);
                if (p.shot) addSel('shots', p.shot);

                // Avatar keys
                if (p.avatar_style) addSel('avatar_style', p.avatar_style);
                if (p.framing) addSel('framing', p.framing);
                if (p.expression) addSel('expression', p.expression);
                if (p.accessories) addSel('accessories', p.accessories);
                if (p.background) addSel('background', p.background);

                // Video keys
                if (p.camera_move) addSel('camera_move', p.camera_move);
                if (p.motion_strength) addSel('motion_strength', p.motion_strength);
                if (p.aesthetics) addSel('aesthetics', p.aesthetics);
            }

            return {
                ...state,
                selections: newSels,
                customTopic: p.custom_topic || p.customTopic || p.topic || '',
                codeContext: p.code_context || p.codeContext || '',
                variables: {},
                mode: p.mode || (p.camera_move ? 'video' : (p.avatar_style ? 'art' : (p.genre ? 'art' : 'text'))),
                textSubMode: p.textSubMode || (p.avatar_style ? 'avatar' : (p.lang ? 'coding' : (p.platform ? 'social' : (p.framework ? 'writing' : 'general'))))
            };
        case 'RANDOMIZE': {
            const dataSrc = action.payload;
            const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
            const randomSels = {};

            dataSrc.forEach(cat => {
                if (cat.subcategories.length) {
                    const sub = rand(cat.subcategories);
                    const opt = rand(sub.options);
                    randomSels[cat.id] = [{ value: opt, weight: 1 }];
                }
            });

            const topicList = RANDOM_TOPICS && RANDOM_TOPICS.length > 0 ? RANDOM_TOPICS : ["A futuristic city"];
            const randomTopic = rand(topicList);

            return {
                ...state,
                selections: randomSels,
                customTopic: randomTopic
            };
        }
        case 'MAGIC_EXPAND': {
            const powerWords = ['masterpiece', 'best quality', 'highly detailed', '8k resolution', 'ray tracing', 'volumetric lighting'];
            const shuffled = powerWords.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            const currentTech = state.selections['tech'] || [];
            const newItems = selected.map(w => ({ value: w, weight: 1 }));

            const unique = [...currentTech];
            newItems.forEach(ni => {
                if (!unique.find(u => u.value === ni.value)) unique.push(ni);
            });

            return {
                ...state,
                selections: { ...state.selections, tech: unique }
            };
        }
        case 'RESET':
            return initialState;
        case 'LOAD_INITIAL_DATA':
            const data = action.payload;
            return {
                ...state,
                mode: data.type || 'text',
                textSubMode: data.textSubMode || 'general',
                selections: data.selections || {},
                customTopic: data.custom_topic || data.customTopic || '',
                codeContext: data.code_context || data.codeContext || '',
                negativePrompt: data.negative_prompt || data.negativePrompt || '',
                referenceImage: data.reference_image || data.referenceImage || '',

                targetModel: data.model_config?.targetModel || data.targetModel || 'midjourney',
                loraName: data.model_config?.loraName || data.loraName || '',
                seed: data.model_config?.seed || data.seed || '',
                chainOfThought: data.model_config?.chainOfThought || data.chainOfThought || false,
                codeOnly: data.model_config?.codeOnly || data.codeOnly || false
            };
        default:
            return state;
    }
}

// --- HELPER FUNCTIONS ---
const formatOption = (item, isArtMode, model) => {
    if (!item) return '';
    const val = item.value;
    const weight = item.weight;
    if (!isArtMode || weight === 1) return val;

    if (model === 'midjourney') return `${val}::${weight}`;
    if (model === 'stable-diffusion') return `(${val}:${weight})`;
    if (model === 'dalle') return `${val} (priority level ${weight})`;
    if (model === 'gemini' || model === 'flux') return val;

    return val;
};

const applyVariables = (text, variables) => {
    if (!text) return { result: '', detectedVars: [] };
    const regex = /\{([^}]+)\}/g;
    const matches = [...text.matchAll(regex)].map(m => m[1]);
    const uniqueVars = [...new Set(matches)];

    let result = text;
    uniqueVars.forEach(v => {
        if (variables[v]) {
            result = result.replace(new RegExp(`\\{${v}\\}`, 'g'), variables[v]);
        }
    });
    return { result, detectedVars: uniqueVars };
};

// --- HOOK ---
export const usePromptBuilder = (initialData) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);

    // --- CTO UPDATE: Auto-Describe Image Logic ---
    // When 'referenceImage' changes, we ask the backend to describe it.
    useEffect(() => {
        const describeImage = async () => {
            if (!state.referenceImage || !state.referenceImage.startsWith('http')) {
                dispatch({ type: 'UPDATE_FIELD', field: 'imageDescription', value: '' });
                return;
            }

            try {
                // Call our Vision-Enabled Gemini API
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: state.referenceImage,
                        prompt: "Analyze this image and provide a highly detailed description of the subject, lighting, style, and composition for use in an AI art prompt. Be concise but descriptive.",
                        // Use generic key if user hasn't set one, handled by backend fallback
                    })
                });

                const data = await response.json();
                if (data.candidates && data.candidates[0].content) {
                    const desc = data.candidates[0].content.parts[0].text;
                    dispatch({ type: 'UPDATE_FIELD', field: 'imageDescription', value: desc });
                }
            } catch (err) {
                console.warn("Failed to describe image:", err);
            }
        };

        // Debounce slightly to avoid spamming API while typing URL
        const timeoutId = setTimeout(describeImage, 1000);
        return () => clearTimeout(timeoutId);
    }, [state.referenceImage]);


    const currentData = useMemo(() => {
        if (state.mode === 'coding') return CODING_DATA;
        if (state.mode === 'video') return VIDEO_DATA;
        if (state.mode === 'art') {
            if (state.textSubMode === 'avatar') return AVATAR_DATA;
            return ART_DATA;
        }
        if (state.textSubMode === 'coding') return CODING_DATA;
        if (state.textSubMode === 'writing') return WRITING_DATA; // Fallback
        if (state.textSubMode === 'social') return SOCIAL_DATA;
        return GENERAL_DATA;
    }, [state.mode, state.textSubMode]);

    const { result: processedTopic, detectedVars } = useMemo(() =>
        applyVariables(state.customTopic, state.variables),
        [state.customTopic, state.variables]);

    const generatedPrompt = useMemo(() => {
        const parts = [];
        const getVals = (catId) => state.selections[catId]?.map(i => i.value) || [];

        // --- CONTEXT & KNOWLEDGE INJECTION ---
        const contextDocs = [];
        const instructionOverrides = [];

        const injectInstruction = (options) => {
            options.forEach(opt => {
                if (INSTRUCTIONS[opt]) {
                    instructionOverrides.push(INSTRUCTIONS[opt].system_instruction);
                }
            });
        };

        // 1. Coding Knowledge
        const isCoding = state.mode === 'coding' || state.textSubMode === 'coding';
        if (isCoding) {
            const langs = getVals('language');
            const frameworks = getVals('framework_version');
            const tasks = getVals('task');

            injectInstruction(langs);

            langs.forEach(lang => {
                if (CODING_RULES[lang]) {
                    const rule = CODING_RULES[lang];
                    frameworks.forEach(ver => {
                        if (rule[ver]) {
                            if (rule[ver].deprecated) contextDocs.push(`DEPRECATION WARNING for ${ver}: Avoid ${rule[ver].deprecated.join(', ')}.`);
                            if (rule[ver].required) contextDocs.push(`REQUIREMENT for ${ver}: Must use ${rule[ver].required}.`);
                        }
                    });
                    if (rule.Security) {
                        contextDocs.push(`SECURITY PROTOCOL: ${rule.Security.required.join(', ')}.`);
                    }
                }
            });

            if (langs.some(l => l.includes('sCrypt')) || frameworks.some(f => f.includes('sCrypt'))) {
                contextDocs.push(KNOWLEDGE_BASE.scrypt_bitcoin);
            }

            if (langs.includes('React') || langs.includes('Tailwind CSS') || frameworks.some(f => f.includes('React'))) {
                contextDocs.push(KNOWLEDGE_BASE.react_server_components);
                contextDocs.push(KNOWLEDGE_BASE.tailwind_modern);
            }

            if (langs.includes('Solidity')) contextDocs.push(KNOWLEDGE_BASE.solidity_security);
            if (langs.includes('Python')) contextDocs.push(KNOWLEDGE_BASE.fastapi_pydantic_v2);
            if (langs.includes('SQL') || state.customTopic.toLowerCase().includes('supabase')) contextDocs.push(KNOWLEDGE_BASE.supabase_v2);

            if (instructionOverrides.length === 0) {
                if (tasks.length) parts.push(`Act as an expert Developer. Your task is to ${tasks.join(' and ')}.`);
                else parts.push("Act as an expert Developer.");
                if (langs.length) parts.push(`Tech Stack: ${langs.join(', ')}.`);
            } else {
                parts.push(instructionOverrides.join('\n'));
                if (tasks.length) parts.push(`Task: ${tasks.join(' and ')}.`);
            }

            const principles = getVals('principles').join(', ');
            if (principles) parts.push(`Adhere to these principles: ${principles}.`);

        } else if (state.textSubMode === 'social') {
            const platforms = getVals('platform');
            injectInstruction(platforms);

            platforms.forEach(plat => {
                if (SOCIAL_RULES[plat]) {
                    const limits = SOCIAL_RULES[plat];
                    let limitText = "";
                    if (limits.max_chars_post) limitText += `Max ${limits.max_chars_post} chars. `;
                    if (limits.max_chars_free) limitText += `Max ${limits.max_chars_free} chars (Free tier). `;
                    if (limitText) contextDocs.push(`PLATFORM LIMITS (${plat}): ${limitText}`);
                }
            });

            const types = getVals('content_type').join(', ');
            const hooks = getVals('hook_type').join(', ');
            const frameworks = getVals('framework').join(', ');
            const goals = getVals('goal').join(', ');

            if (platforms.some(p => ['TikTok', 'Instagram Reels', 'YouTube Shorts'].includes(p))) {
                contextDocs.push(KNOWLEDGE_BASE.social_video_hooks);
            }
            if (types.includes('Carousel')) {
                contextDocs.push(KNOWLEDGE_BASE.social_carousel_structures);
            }
            if (platforms.includes('YouTube Video')) {
                contextDocs.push(KNOWLEDGE_BASE.social_youtube_packaging);
            }
            if (platforms.includes('Pinterest')) {
                contextDocs.push(KNOWLEDGE_BASE.social_pinterest_seo);
            }
            if (platforms.includes('LinkedIn')) {
                contextDocs.push(KNOWLEDGE_BASE.linkedin_viral);
            }

            if (instructionOverrides.length > 0) {
                parts.push(instructionOverrides.join('\n'));
            } else {
                if (platforms.length) parts.push(`Act as a Master Content Strategist for ${platforms.join(', ')}.`);
            }

            if (types) parts.push(`Format: ${types}.`);
            if (goals) parts.push(`Primary Goal: ${goals}.`);
            if (hooks) parts.push(`Hook Strategy: ${hooks}.`);
            if (frameworks) parts.push(`Narrative Structure: ${frameworks}.`);

        } else {
            const persona = getVals('persona');
            const styles = getVals('style');

            injectInstruction(persona);
            injectInstruction(styles);

            if (instructionOverrides.length > 0) {
                parts.push(instructionOverrides.join('\n'));
            } else {
                if (persona.length) parts.push(`Act as an expert ${persona[0]}.`);
            }

            const tone = getVals('tone');
            const format = getVals('format');
            const intent = getVals('intent');

            if (tone.length) parts.push(`Tone: ${tone.join(', ')}.`);
            if (format.length) parts.push(`Format: ${format.join(', ')}.`);
            if (intent.length) parts.push(`Goal: ${intent.join(', ')}.`);
        }

        // --- TOPIC INJECTION ---
        if (processedTopic?.trim()) {
            const label = (state.mode === 'coding' || state.textSubMode === 'coding') ? 'TASK / INSTRUCTION:' : 'TOPIC / CONTENT:';
            parts.push(`\n${label}\n"${processedTopic}"\n`);
        }

        // --- ART / VIDEO MODE LOGIC ---
        if (state.mode === 'art' || state.mode === 'video') {
            const artStyles = getVals('style');
            const videoCams = getVals('camera_move');
            const aesthetics = getVals('aesthetics');
            const avatarStyles = getVals('avatar_style');

            injectInstruction(artStyles);
            injectInstruction(videoCams);
            injectInstruction(aesthetics);
            injectInstruction(avatarStyles);

            if (state.mode === 'art' && ART_RULES[state.targetModel]) {
                const rule = ART_RULES[state.targetModel];
                if (rule.restrictions) {
                    contextDocs.push(`MODEL RESTRICTIONS (${state.targetModel}): ${rule.restrictions.join(', ')}.`);
                }
            }

            if (instructionOverrides.length > 0) {
                parts.push(`\n[STYLISTIC DIRECTIVES]:\n${instructionOverrides.join('\n')}`);
            }

            // CTO UPDATE: Inject Visual Description (Smart Reference)
            if (state.imageDescription) {
                parts.push(`\n[VISUAL CONTEXT FROM REFERENCE]:\n"${state.imageDescription}"\n`);
            }
        }

        // Inject Static Knowledge Base
        if (contextDocs.length > 0) {
            parts.push(`\n[EXPERT KNOWLEDGE BASE - STRICT ADHERENCE REQUIRED]:\n${contextDocs.join('\n\n')}\n`);
        }

        // CTO FIX: UNIVERSAL CONTEXT INJECTION
        if (state.codeContext?.trim()) {
            const isCoding = state.mode === 'coding' || state.textSubMode === 'coding';
            const label = isCoding ? 'USER CODE CONTEXT' : 'ADDITIONAL CONTEXT / KNOWLEDGE';
            const formattedContext = isCoding
                ? `\`\`\`\n${state.codeContext}\n\`\`\`` // Wrapped for code
                : state.codeContext; // Plain text for social/writing

            parts.push(`\n[${label}]:\n${formattedContext}\n`);
        }

        if (state.chainOfThought) parts.push("Take a deep breath and think step-by-step to ensure the highest quality response.");
        if (state.codeOnly && (state.mode === 'coding' || state.textSubMode === 'coding')) parts.push("IMPORTANT: Output ONLY the code. Do not provide explanations, chatter, or introductory text. Just the code block.");

        // Final Assembly for Art Mode vs Text Mode
        if (state.mode === 'art') {
            if (state.targetModel === 'dalle' || state.targetModel === 'gemini') {
                return parts.join('\n');
            } else {
                // Midjourney/SD prefer tokens, but we append the description if available
                let artPrompt = buildArtPrompt(state, processedTopic, instructionOverrides, contextDocs);
                // If we have a vision description, we append it to enrich the prompt
                if (state.imageDescription) {
                    artPrompt = `${state.imageDescription}. ${artPrompt}`;
                }
                return artPrompt;
            }
        }

        // For Video Mode
        if (state.mode === 'video') {
            const baseVideoPrompt = buildVideoPrompt(state, processedTopic);
            if (instructionOverrides.length > 0) {
                return `${baseVideoPrompt}\n\n[DIRECTOR NOTES]: ${instructionOverrides.join(' ')}`;
            }
            return baseVideoPrompt;
        }

        return parts.join('\n');
    }, [state, processedTopic]);

    return {
        state,
        dispatch,
        generatedPrompt,
        currentData,
        detectedVars
    };
};

// --- SUBSIDIARY BUILDERS ---

const buildVideoPrompt = (state, topic) => {
    const parts = [];
    const getVals = (catId) => state.selections[catId]?.map(i => i.value) || [];

    if (topic?.trim()) parts.push(`${topic}`);
    const camera = getVals('camera_move').join(', ');
    const motion = getVals('motion_strength').join(', ');
    if (camera) parts.push(`Camera Movement: ${camera}`);
    if (motion) parts.push(`Motion: ${motion}`);
    const aesthetics = getVals('aesthetics').join(', ');
    if (aesthetics) parts.push(`Style/Look: ${aesthetics}`);

    let promptString = parts.join('. ');

    const videoNegs = getVals('video_negative');
    const allNegatives = [];
    if (state.negativePrompt) allNegatives.push(state.negativePrompt);
    if (videoNegs.length > 0) allNegatives.push(...videoNegs);
    if (allNegatives.length > 0) promptString += ` --no ${allNegatives.join(', ')}`;

    return promptString;
};

const buildArtPrompt = (state, topic, instructions, context) => {
    const parts = [];
    const getVals = (catId) => state.selections[catId]?.map(i => i.value) || [];

    if (state.referenceImage?.trim()) parts.push(state.referenceImage.trim());

    const coreParts = [];
    if (state.textSubMode === 'avatar') {
        const framings = state.selections.framing?.map(i => formatOption(i, true, state.targetModel)) || [];
        const styles = state.selections.avatar_style?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (framings.length) coreParts.push(framings.join(' '));
        if (styles.length) coreParts.push(styles.join(' '));
        coreParts.push("avatar of");
        if (topic?.trim()) coreParts.push(topic);
        if (coreParts.length) parts.push(coreParts.join(' '));
        const exprs = state.selections.expression?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (exprs.length) parts.push(exprs.join(', '));
        const accs = state.selections.accessories?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (accs.length) parts.push(accs.join(', '));
        const bgs = state.selections.background?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (bgs.length) parts.push(bgs.join(', '));
    } else {
        const genres = state.selections.genre?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (genres.length) coreParts.push(genres.join(' '));
        if (topic?.trim()) coreParts.push(topic);
        if (coreParts.length) parts.push(coreParts.join(' '));
        const envs = state.selections.environment?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (envs.length) parts.push(`set in ${envs.join(', ')}`);

        const camParts = [];
        const shots = state.selections.shots?.map(i => formatOption(i, true, state.targetModel)) || [];
        const cameras = state.selections.camera?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (shots.length) camParts.push(...shots);
        if (cameras.length) camParts.push(...cameras);
        if (camParts.length) parts.push(camParts.join(', '));

        const visualParts = [];
        const visuals = state.selections.visuals?.map(i => formatOption(i, true, state.targetModel)) || [];
        const tech = state.selections.tech?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (visuals.length) visualParts.push(...visuals);
        if (tech.length) visualParts.push(...tech);
        if (visualParts.length) parts.push(visualParts.join(', '));

        const styles = state.selections.style?.map(i => formatOption(i, true, state.targetModel)) || [];
        if (styles.length) {
            parts.push(`in the style of ${styles.map(s => `by ${s}`).join(', ')}`);
        }
    }

    if (state.targetModel === 'stable-diffusion' && state.loraName) {
        parts.push(`<lora:${state.loraName}:${state.loraWeight}>`);
    }

    let mainPrompt = parts.join(', ').replace(/, ,/g, ',');
    let suffix = '';

    if (state.negativePrompt?.trim()) {
        if (state.targetModel === 'midjourney') suffix += ` --no ${state.negativePrompt.trim()}`;
        else if (state.targetModel === 'stable-diffusion') mainPrompt += ` [${state.negativePrompt.trim()}]`;
    }

    if (state.seed && state.targetModel === 'midjourney') suffix += ` --seed ${state.seed}`;

    if (state.selections.params?.length) {
        state.selections.params.forEach(item => {
            const p = item.value;
            if (state.targetModel === 'midjourney') {
                if (p.includes(':')) suffix += ` --ar ${p}`;
                else if (['Seamless Pattern'].includes(p)) suffix += ` --tile`;
                else if (['Anime Style'].includes(p)) suffix += ` --niji 5`;
                else if (!isNaN(p)) {
                    if (['0', '100', '250', '500', '750', '1000'].includes(p)) suffix += ` --s ${p}`;
                    else if (['10', '25', '50', '80'].includes(p)) suffix += ` --c ${p}`;
                    else if (['250', '3000'].includes(p)) suffix += ` --w ${p}`;
                }
            }
        });
    }

    return mainPrompt + suffix;
};