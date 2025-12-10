import { useReducer, useMemo } from 'react';
import { GENERAL_DATA, CODING_DATA, WRITING_DATA, ART_DATA, AVATAR_DATA } from '../data/constants.jsx';

// --- INITIAL STATE ---
const initialState = {
  mode: 'text', // 'text' | 'art'
  textSubMode: 'general', // Used for both Text (general/coding/writing) and Art (general/avatar)
  targetModel: 'midjourney',
  customTopic: '',
  selections: {}, // { categoryId: [{value, weight}] }
  // Flattened params for easier access
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
        // Multi-select logic
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
        // Logic to parse a preset object into state
        const newSels = {};
        const addSel = (cat, val) => { newSels[cat] = [{ value: val, weight: 1 }]; };
        
        const p = action.payload;
        
        // General/Text keys
        if (p.lang) addSel('language', p.lang);
        if (p.task) addSel('task', p.task);
        if (p.framework) addSel('framework', p.framework);
        if (p.intent) addSel('intent', p.intent);
        if (p.style) addSel('style', p.style);
        if (p.persona) addSel('persona', p.persona);
        if (p.tone) addSel('tone', p.tone);
        // CTO UPDATE: Load Author from preset
        if (p.author) addSel('author', p.author);
        
        // Art keys
        if (p.genre) addSel('genre', p.genre);
        if (p.shot) addSel('shots', p.shot);
        
        // Avatar keys
        if (p.avatar_style) addSel('avatar_style', p.avatar_style);
        if (p.framing) addSel('framing', p.framing);
        if (p.expression) addSel('expression', p.expression);
        if (p.accessories) addSel('accessories', p.accessories);
        if (p.background) addSel('background', p.background);

        return { 
            ...state, 
            selections: newSels, 
            customTopic: p.topic || '', 
            codeContext: p.codeContext || '', 
            variables: {},
            // Auto-switch mode if preset implies it
            mode: p.avatar_style ? 'art' : (p.genre ? 'art' : 'text'),
            textSubMode: p.avatar_style ? 'avatar' : (p.lang ? 'coding' : (p.framework ? 'writing' : 'general'))
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
        return { ...state, selections: randomSels };
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
      if (state.mode === 'art') {
          if (state.textSubMode === 'avatar') return AVATAR_DATA;
          return ART_DATA;
      }
      if (state.textSubMode === 'coding') return CODING_DATA;
      if (state.textSubMode === 'writing') return WRITING_DATA;
      return GENERAL_DATA;
  }, [state.mode, state.textSubMode]);

  const { result: processedTopic, detectedVars } = useMemo(() => 
      applyVariables(state.customTopic, state.variables), 
  [state.customTopic, state.variables]);

  const generatedPrompt = useMemo(() => {
    const parts = [];
    const getVals = (catId) => state.selections[catId]?.map(i => i.value) || [];

    // --- TEXT MODE ---
    if (state.mode === 'text') {
      
      if (state.textSubMode === 'coding') {
          const langs = getVals('language').join(', ');
          const tasks = getVals('task').join(' and ');
          const principles = getVals('principles').join(', ');
          
          if (tasks) parts.push(`Act as an expert Developer. Your task is to ${tasks}.`);
          else parts.push("Act as an expert Developer.");
          if (langs) parts.push(`Tech Stack: ${langs}.`);
          if (principles) parts.push(`Adhere to these principles: ${principles}.`);
      } else if (state.textSubMode === 'writing') {
          const frameworks = getVals('framework').join(', ');
          const intent = getVals('intent').join(', ');
          const styles = getVals('style').join(', ');
          // --- CTO UPDATE: Author Emulation Logic ---
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

      // Append Code Context if present
      if (state.textSubMode === 'coding' && state.codeContext?.trim()) {
          parts.push(`\nCODE CONTEXT:\n\`\`\`\n${state.codeContext}\n\`\`\`\n`);
      }

      if (state.chainOfThought) parts.push("Take a deep breath and think step-by-step to ensure the highest quality response.");
      if (state.codeOnly && state.textSubMode === 'coding') parts.push("IMPORTANT: Output ONLY the code. Do not provide explanations, chatter, or introductory text. Just the code block.");

      return parts.join('\n');
    } else {
      // --- ART MODE ---
      
      // Conversational Models (DALLE / Gemini)
      if (state.targetModel === 'dalle' || state.targetModel === 'gemini') {
          parts.push("Create an image of");
          
          if (state.textSubMode === 'avatar') {
             // Specific conversational flow for avatars
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
             // General Art conversational flow
             if (processedTopic) parts.push(`${processedTopic}.`);
             const genres = getVals('genre').join(' and ');
             if (genres) parts.push(`The style should be ${genres}.`);
             const envs = getVals('environment').join(', ');
             if (envs) parts.push(`The scene is set in ${envs}.`);
             const styles = getVals('style').join(', ');
             if (styles) parts.push(`Artistic inspiration: ${styles}.`);
          }

          if (state.negativePrompt) parts.push(`Do not include: ${state.negativePrompt}.`);
          return parts.join(' ');
      }

      // Tag-Based Models (Midjourney, SD, Flux)
      if (state.referenceImage?.trim()) parts.push(state.referenceImage.trim());

      const coreParts = [];
      
      if (state.textSubMode === 'avatar') {
          // --- AVATAR RECIPE ---
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
          // --- GENERAL ART RECIPE ---
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