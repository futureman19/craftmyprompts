import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { updateProfile } from 'firebase/auth';
import { 
  Sparkles, MessageSquare, Palette, Command, Search, Dices, 
  Brain, XCircle, ImagePlus, Ban, Cpu, Wand2, Code, 
  ChevronDown, FileText, Zap, RefreshCw, Check, Copy as CopyIcon, 
  Lock, Globe, Save, UserCircle, Braces, Play, ArrowLeft, Sliders, Terminal, Bookmark, Video 
} from 'lucide-react';

import { db, auth, APP_ID } from '../lib/firebase.js';
import { PRESETS } from '../data/constants.jsx';
import { STYLE_PREVIEWS } from '../data/stylePreviews.js'; 
import { usePromptBuilder } from '../hooks/usePromptBuilder.js';
import TestRunnerModal from '../components/TestRunnerModal.jsx';
import WizardMode from '../components/WizardMode.jsx'; 

const BuilderView = ({ user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest }) => {
  // --- CUSTOM HOOK ---
  const { state, dispatch, generatedPrompt, currentData, detectedVars } = usePromptBuilder();

  // --- LOCAL UI STATE ---
  const [displayName, setDisplayName] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState({});
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveVisibility, setSaveVisibility] = useState('private');
  const [expandedCategories, setExpandedCategories] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  // --- STATE: Custom Presets & Mobile Tab ---
  const [customPresets, setCustomPresets] = useState([]);
  const [mobileTab, setMobileTab] = useState('edit');

  const globalApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const globalOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY || ''; 

  // --- EFFECT: LOAD INITIAL DATA (REMIX) ---
  useEffect(() => {
    if (initialData) {
        dispatch({ type: 'LOAD_INITIAL_DATA', payload: initialData });
        showToast("Prompt loaded for remixing!");
        clearInitialData(); 
    }
  }, [initialData, dispatch, showToast, clearInitialData]);

  // --- EFFECT: FETCH CUSTOM PRESETS ---
  useEffect(() => {
      if (!user) {
          setCustomPresets([]);
          return;
      }
      const q = query(
          collection(db, 'artifacts', APP_ID, 'users', user.uid, 'presets'),
          orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const presets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCustomPresets(presets);
      });
      
      return () => unsubscribe();
  }, [user]);

  // --- HANDLERS ---
  const handleTestClick = () => {
      if (!user) {
          showToast("Please log in to use the Test Runner.", "error");
          onLoginRequest(); 
          return;
      }
      setShowTestModal(true);
  };

  const handleSaveSnippet = async (content, label = 'AI Result') => {
      if (!user) {
          showToast("Please log in to save snippets.", "error");
          onLoginRequest();
          return;
      }
      try {
          await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'snippets'), {
              content: content,
              label: label, 
              type: state.mode,
              promptUsed: generatedPrompt,
              createdAt: serverTimestamp()
          });
          showToast("Result saved to Snippets!");
      } catch (e) {
          console.error("Error saving snippet:", e);
          showToast("Failed to save snippet.", "error");
      }
  };

  const toggleCategory = (id) => {
      setExpandedCategories(prev => ({
          ...prev,
          [id]: !prev[id]
      }));
  };

  const toggleSelection = (categoryId, option) => {
      // Smart Multi-Select Logic
      const singleSelectCategories = ['length', 'format', 'framework_version', 'params', 'framing', 'motion_strength'];
      const isSingleSelect = singleSelectCategories.includes(categoryId);

      dispatch({ 
          type: 'TOGGLE_SELECTION', 
          payload: { categoryId, option, isSingleSelect } 
      });
  };

  const applyPreset = (preset) => {
      dispatch({ type: 'LOAD_PRESET', payload: preset });
      showToast(`Loaded preset: ${preset.label || 'Custom'}`);
  };

  const handleSaveAsPreset = async () => {
      if (!user) {
          onLoginRequest();
          return;
      }
      
      const name = prompt("Enter a name for this preset (e.g., 'My React Stack'):");
      if (!name) return;

      try {
          const presetData = {
              label: name,
              mode: state.mode,
              textSubMode: state.textSubMode || 'general', 
              selections: state.selections, 
              customTopic: state.customTopic || '',
              codeContext: state.codeContext || '',
              lang: state.selections.language?.[0]?.value || null, 
              avatar_style: state.selections.avatar_style?.[0]?.value || null,
              createdAt: serverTimestamp()
          };

          await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'presets'), presetData);
          showToast("Preset saved! Check the Presets menu.");
      } catch (error) {
          console.error("Error saving preset:", error);
          showToast("Failed to save preset.", "error");
      }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    addToHistory(generatedPrompt, state.mode);
    setTimeout(() => setCopied(false), 2000);
    showToast("Copied to clipboard!");
  };

  const handleCopyJSON = () => {
    const dataToCopy = {
        meta: { app: "CraftMyPrompt", version: "1.0", mode: state.mode },
        prompt: generatedPrompt,
        structure: state.selections
    };
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
    showToast("JSON Data copied!");
  };

  const handleUnifiedSave = async () => {
    if (!user) {
        onLoginRequest();
        return;
    }
    
    if (saveVisibility === 'public' && !displayName && (!user.displayName || user.displayName === 'Guest')) {
         const name = prompt("Please enter a display name for the community:");
         if(name) { 
             setDisplayName(name); 
             if (auth.currentUser && user.uid !== 'demo') {
                await updateProfile(auth.currentUser, { displayName: name }); 
             }
         } else { return; }
    }
    
    setIsSaving(true);
    try {
        const saveData = {
            prompt: generatedPrompt, 
            selections: state.selections, 
            customTopic: state.customTopic, 
            type: state.mode, 
            textSubMode: state.mode === 'text' ? state.textSubMode : null,
            chainOfThought: state.chainOfThought, 
            codeOnly: state.codeOnly, 
            codeContext: state.codeContext, 
            visibility: saveVisibility, 
            negativePrompt: state.negativePrompt, 
            referenceImage: state.referenceImage, 
            targetModel: state.targetModel, 
            loraName: state.loraName, 
            seed: state.seed, 
            createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_prompts'), saveData);
        addToHistory(generatedPrompt, state.mode);
        
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

  const renderHighlightedPrompt = (text) => {
      if (!text) return <span className="text-slate-500 italic">Your prompt will appear here...</span>;
      const parts = text.split(/(\{.*?\})/g);
      return parts.map((part, index) => {
          if (part.match(/^\{.*\}$/)) {
              return <span key={index} className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5 mx-0.5 font-bold font-mono text-xs align-middle">{part}</span>;
          }
          return <span key={index}>{part}</span>;
      });
  };

  return (
      <div className="flex flex-col md:flex-row h-full w-full relative">
        
        {/* --- LEFT PANEL: BUILDER --- */}
        <div className={`flex-1 min-w-0 flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm z-10 sticky top-0 transition-colors">
                
                {/* Mobile Tab Switcher */}
                <div className="md:hidden flex w-full bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
                    <button onClick={() => setMobileTab('edit')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mobileTab === 'edit' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Edit</button>
                    <button onClick={() => setMobileTab('preview')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mobileTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Preview</button>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg text-white ${state.mode === 'text' ? 'bg-indigo-600' : (state.mode === 'art' ? 'bg-pink-600' : 'bg-purple-600')}`}><Sparkles size={20} /></div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden md:block">CraftMyPrompt</h1>
                        </div>
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'text' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'text' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><MessageSquare size={14} /> Text</button>
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'art' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'art' ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Palette size={14} /> Art</button>
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'video' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'video' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Video size={14} /> Video</button>
                        </div>
                    </div>
                    {state.mode === 'text' && (
                         <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {['general', 'coding', 'writing'].map(m => (
                                <button key={m} onClick={() => dispatch({ type: 'SET_SUBMODE', payload: m })} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors capitalize ${state.textSubMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m}</button>
                            ))}
                         </div>
                    )}
                    {state.mode === 'art' && (
                         <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {['general', 'avatar'].map(m => (
                                <button key={m} onClick={() => dispatch({ type: 'SET_SUBMODE', payload: m })} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors capitalize ${state.textSubMode === m || (m === 'general' && state.textSubMode !== 'avatar') ? 'bg-pink-600 text-white border-pink-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m}</button>
                            ))}
                            
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            
                            <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Target:</span>
                            {['midjourney', 'stable-diffusion', 'dalle', 'gemini', 'flux'].map(m => (
                                <button key={m} onClick={() => dispatch({ type: 'SET_TARGET_MODEL', payload: m })} className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap capitalize transition-colors ${state.targetModel === m ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m.replace('-', ' ')}</button>
                            ))}
                         </div>
                    )}
                </div>
                <div className="flex gap-2">
                      <button onClick={() => setShowWizard(true)} className="px-3 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-md transition-all animate-in fade-in"><Wand2 size={16} /> <span className="hidden md:inline">Wizard Mode</span></button>

                      <div className="relative group">
                          <button className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium"><Command size={16} /> <span className="hidden md:inline">Presets</span></button>
                          <div className="absolute top-full left-0 w-64 pt-2 hidden group-hover:block z-50">
                             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 p-2 max-h-96 overflow-y-auto">
                                
                                {user && customPresets.length > 0 && (
                                    <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-1 flex items-center gap-1"><Bookmark size={10} /> My Presets</div>
                                        {customPresets.map((p) => (
                                            <button key={p.id} onClick={() => applyPreset(p)} className="w-full text-left px-2 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-between group">
                                                <span>{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Quick Start</div>
                                {((state.mode === 'text' 
                                    ? PRESETS[state.textSubMode] || PRESETS.general 
                                    : (state.mode === 'video' ? PRESETS.video : (state.textSubMode === 'avatar' ? PRESETS.avatar : PRESETS.art))
                                ) || []).map((p, i) => (
                                    <button key={i} onClick={() => applyPreset(p)} className="w-full text-left px-2 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg">{p.label}</button>
                                ))}
                             </div>
                          </div>
                      </div>

                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 dark:placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => { dispatch({ type: 'RANDOMIZE', payload: currentData }); showToast("Randomized selections!"); }} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm flex items-center gap-2" title="Randomize"><Dices size={18} /></button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                 <div className="space-y-4">
                    {!displayName && user && !user.displayName && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 p-3 rounded-lg flex gap-2 items-center text-sm">
                            <UserCircle className="text-indigo-500 dark:text-indigo-400" /><input className="bg-transparent border-b border-indigo-300 dark:border-indigo-600 outline-none flex-1 text-indigo-900 dark:text-indigo-100 placeholder-indigo-300 dark:placeholder-indigo-500" placeholder="Set display name..." onBlur={(e) => { if(e.target.value) { setDisplayName(e.target.value); updateProfile(user, { displayName: e.target.value }); } }} />
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 relative group transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Wand2 size={14} /> {state.mode === 'text' ? (state.textSubMode === 'coding' ? 'Task / Instruction' : 'Topic / Content') : 'Main Subject'}
                            </h3>
                            {state.mode === 'text' && (
                                <div className="flex items-center gap-2">
                                     <button onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'chainOfThought', value: !state.chainOfThought })} className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${state.chainOfThought ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 hover:bg-slate-200'}`} title="Chain of Thought"><Brain size={12} /> <span className="hidden sm:inline">CoT</span></button>
                                     {state.textSubMode === 'coding' && <button onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'codeOnly', value: !state.codeOnly })} className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${state.codeOnly ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 hover:bg-slate-200'}`} title="Code Only"><XCircle size={12} /> <span className="hidden sm:inline">Code Only</span></button>}
                                </div>
                            )}
                        </div>
                        
                        <textarea 
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 focus:ring-0 focus:outline-none resize-none text-sm leading-relaxed dark:text-slate-200 min-h-[120px]" 
                            rows={5}
                            placeholder={state.mode === 'text' ? "Enter content here. Use {brackets} for variables..." : "e.g. 'A cyberpunk city'"} 
                            value={state.customTopic} 
                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'customTopic', value: e.target.value })} 
                        />

                        {detectedVars.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-in fade-in">
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1"><Code size={10} /> Variables Detected</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {detectedVars.map(v => (
                                        <div key={v}>
                                            <input className="w-full p-1.5 rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-slate-200" placeholder={`Value for ${v}...`} value={state.variables[v] || ''} onChange={(e) => dispatch({ type: 'UPDATE_VARIABLE', key: v, value: e.target.value })} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {state.mode === 'text' && state.textSubMode === 'coding' && (
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-sm animate-in slide-in-from-top-2 fade-in">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Terminal size={14} /> Code Context</h3>
                            <textarea className="w-full p-3 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-xs font-mono leading-relaxed placeholder-slate-600" rows={5} placeholder="// Paste your broken code or current file content here..." value={state.codeContext} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'codeContext', value: e.target.value })} />
                        </div>
                    )}

                    {/* --- CTO UPDATE: VIDEO MODE INPUTS --- */}
                    {state.mode === 'video' && (
                         <div className="space-y-4 animate-in slide-in-from-top-4 fade-in">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Ban size={14} /> Negative Prompt</h3>
                                <input className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-slate-300 dark:text-slate-200" placeholder="e.g. static, blur, distortion, morphing" value={state.negativePrompt} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'negativePrompt', value: e.target.value })} />
                            </div>

                            {/* Video Control Panel */}
                             <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                <div className="flex items-center gap-2 mb-2"><Sliders size={16} className="text-purple-500" /><span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Gen-2 / Pika Settings</span></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Motion (1-10)</span><span className="text-purple-500">{state.videoMotion || 5}</span></div>
                                        <input type="range" min="1" max="10" step="1" value={state.videoMotion || 5} onChange={(e) => dispatch({type: 'UPDATE_FIELD', field: 'videoMotion', value: e.target.value})} className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-600"/>
                                    </div>
                                    <div>
                                         <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Seed</span></div>
                                         <input className="w-full p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-xs placeholder-slate-300 dark:text-slate-200" placeholder="Random" type="number" value={state.seed} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'seed', value: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {state.mode === 'art' && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><ImagePlus size={14} /> Ref Image URL</h3>
                                    <input className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none text-sm placeholder-slate-300 dark:text-slate-200" placeholder="https://..." value={state.referenceImage} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'referenceImage', value: e.target.value })} />
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Ban size={14} /> Negative Prompt</h3>
                                    <input className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder-slate-300 dark:text-slate-200" placeholder="e.g. blur, text" value={state.negativePrompt} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'negativePrompt', value: e.target.value })} />
                                </div>
                            </div>

                            {state.targetModel === 'stable-diffusion' && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-800 flex gap-4 items-end animate-in slide-in-from-top-2 fade-in">
                                    <div className="flex-1"><h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Cpu size={14} /> LoRA Model Name</h3><input className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-indigo-300 dark:text-slate-200" placeholder="e.g. arcane_style_v1" value={state.loraName} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'loraName', value: e.target.value })} /></div>
                                    <div className="w-24"><label className="text-[10px] font-bold text-indigo-400 block mb-1">Weight</label><input type="number" step="0.1" className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700 text-sm dark:text-slate-200" value={state.loraWeight} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'loraWeight', value: e.target.value })} /></div>
                                </div>
                            )}
                            {state.targetModel === 'midjourney' && (
                                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center gap-2 mb-2"><Sliders size={16} className="text-indigo-500" /><span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Midjourney Parameters</span></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Stylize (--s)</span><span className="text-indigo-500">{state.mjStylize || 100}</span></div><input type="range" min="0" max="1000" step="50" value={state.mjStylize || 100} onChange={(e) => dispatch({type: 'UPDATE_FIELD', field: 'mjStylize', value: e.target.value})} className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"/></div>
                                        <div><div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Chaos (--c)</span><span className="text-indigo-500">{state.mjChaos || 0}</span></div><input type="range" min="0" max="100" value={state.mjChaos || 0} onChange={(e) => dispatch({type: 'UPDATE_FIELD', field: 'mjChaos', value: e.target.value})} className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"/></div>
                                        <div><div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1"><span>Weird (--w)</span><span className="text-indigo-500">{state.mjWeird || 0}</span></div><input type="range" min="0" max="3000" step="50" value={state.mjWeird || 0} onChange={(e) => dispatch({type: 'UPDATE_FIELD', field: 'mjWeird', value: e.target.value})} className="w-full h-1 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"/></div>
                                    </div>
                                </div>
                            )}
                            {state.targetModel === 'dalle' && (
                                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center gap-2 mb-2"><Sliders size={16} className="text-indigo-500" /><span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">DALL-E 3 Settings</span></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Quality</label><div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1"><button onClick={() => dispatch({type: 'UPDATE_FIELD', field: 'dalleQuality', value: 'standard'})} className={`flex-1 text-xs py-1 rounded font-medium transition-all ${!state.dalleQuality || state.dalleQuality === 'standard' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Standard</button><button onClick={() => dispatch({type: 'UPDATE_FIELD', field: 'dalleQuality', value: 'hd'})} className={`flex-1 text-xs py-1 rounded font-medium transition-all ${state.dalleQuality === 'hd' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>HD</button></div></div>
                                        <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Style</label><div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-1"><button onClick={() => dispatch({type: 'UPDATE_FIELD', field: 'dalleStyle', value: 'vivid'})} className={`flex-1 text-xs py-1 rounded font-medium transition-all ${!state.dalleStyle || state.dalleStyle === 'vivid' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Vivid</button><button onClick={() => dispatch({type: 'UPDATE_FIELD', field: 'dalleStyle', value: 'natural'})} className={`flex-1 text-xs py-1 rounded font-medium transition-all ${state.dalleStyle === 'natural' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Natural</button></div></div>
                                    </div>
                                </div>
                            )}
                             <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">Seed</h3>
                                <input className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none text-sm placeholder-slate-300 dark:text-slate-200" placeholder="Random if empty" value={state.seed} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'seed', value: e.target.value })} type="number" />
                            </div>
                        </div>
                    )}
                 </div>

                 {/* CATEGORY GRID (2 Columns on Large Screens) */}
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredData.map((category) => (
                        <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-fit">
                            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onClick={() => toggleCategory(category.id)}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${state.selections[category.id]?.length ? (state.mode === 'text' ? 'bg-indigo-100 text-indigo-600' : (state.mode === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600')) : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>{category.icon}</div>
                                    <div><h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{category.title}</h2></div>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedCategories[category.id] ? 'rotate-180' : ''}`}/>
                            </div>
                            {expandedCategories[category.id] && (
                                <div className="px-3 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
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
                                                            const isSelected = state.selections[category.id]?.find(i => i.value === option);
                                                            // USE STYLE PREVIEW
                                                            const previewUrl = STYLE_PREVIEWS[option] || `https://placehold.co/100x100/${isSelected ? 'pink' : 'e2e8f0'}/white?text=${option.charAt(0)}`;
                                                            const opacityClass = STYLE_PREVIEWS[option] ? 'opacity-70' : 'opacity-20';
                                                            
                                                            return (
                                                                <button key={option} onClick={() => toggleSelection(category.id, option)} className={`relative h-16 rounded-lg text-xs font-medium border overflow-hidden text-left p-2 flex flex-col justify-end transition-all ${isSelected ? (state.mode === 'video' ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50' : 'border-pink-500 ring-2 ring-pink-200 bg-pink-50') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'}`}>
                                                                    <div className={`absolute inset-0 ${opacityClass} transition-opacity`} style={{ background: `url('${previewUrl}') center/cover` }} /><span className="relative z-10 truncate w-full shadow-black drop-shadow-md text-shadow">{option}</span>
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
                                                        const selectionItem = state.selections[category.id]?.find(i => i.value === option);
                                                        const isSelected = !!selectionItem;
                                                        return (
                                                            <div key={option} className="flex items-center">
                                                                <button onClick={() => toggleSelection(category.id, option)} className={`px-2.5 py-1 rounded-md text-xs border transition-all ${isSelected ? (state.mode === 'text' ? 'bg-indigo-600 border-indigo-600 text-white' : (state.mode === 'video' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-pink-600 border-pink-600 text-white')) : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>{option}</button>
                                                                {isSelected && state.mode === 'art' && category.id !== 'params' && state.targetModel !== 'dalle' && state.targetModel !== 'gemini' && (
                                                                    <div className="ml-2 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-0.5 animate-in slide-in-from-left-2 fade-in duration-200">
                                                                        <span className="text-[9px] text-slate-400 font-bold">W:</span>
                                                                        <input type="range" min="0.1" max="2.0" step="0.1" value={selectionItem.weight} onChange={(e) => dispatch({ type: 'UPDATE_WEIGHT', payload: { categoryId: category.id, optionValue: option, newWeight: e.target.value } })} className="w-12 h-1 accent-pink-500 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
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
                            {!expandedCategories[category.id] && state.selections[category.id]?.length > 0 && (
                                <div className="px-3 pb-3 flex flex-wrap gap-1">
                                    {state.selections[category.id].map(sel => (
                                        <span key={sel.value} className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">{sel.value}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            </div>
        </div>
        
        {/* --- RIGHT PANEL: PREVIEW --- */}
        <div className={`bg-slate-900 text-slate-100 flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex w-full'} md:w-96`}>
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <div className="flex items-center gap-2">
                    <button onClick={() => setMobileTab('edit')} className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
                    <h2 className="font-bold text-sm flex items-center gap-2"><FileText size={16} className={state.mode === 'text' ? 'text-indigo-400' : 'text-pink-400'} /> Preview</h2>
                </div>
                <div className="flex gap-2">
                    {state.mode === 'art' && (<button onClick={() => dispatch({ type: 'MAGIC_EXPAND' })} className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded hover:opacity-90 transition-opacity text-white" title="Magic Expand"><Zap size={14} /></button>)}
                    <button onClick={() => dispatch({ type: 'RESET' })} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors" title="Reset"><RefreshCw size={14} /></button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300">
                <div className="whitespace-pre-wrap min-h-full">
                    {renderHighlightedPrompt(generatedPrompt)}
                </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleCopy} disabled={!generatedPrompt} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : (state.mode === 'text' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500')} text-white disabled:opacity-50 disabled:cursor-not-allowed`}>{copied ? <Check size={16} /> : <CopyIcon size={16} />} {copied ? 'Copied' : 'Copy'}</button>
                    <button onClick={handleCopyJSON} disabled={!generatedPrompt} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed`}>{copiedJson ? <Check size={16} /> : <Braces size={16} />} {copiedJson ? 'JSON' : 'JSON'}</button>
                </div>

                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                        <span className="font-bold uppercase tracking-wider">Save Options</span>
                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            <button onClick={() => setSaveVisibility('private')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'private' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Lock size={12} /> Private</button>
                            <button onClick={() => setSaveVisibility('public')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'public' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={12} /> Public</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="col-span-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"><Save size={14} /> {isSaving ? 'Saving...' : (saveVisibility === 'public' ? 'Publish' : 'Save')}</button>
                        <button onClick={handleSaveAsPreset} disabled={!generatedPrompt} className="col-span-1 py-2 bg-indigo-900/50 hover:bg-indigo-900 rounded-lg text-xs font-medium text-indigo-300 border border-indigo-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"><Bookmark size={14} /> Save Preset</button>
                    </div>
                </div>
                
                {/* Test Button Area */}
                <button 
                    onClick={handleTestClick} 
                    disabled={!generatedPrompt}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play size={14} fill="currentColor" /> Test with Gemini
                </button>
            </div>
        </div>

        {/* Modal */}
        <TestRunnerModal 
            isOpen={showTestModal} 
            onClose={() => setShowTestModal(false)} 
            prompt={generatedPrompt} 
            defaultApiKey={globalApiKey}
            onSaveSnippet={handleSaveSnippet} 
        />
        
        {/* Wizard Component */}
        <WizardMode 
            isOpen={showWizard} 
            onClose={() => setShowWizard(false)}
            data={currentData}
            selections={state.selections}
            onToggle={toggleSelection}
            mode={state.mode}
        />
      </div>
  );
};

export default BuilderView;