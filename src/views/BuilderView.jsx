import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { 
  Sparkles, MessageSquare, Palette, Command, Search, Dices, 
  Brain, XCircle, ImagePlus, Ban, Cpu, Wand2, Code, 
  ChevronDown, FileText, Zap, RefreshCw, Check, Copy as CopyIcon, 
  Lock, Globe, Save, UserCircle 
} from 'lucide-react';

import { db, auth, APP_ID } from '../lib/firebase.js';
import { GENERAL_DATA, CODING_DATA, WRITING_DATA, ART_DATA, PRESETS } from '../data/constants.jsx';

const BuilderView = ({ user, initialData, clearInitialData, showToast, addToHistory }) => {
  // --- STATE ---
  const [mode, setMode] = useState('text'); 
  const [textSubMode, setTextSubMode] = useState('general'); 
  const [targetModel, setTargetModel] = useState('midjourney'); 
  const [selections, setSelections] = useState({});
  const [customTopic, setCustomTopic] = useState('');
  const [variables, setVariables] = useState({}); 
  
  // Art Specific
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [loraName, setLoraName] = useState('');
  const [loraWeight, setLoraWeight] = useState(1.0);
  const [seed, setSeed] = useState('');

  // Text Specific
  const [chainOfThought, setChainOfThought] = useState(false);
  const [codeOnly, setCodeOnly] = useState(false);

  // UI State
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState({});
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveVisibility, setSaveVisibility] = useState('private');
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- EFFECT: LOAD INITIAL DATA (REMIX) ---
  useEffect(() => {
    if (initialData) {
        setMode(initialData.type || 'text');
        if (initialData.type === 'text') {
            setTextSubMode(initialData.textSubMode || 'general');
            setChainOfThought(initialData.chainOfThought || false);
            setCodeOnly(initialData.codeOnly || false);
        }
        setSelections(initialData.selections || {});
        setCustomTopic(initialData.customTopic || '');
        setNegativePrompt(initialData.negativePrompt || '');
        setReferenceImage(initialData.referenceImage || '');
        if (initialData.targetModel) setTargetModel(initialData.targetModel);
        if (initialData.loraName) setLoraName(initialData.loraName);
        if (initialData.seed) setSeed(initialData.seed);
        
        showToast("Prompt loaded for remixing!");
        clearInitialData(); 
    }
  }, [initialData]);

  // --- LOGIC ---
  const detectedVars = useMemo(() => {
      if (!customTopic) return [];
      const regex = /\{([^}]+)\}/g;
      const matches = [...customTopic.matchAll(regex)].map(m => m[1]);
      return [...new Set(matches)];
  }, [customTopic]);

  const applyVariables = (text) => {
      let result = text;
      detectedVars.forEach(v => {
          if (variables[v]) {
             result = result.replace(new RegExp(`\\{${v}\\}`, 'g'), variables[v]);
          }
      });
      return result;
  };

  const formatOption = (item, isArtMode, model) => {
    if (!item) return '';
    const val = item.value;
    const weight = item.weight;
    if (!isArtMode || weight === 1) return val;
    if (model === 'midjourney') return `${val}::${weight}`; 
    if (model === 'stable-diffusion') return `(${val}:${weight})`; 
    if (model === 'dalle') return `${val} (priority level ${weight})`; 
    return val;
  };

  const buildPrompt = () => {
    const parts = [];
    const processedTopic = applyVariables(customTopic);

    if (mode === 'text') {
      const getVals = (catId) => selections[catId]?.map(i => i.value) || [];
      
      if (textSubMode === 'coding') {
          const langs = getVals('language').join(', ');
          const tasks = getVals('task').join(' and ');
          const principles = getVals('principles').join(', ');
          if (tasks) parts.push(`Act as an expert Developer. Your task is to ${tasks}.`);
          else parts.push("Act as an expert Developer.");
          if (langs) parts.push(`Tech Stack: ${langs}.`);
          if (principles) parts.push(`Adhere to these principles: ${principles}.`);
      } else if (textSubMode === 'writing') {
          const frameworks = getVals('framework').join(', ');
          const intent = getVals('intent').join(', ');
          const styles = getVals('style').join(', ');
          if (frameworks) parts.push(`Use the ${frameworks} framework.`);
          if (intent) parts.push(`Goal: ${intent}.`);
          if (styles) parts.push(`Style/Voice: ${styles}.`);
      } else {
          const persona = getVals('persona');
          const tone = getVals('tone');
          const format = getVals('format');
          if (persona.length) parts.push(`Act as an expert ${persona[0]}.`);
          if (tone.length) parts.push(`Tone: ${tone.join(', ')}.`);
          if (format.length) parts.push(`Format: ${format.join(', ')}.`);
      }

      if (processedTopic?.trim()) {
          const label = textSubMode === 'coding' ? 'CODE / CONTEXT:' : 'TOPIC / CONTENT:';
          parts.push(`\n${label}\n"${processedTopic}"\n`);
      }

      if (chainOfThought) parts.push("Take a deep breath and think step-by-step to ensure the highest quality response.");
      if (codeOnly && textSubMode === 'coding') parts.push("IMPORTANT: Output ONLY the code. Do not provide explanations, chatter, or introductory text. Just the code block.");

      return parts.join('\n');
    } else {
      // ART MODE
      if (targetModel === 'dalle') {
          parts.push("Create an image of");
          if (processedTopic) parts.push(`${processedTopic}.`);
          const genres = selections.genre?.map(i => i.value).join(' and ');
          if (genres) parts.push(`The style should be ${genres}.`);
          const envs = selections.environment?.map(i => i.value).join(', ');
          if (envs) parts.push(`The scene is set in ${envs}.`);
          const styles = selections.style?.map(i => i.value).join(', ');
          if (styles) parts.push(`Artistic inspiration: ${styles}.`);
          if (negativePrompt) parts.push(`Do not include: ${negativePrompt}.`);
          return parts.join(' ');
      }

      if (referenceImage?.trim()) parts.push(referenceImage.trim());

      const coreParts = [];
      const genres = selections.genre?.map(i => formatOption(i, true, targetModel)) || [];
      if (genres.length) coreParts.push(genres.join(' '));
      if (processedTopic?.trim()) coreParts.push(processedTopic);
      if (coreParts.length) parts.push(coreParts.join(' '));

      if (targetModel === 'stable-diffusion' && loraName) parts.push(`<lora:${loraName}:${loraWeight}>`);

      const envs = selections.environment?.map(i => formatOption(i, true, targetModel)) || [];
      if (envs.length) parts.push(`set in ${envs.join(', ')}`);
      
      const camParts = [];
      const shots = selections.shots?.map(i => formatOption(i, true, targetModel)) || [];
      const cameras = selections.camera?.map(i => formatOption(i, true, targetModel)) || [];
      if (shots.length) camParts.push(...shots);
      if (cameras.length) camParts.push(...cameras);
      if (camParts.length) parts.push(camParts.join(', '));

      const visualParts = [];
      const visuals = selections.visuals?.map(i => formatOption(i, true, targetModel)) || [];
      const tech = selections.tech?.map(i => formatOption(i, true, targetModel)) || [];
      if (visuals.length) visualParts.push(...visuals);
      if (tech.length) visualParts.push(...tech);
      if (visualParts.length) parts.push(visualParts.join(', '));

      const styles = selections.style?.map(i => formatOption(i, true, targetModel)) || [];
      if (styles.length) {
        parts.push(`in the style of ${styles.map(s => `by ${s}`).join(', ')}`);
      }

      let mainPrompt = parts.join(', ').replace(/, ,/g, ',');
      let suffix = '';
      
      if (negativePrompt?.trim()) {
          if (targetModel === 'midjourney') suffix += ` --no ${negativePrompt.trim()}`;
          else if (targetModel === 'stable-diffusion') mainPrompt += ` [${negativePrompt.trim()}]`;
      }

      if (seed && targetModel === 'midjourney') suffix += ` --seed ${seed}`;
      
      if (selections.params?.length) {
        selections.params.forEach(item => {
            const p = item.value;
            if (targetModel === 'midjourney') {
                if (p.includes(':')) suffix += ` --ar ${p}`;
                else if (['Seamless Pattern'].includes(p)) suffix += ` --tile`;
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
  };

  useEffect(() => {
    setGeneratedPrompt(buildPrompt());
  }, [selections, customTopic, mode, textSubMode, negativePrompt, referenceImage, targetModel, loraName, loraWeight, seed, chainOfThought, codeOnly, variables]);

  const applyPreset = (preset) => {
      setSelections({});
      setCustomTopic(preset.topic || '');
      setVariables({});
      const newSels = {};
      const addSel = (cat, val) => { newSels[cat] = [{ value: val, weight: 1 }]; };
      if (preset.lang) addSel('language', preset.lang);
      if (preset.task) addSel('task', preset.task);
      if (preset.framework) addSel('framework', preset.framework);
      if (preset.intent) addSel('intent', preset.intent);
      if (preset.style) addSel('style', preset.style);
      if (preset.persona) addSel('persona', preset.persona);
      if (preset.tone) addSel('tone', preset.tone);
      if (preset.genre) addSel('genre', preset.genre);
      if (preset.shot) addSel('shots', preset.shot);
      setSelections(newSels);
      showToast("Preset Applied!");
  };

  const handleMagicExpand = () => {
    const powerWords = ['masterpiece', 'best quality', 'highly detailed', '8k resolution', 'ray tracing', 'volumetric lighting'];
    const shuffled = powerWords.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setSelections(prev => {
        const current = prev['tech'] || [];
        const newItems = selected.map(w => ({ value: w, weight: 1 }));
        const unique = [...current];
        newItems.forEach(ni => {
            if(!unique.find(u => u.value === ni.value)) unique.push(ni);
        });
        return { ...prev, tech: unique };
    });
    showToast("Added magic words!");
  };

  const handleRandomize = () => {
      let dataSrc = ART_DATA;
      if (mode === 'text') {
          if (textSubMode === 'coding') dataSrc = CODING_DATA;
          else if (textSubMode === 'writing') dataSrc = WRITING_DATA;
          else dataSrc = GENERAL_DATA;
      }
      const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const newSels = {};
      const addRand = (catId) => {
          const cat = dataSrc.find(c => c.id === catId);
          if (cat && cat.subcategories.length) {
              const sub = rand(cat.subcategories);
              const opt = rand(sub.options);
              newSels[catId] = [{ value: opt, weight: 1 }];
          }
      };
      dataSrc.forEach(cat => addRand(cat.id));
      setSelections(newSels);
      showToast("Randomized selections!");
  };

  const toggleSelection = (categoryId, option) => {
    setSelections(prev => {
      const current = prev[categoryId] || [];
      const exists = current.find(item => item.value === option);
      let newCatSelections;
      const isSingleSelect = (mode === 'text') || (mode === 'art' && categoryId === 'params');
      if (mode === 'art' && categoryId === 'params') {
         if (exists) newCatSelections = current.filter(item => item.value !== option);
         else {
             if (option.includes(':')) newCatSelections = [...current.filter(i => !i.value.includes(':')), { value: option, weight: 1 }];
             else newCatSelections = [...current, { value: option, weight: 1 }];
         }
      } else if (isSingleSelect) {
         if (exists) newCatSelections = [];
         else newCatSelections = [{ value: option, weight: 1 }];
      } else {
        if (exists) newCatSelections = current.filter(item => item.value !== option);
        else newCatSelections = [...current, { value: option, weight: 1 }];
      }
      const newSelections = { ...prev, [categoryId]: newCatSelections };
      if (newCatSelections.length === 0) delete newSelections[categoryId];
      return newSelections;
    });
  };

  const updateWeight = (categoryId, optionValue, newWeight) => {
    setSelections(prev => {
        const current = prev[categoryId] || [];
        const newCatSelections = current.map(item => item.value === optionValue ? { ...item, weight: parseFloat(newWeight) } : item);
        return { ...prev, [categoryId]: newCatSelections };
    });
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    const textArea = document.createElement("textarea");
    textArea.value = generatedPrompt;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setCopied(true);
    addToHistory(generatedPrompt, mode);
    setTimeout(() => setCopied(false), 2000);
    showToast("Copied to clipboard!");
  };

  const handleUnifiedSave = async () => {
    if (!user) {
        showToast("Please wait for login...", "error");
        return;
    }
    
    if (saveVisibility === 'public' && !displayName && (!user.displayName || user.displayName === 'Guest')) {
         const name = prompt("Please enter a display name for the community:");
         if(name) { 
             setDisplayName(name); 
             if (auth.currentUser && user.uid !== 'demo') {
                await updateProfile(auth.currentUser, { displayName: name }); 
             }
         } else { 
             return; 
         }
    }
    
    setIsSaving(true);
    try {
        const saveData = {
            prompt: generatedPrompt, selections, customTopic, type: mode, textSubMode: mode === 'text' ? textSubMode : null,
            chainOfThought, codeOnly, visibility: saveVisibility, negativePrompt, referenceImage, targetModel, loraName, seed, createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_prompts'), saveData);
        addToHistory(generatedPrompt, mode);
        
        if (saveVisibility === 'public') {
            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'), { 
                ...saveData, 
                authorId: user.uid, 
                authorName: displayName || user.displayName || 'Anonymous', 
                likes: 0 
            });
            showToast("Published & Saved!");
        } else {
            showToast("Saved to Library!");
        }
    } catch (e) { 
        console.error(e); 
        showToast("Error saving prompt.", "error"); 
    }
    setIsSaving(false);
  };

  const toggleSubcatExpansion = (subName) => {
    setExpandedSubcats(prev => ({ ...prev, [subName]: !prev[subName] }));
  };

  let currentData = ART_DATA;
  if (mode === 'text') {
      if (textSubMode === 'coding') currentData = CODING_DATA;
      else if (textSubMode === 'writing') currentData = WRITING_DATA;
      else currentData = GENERAL_DATA;
  }

  const filteredData = useMemo(() => {
      if (!searchTerm) return currentData;
      return currentData.map(cat => ({
        ...cat,
        subcategories: cat.subcategories.map(sub => ({
          ...sub,
          options: sub.options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        })).filter(sub => sub.options.length > 0)
      })).filter(cat => cat.subcategories.length > 0);
  }, [searchTerm, currentData]);

  // --- RENDER ---
  return (
      <div className="flex h-full w-full">
        {/* Main Builder Panel */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-slate-50">
            <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-10 sticky top-0">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className={`p-2 rounded-lg text-white ${mode === 'text' ? 'bg-indigo-600' : 'bg-pink-600'}`}><Sparkles size={20} /></div><h1 className="text-xl font-bold text-slate-800 hidden md:block">CraftMyPrompt</h1></div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => { setMode('text'); setSelections({}); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><MessageSquare size={14} /> Text</button>
                            <button onClick={() => { setMode('art'); setSelections({}); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'art' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}><Palette size={14} /> Art</button>
                        </div>
                    </div>
                    {mode === 'text' && (
                         <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {['general', 'coding', 'writing'].map(m => (
                                <button key={m} onClick={() => setTextSubMode(m)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors capitalize ${textSubMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>{m}</button>
                            ))}
                         </div>
                    )}
                    {mode === 'art' && (
                         <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Target:</span>
                            {['midjourney', 'stable-diffusion', 'dalle'].map(m => (
                                <button key={m} onClick={() => setTargetModel(m)} className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap capitalize transition-colors ${targetModel === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>{m.replace('-', ' ')}</button>
                            ))}
                         </div>
                    )}
                </div>
                <div className="flex gap-2">
                      <div className="relative group">
                         <button className="px-3 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2 text-sm font-medium"><Command size={16} /> <span className="hidden md:inline">Presets</span></button>
                         <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 hidden group-hover:block z-50 p-2">
                             <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Quick Start</div>
                             {(mode === 'text' ? PRESETS[textSubMode] || PRESETS.general : PRESETS.art).map((p, i) => (
                                 <button key={i} onClick={() => applyPreset(p)} className="w-full text-left px-2 py-2 text-xs hover:bg-indigo-50 text-slate-700 rounded-lg">{p.label}</button>
                             ))}
                         </div>
                      </div>

                      <div className="relative flex-1">
                         <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                         <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={handleRandomize} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors shadow-sm flex items-center gap-2" title="Randomize"><Dices size={18} /></button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                 {!displayName && user && !user.displayName && (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex gap-2 items-center text-sm">
                        <UserCircle className="text-indigo-500" /><input className="bg-transparent border-b border-indigo-300 outline-none flex-1 text-indigo-900 placeholder-indigo-300" placeholder="Set display name..." onBlur={(e) => { if(e.target.value) { setDisplayName(e.target.value); updateProfile(user, { displayName: e.target.value }); } }} />
                    </div>
                )}
                {mode === 'text' && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button onClick={() => setChainOfThought(!chainOfThought)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${chainOfThought ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'}`}><Brain size={14} /> Chain of Thought</button>
                        {textSubMode === 'coding' && <button onClick={() => setCodeOnly(!codeOnly)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${codeOnly ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}><XCircle size={14} /> Code Only</button>}
                    </div>
                )}
                {mode === 'art' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><ImagePlus size={14} /> Ref Image URL</h3>
                                <input className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 focus:ring-2 focus:ring-pink-500 outline-none text-sm placeholder-slate-300" placeholder="https://..." value={referenceImage} onChange={(e) => setReferenceImage(e.target.value)} />
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Ban size={14} /> Negative Prompt</h3>
                                <input className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder-slate-300" placeholder="e.g. blur, text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
                            </div>
                        </div>
                        {targetModel === 'stable-diffusion' && (
                            <div className="bg-indigo-50 rounded-xl p-4 shadow-sm border border-indigo-100 flex gap-4 items-end">
                                <div className="flex-1"><h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Cpu size={14} /> LoRA Model Name</h3><input className="w-full p-2 bg-white rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-indigo-300" placeholder="e.g. arcane_style_v1" value={loraName} onChange={(e) => setLoraName(e.target.value)} /></div>
                                <div className="w-24"><label className="text-[10px] font-bold text-indigo-400 block mb-1">Weight</label><input type="number" step="0.1" className="w-full p-2 bg-white rounded-lg border border-indigo-200 text-sm" value={loraWeight} onChange={(e) => setLoraWeight(e.target.value)} /></div>
                            </div>
                        )}
                         <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">Seed</h3>
                            <input className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 focus:ring-2 focus:ring-pink-500 outline-none text-sm placeholder-slate-300" placeholder="Random if empty" value={seed} onChange={(e) => setSeed(e.target.value)} type="number" />
                        </div>
                    </>
                )}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Wand2 size={14} /> {mode === 'text' ? (textSubMode === 'coding' ? 'Code / Context' : 'Topic / Content') : 'Main Subject'}
                    </h3>
                    <textarea 
                        className="w-full p-3 bg-slate-50 rounded-lg border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed" 
                        rows={5} // Increased height
                        placeholder={mode === 'text' ? "Enter content here. Use {brackets} for variables..." : "e.g. 'A cyberpunk city'"} 
                        value={customTopic} 
                        onChange={(e) => setCustomTopic(e.target.value)} 
                    />
                    {detectedVars.length > 0 && (
                        <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1"><Code size={10} /> Variables Detected</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {detectedVars.map(v => (
                                    <div key={v}>
                                        <label className="text-[10px] font-medium text-slate-500">{v}</label>
                                        <input 
                                            className="w-full p-1.5 rounded border border-indigo-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                                            placeholder={`Value for ${v}...`}
                                            value={variables[v] || ''}
                                            onChange={(e) => setVariables(prev => ({ ...prev, [v]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {filteredData.map((category) => (
                    <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}>
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-md ${selections[category.id]?.length ? (mode === 'text' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600') : 'bg-slate-100 text-slate-400'}`}>{category.icon}</div>
                                <div><h2 className="font-semibold text-slate-700 text-sm">{category.title}</h2></div>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${activeCategory === category.id ? 'rotate-180' : ''}`}/>
                        </div>
                        {activeCategory === category.id && (
                            <div className="px-3 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100">
                                {category.subcategories.map((sub) => {
                                    const visibleLimit = 8;
                                    const isExpanded = expandedSubcats[sub.name];
                                    const optionsToShow = isExpanded ? sub.options : sub.options.slice(0, visibleLimit);
                                    const hasMore = sub.options.length > visibleLimit;
                                    if (category.isVisual) {
                                        return (
                                            <div key={sub.name} className="mt-4">
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{sub.name}</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {optionsToShow.map((option) => {
                                                        const isSelected = selections[category.id]?.find(i => i.value === option);
                                                        return (
                                                            <button key={option} onClick={() => toggleSelection(category.id, option)} className={`relative h-16 rounded-lg text-xs font-medium border overflow-hidden text-left p-2 flex flex-col justify-end transition-all ${isSelected ? 'border-pink-500 ring-2 ring-pink-200 bg-pink-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                                <div className="absolute inset-0 opacity-20" style={{ background: `url('https://placehold.co/100x100/${isSelected ? 'pink' : 'e2e8f0'}/white?text=${option.charAt(0)}') center/cover` }} /><span className="relative z-10 truncate w-full">{option}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {hasMore && (<button onClick={() => toggleSubcatExpansion(sub.name)} className="mt-2 text-xs font-bold text-slate-500 hover:text-pink-600 flex items-center gap-1">{isExpanded ? 'Show Less' : `Show ${sub.options.length - visibleLimit} More...`}</button>)}
                                            </div>
                                        )
                                    }
                                    return (
                                        <div key={sub.name} className="mt-3">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{sub.name}</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {optionsToShow.map((option) => {
                                                    const selectionItem = selections[category.id]?.find(i => i.value === option);
                                                    const isSelected = !!selectionItem;
                                                    return (
                                                        <div key={option} className="flex items-center">
                                                            <button onClick={() => toggleSelection(category.id, option)} className={`px-2.5 py-1 rounded-md text-xs border transition-all ${isSelected ? (mode === 'text' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-pink-600 border-pink-600 text-white') : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{option}</button>
                                                            {isSelected && mode === 'art' && category.id !== 'params' && targetModel !== 'dalle' && (
                                                                <div className="ml-2 flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5 animate-in slide-in-from-left-2 fade-in duration-200">
                                                                    <span className="text-[9px] text-slate-400 font-bold">W:</span>
                                                                    <input type="range" min="0.1" max="2.0" step="0.1" value={selectionItem.weight} onChange={(e) => updateWeight(category.id, option, e.target.value)} className="w-12 h-1 accent-pink-500 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {hasMore && (<button onClick={() => toggleSubcatExpansion(sub.name)} className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">{isExpanded ? 'Show Less' : `+${sub.options.length - visibleLimit}`}</button>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {activeCategory !== category.id && selections[category.id]?.length > 0 && (
                            <div className="px-3 pb-3 flex flex-wrap gap-1">
                                {selections[category.id].map(sel => (
                                    <span key={sel.value} className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">{sel.value}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
        {/* PREVIEW PANEL - Right side */}
        <div className="w-96 bg-slate-900 text-slate-100 flex flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h2 className="font-bold text-sm flex items-center gap-2"><FileText size={16} className={mode === 'text' ? 'text-indigo-400' : 'text-pink-400'} /> Preview</h2>
                <div className="flex gap-2">
                    {mode === 'art' && (<button onClick={handleMagicExpand} className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded hover:opacity-90 transition-opacity text-white" title="Magic Expand"><Zap size={14} /></button>)}
                    <button onClick={() => { setSelections({}); setCustomTopic(''); setVariables({}); setReferenceImage(''); setNegativePrompt(''); setLoraName(''); setSeed(''); setChainOfThought(false); setCodeOnly(false); }} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors" title="Reset"><RefreshCw size={14} /></button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <textarea value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-300 placeholder-slate-700 font-mono text-sm leading-relaxed" spellCheck="false" placeholder="Your prompt will appear here..." />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-4">
                <button onClick={handleCopy} disabled={!generatedPrompt} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : (mode === 'text' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500')} text-white disabled:opacity-50 disabled:cursor-not-allowed`}>{copied ? <Check size={16} /> : <CopyIcon size={16} />} {copied ? 'Copied' : 'Copy'}</button>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                        <span className="font-bold uppercase tracking-wider">Save Options</span>
                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            <button onClick={() => setSaveVisibility('private')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'private' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Lock size={12} /> Private</button>
                            <button onClick={() => setSaveVisibility('public')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'public' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={12} /> Public</button>
                        </div>
                    </div>
                    <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"><Save size={14} /> {isSaving ? 'Saving...' : (saveVisibility === 'public' ? 'Save & Publish' : 'Save to Library')}</button>
                </div>
            </div>
        </div>
      </div>
  );
};

export default BuilderView;