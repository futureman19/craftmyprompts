import { useReducer, useMemo } from 'react';
import { 
  GENERAL_DATA, CODING_DATA, WRITING_DATA, ART_DATA, AVATAR_DATA, VIDEO_DATA, 
  SOCIAL_DATA, // <--- NEW IMPORT
  RANDOM_TOPICS 
} from '../data/constants.jsx';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase.js';

// --- INITIAL STATE ---
const initialState = {
  mode: 'text', // 'text' | 'art' | 'video'
  textSubMode: 'general', // general | coding | writing | social
  targetModel: 'midjourney',
  customTopic: '',
  selections: {}, 
  negativePrompt: '',
  referenceImage: '',
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
      return { ...state, mode: action.payload, selections: {} };
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
        
        // Parse preset keys...
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

        return { 
            ...state, 
            selections: newSels, 
            customTopic: p.topic || '', 
            codeContext: p.codeContext || '', 
            variables: {},
            mode: p.camera_move ? 'video' : (p.avatar_style ? 'art' : (p.genre ? 'art' : 'text')),
            textSubMode: p.avatar_style ? 'avatar' : (p.lang ? 'coding' : (p.platform ? 'social' : (p.framework ? 'writing' : 'general')))
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
            if(!unique.find(u => u.value === ni.value)) unique.push(ni);
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
            customTopic: data.customTopic || '',
            codeContext: data.codeContext || '', 
            negativePrompt: data.negativePrompt || '',
            referenceImage: data.referenceImage || '',
            targetModel: data.targetModel || 'midjourney',
            loraName: data.loraName || '',
            seed: data.seed || '',
            chainOfThought: data.chainOfThought || false,
            codeOnly: data.codeOnly || false
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

  const currentData = useMemo(() => {
      if (state.mode === 'video') return VIDEO_DATA;
      
      if (state.mode === 'art') {
          if (state.textSubMode === 'avatar') return AVATAR_DATA;
          return ART_DATA;
      }
      if (state.textSubMode === 'coding') return CODING_DATA;
      if (state.textSubMode === 'writing') return WRITING_DATA;
      if (state.textSubMode === 'social') return SOCIAL_DATA; // <--- NEW SUBMODE
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
    
    // 1. Coding Knowledge
    if (state.textSubMode === 'coding') {
        const langs = getVals('language');
        const frameworks = getVals('framework_version');
        
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
    }
    
    // 2. Social / Writing Knowledge (CTO UPDATE)
    if (state.textSubMode === 'social') {
        const platforms = getVals('platform');
        const contentTypes = getVals('content_type');

        // Video Hooks (TikTok/Reels)
        if (platforms.some(p => ['TikTok', 'Instagram Reels', 'YouTube Shorts'].includes(p))) {
            contextDocs.push(KNOWLEDGE_BASE.social_video_hooks);
        }
        
        // Carousel Architecture
        if (contentTypes.includes('Carousel (PDF/Image)')) {
            contextDocs.push(KNOWLEDGE_BASE.social_carousel_structures);
        }
        
        // YouTube Packaging
        if (platforms.includes('YouTube Video')) {
            contextDocs.push(KNOWLEDGE_BASE.social_youtube_packaging);
        }
        
        // Pinterest SEO
        if (platforms.includes('Pinterest')) {
            contextDocs.push(KNOWLEDGE_BASE.social_pinterest_seo);
        }
        
        // LinkedIn / Text
        if (platforms.includes('LinkedIn')) {
             contextDocs.push(KNOWLEDGE_BASE.linkedin_viral);
        }
    }
    
    if (state.textSubMode === 'writing') {
        const topicLower = state.customTopic.toLowerCase();
        if (topicLower.includes('blog') || topicLower.includes('seo')) contextDocs.push(KNOWLEDGE_BASE.seo_blog);
        if (topicLower.includes('email')) contextDocs.push(KNOWLEDGE_BASE.cold_email_b2b);
        if (topicLower.includes('twitter')) contextDocs.push(KNOWLEDGE_BASE.twitter_threads);
    }
    
    if (state.mode === 'art') {
        if (state.targetModel === 'midjourney') contextDocs.push(KNOWLEDGE_BASE.midjourney_v6);
        if (state.targetModel === 'flux') contextDocs.push(KNOWLEDGE_BASE.flux_prompts);
    }
    
    if (state.mode === 'video') {
        contextDocs.push(KNOWLEDGE_BASE.runway_camera);
    }
    
    if (state.chainOfThought) {
        contextDocs.push(KNOWLEDGE_BASE.chain_of_thought);
    }

    // --- PROMPT ASSEMBLY ---

    // Video Mode
    if (state.mode === 'video') {
        if (processedTopic?.trim()) parts.push(`${processedTopic}`);
        const camera = getVals('camera_move').join(', ');
        const motion = getVals('motion_strength').join(', ');
        if (camera) parts.push(`Camera Movement: ${camera}`);
        if (motion) parts.push(`Motion: ${motion}`);
        const aesthetics = getVals('aesthetics').join(', ');
        if (aesthetics) parts.push(`Style/Look: ${aesthetics}`);
        const videoNegs = getVals('video_negative');
        let promptString = parts.join('. ');
        const allNegatives = [];
        if (state.negativePrompt) allNegatives.push(state.negativePrompt);
        if (videoNegs.length > 0) allNegatives.push(...videoNegs);
        if (allNegatives.length > 0) promptString += ` --no ${allNegatives.join(', ')}`;
        
        if (contextDocs.length > 0) {
            promptString += `\n\n[EXPERT KNOWLEDGE BASE]:\n${contextDocs.join('\n\n')}`;
        }
        return promptString;
    }

    // Text Mode
    if (state.mode === 'text') {
      if (state.textSubMode === 'coding') {
          const langs = getVals('language').join(', ');
          const tasks = getVals('task').join(' and ');
          const principles = getVals('principles').join(', ');
          if (tasks) parts.push(`Act as an expert Developer. Your task is to ${tasks}.`);
          else parts.push("Act as an expert Developer.");
          if (langs) parts.push(`Tech Stack: ${langs}.`);
          if (principles) parts.push(`Adhere to these principles: ${principles}.`);
      } else if (state.textSubMode === 'social') {
          // --- SOCIAL PROMPT STRUCTURE ---
          const platforms = getVals('platform').join(', ');
          const types = getVals('content_type').join(', ');
          const hooks = getVals('hook_type').join(', ');
          const frameworks = getVals('framework').join(', ');
          const goals = getVals('goal').join(', ');
          
          if (platforms) parts.push(`Act as a Master Content Strategist for ${platforms}.`);
          if (types) parts.push(`Format: ${types}.`);
          if (goals) parts.push(`Primary Goal: ${goals}.`);
          if (hooks) parts.push(`Hook Strategy: ${hooks}.`);
          if (frameworks) parts.push(`Narrative Structure: ${frameworks}.`);
      } else if (state.textSubMode === 'writing') {
          const frameworks = getVals('framework').join(', ');
          const intent = getVals('intent').join(', ');
          const styles = getVals('style').join(', ');
          const authors = getVals('author').join(', ');
          if (frameworks) parts.push(`Use the ${frameworks} framework.`);
          if (intent) parts.push(`Goal: ${intent}.`);
          if (styles) parts.push(`Style/Voice: ${styles}.`);
          if (authors) parts.push(`Emulate the style of: ${authors}.`);
      } else {
          const persona = getVals('persona');
          const tone = getVals('tone');
          const format = getVals('format');
          if (persona.length) parts.push(`Act as an expert ${persona[0]}.`);
          if (tone.length) parts.push(`Tone: ${tone.join(', ')}.`);
          if (format.length) parts.push(`Format: ${format.join(', ')}.`);
      }

      if (processedTopic?.trim()) {
          const label = state.textSubMode === 'coding' ? 'TASK / INSTRUCTION:' : 'TOPIC / CONTENT:';
          parts.push(`\n${label}\n"${processedTopic}"\n`);
      }

      // Inject Static Knowledge Base
      if (contextDocs.length > 0) {
          parts.push(`\n[EXPERT KNOWLEDGE BASE - STRICT ADHERENCE REQUIRED]:\n${contextDocs.join('\n\n')}\n`);
      }

      if (state.textSubMode === 'coding' && state.codeContext?.trim()) {
          parts.push(`\n[USER CODE CONTEXT]:\n\`\`\`\n${state.codeContext}\n\`\`\`\n`);
      }

      if (state.chainOfThought) parts.push("Take a deep breath and think step-by-step to ensure the highest quality response.");
      if (state.codeOnly && state.textSubMode === 'coding') parts.push("IMPORTANT: Output ONLY the code. Do not provide explanations, chatter, or introductory text. Just the code block.");

      return parts.join('\n');
    } else {
      // --- ART MODE (Unchanged) ---
      if (state.targetModel === 'dalle' || state.targetModel === 'gemini') {
          parts.push("Create an image of");
          if (state.textSubMode === 'avatar') {
             const styles = getVals('avatar_style').join(', ');
             const framings = getVals('framing').join(', ');
             if (styles) parts.push(`a ${styles}`);
             if (framings) parts.push(`(${framings})`);
             parts.push("avatar of");
             if (processedTopic) parts.push(`${processedTopic}.`);
             const exprs = getVals('expression').join(', ');
             if (exprs) parts.push(`Expression: ${exprs}.`);
             const accs = getVals('accessories').join(', ');
             if (accs) parts.push(`Wearing: ${accs}.`);
             const bgs = getVals('background').join(', ');
             if (bgs) parts.push(`Background: ${bgs}.`);
          } else {
             if (processedTopic) parts.push(`${processedTopic}.`);
             const genres = getVals('genre').join(' and ');
             if (genres) parts.push(`The style should be ${genres}.`);
             const envs = getVals('environment').join(', ');
             if (envs) parts.push(`The scene is set in ${envs}.`);
             const styles = getVals('style').join(', ');
             if (styles) parts.push(`Artistic inspiration: ${styles}.`);
          }
          if (state.negativePrompt) parts.push(`Do not include: ${state.negativePrompt}.`);
          if (contextDocs.length > 0) parts.push(`\n\n[STYLE GUIDELINES]:\n${contextDocs.join('\n\n')}`);
          return parts.join(' ');
      }

      if (state.referenceImage?.trim()) parts.push(state.referenceImage.trim());
      const coreParts = [];
      if (state.textSubMode === 'avatar') {
          const framings = state.selections.framing?.map(i => formatOption(i, true, state.targetModel)) || [];
          const styles = state.selections.avatar_style?.map(i => formatOption(i, true, state.targetModel)) || [];
          if (framings.length) coreParts.push(framings.join(' '));
          if (styles.length) coreParts.push(styles.join(' '));
          coreParts.push("avatar of");
          if (processedTopic?.trim()) coreParts.push(processedTopic);
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
          if (processedTopic?.trim()) coreParts.push(processedTopic);
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
    }
  }, [state, processedTopic]);

  return {
    state,
    dispatch,
    generatedPrompt,
    currentData,
    detectedVars
  };
};