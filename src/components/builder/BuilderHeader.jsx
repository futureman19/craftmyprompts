import React from 'react';
import { 
  Sparkles, MessageSquare, Palette, Video, Command, Search, Dices, 
  Wand2, Bookmark, Settings
} from 'lucide-react';
import { PRESETS } from '../../data/constants.jsx';

const BuilderHeader = ({ 
    // State
    state, mobileTab, searchTerm, user, customPresets, currentData, isSimpleMode,
    // Actions
    dispatch, setMobileTab, setSearchTerm, setShowWizard, applyPreset, showToast, setIsSimpleMode
}) => {

    const handleRandomize = () => {
        dispatch({ type: 'RANDOMIZE', payload: currentData });
        showToast("Randomized selections!");
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 shadow-sm z-10 sticky top-0 transition-colors">
            
            {/* Mobile Tab Switcher (Compacted) */}
            <div className="md:hidden flex w-full bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-2">
                <button onClick={() => setMobileTab('edit')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${mobileTab === 'edit' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Edit</button>
                <button onClick={() => setMobileTab('preview')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${mobileTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Preview</button>
            </div>

            <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg text-white ${state.mode === 'text' ? 'bg-indigo-600' : (state.mode === 'art' ? 'bg-pink-600' : 'bg-purple-600')}`}><Sparkles size={16} /></div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 hidden md:block">CraftMyPrompt</h1>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* --- CTO UPDATE: VIBE / PRO TOGGLE --- */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
                            <button 
                                onClick={() => setIsSimpleMode(true)}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${isSimpleMode ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                <Sparkles size={12} /> Vibe
                            </button>
                            <button 
                                onClick={() => setIsSimpleMode(false)}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${!isSimpleMode ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                <Settings size={12} /> Pro
                            </button>
                        </div>

                        {/* Mode Switcher (Hidden in Vibe Mode to reduce noise?) - keeping visible for now but compacted */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'text' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'text' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><MessageSquare size={12} /> Text</button>
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'art' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'art' ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Palette size={12} /> Art</button>
                            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'video' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'video' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Video size={12} /> Video</button>
                        </div>
                    </div>
                </div>

                {/* Sub-Mode Selectors - ONLY SHOW IN PRO MODE */}
                {!isSimpleMode && state.mode === 'text' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['general', 'coding', 'writing'].map(m => (
                            <button key={m} onClick={() => dispatch({ type: 'SET_SUBMODE', payload: m })} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap transition-colors capitalize ${state.textSubMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m}</button>
                        ))}
                        </div>
                )}
                {!isSimpleMode && state.mode === 'art' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['general', 'avatar'].map(m => (
                            <button key={m} onClick={() => dispatch({ type: 'SET_SUBMODE', payload: m })} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap transition-colors capitalize ${state.textSubMode === m || (m === 'general' && state.textSubMode !== 'avatar') ? 'bg-pink-600 text-white border-pink-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m}</button>
                        ))}
                        
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                        
                        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Target:</span>
                        {['midjourney', 'stable-diffusion', 'dalle', 'gemini', 'flux'].map(m => (
                            <button key={m} onClick={() => dispatch({ type: 'SET_TARGET_MODEL', payload: m })} className={`px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap capitalize transition-colors ${state.targetModel === m ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m.replace('-', ' ')}</button>
                        ))}
                        </div>
                )}
            </div>

            <div className="flex gap-2">
                    <button onClick={() => setShowWizard(true)} className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md transition-all animate-in fade-in"><Wand2 size={14} /> <span className="hidden md:inline">Wizard</span></button>

                    <div className="relative group">
                        <button className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium"><Command size={14} /> <span className="hidden md:inline">Presets</span></button>
                        {/* Gap fix */}
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

                    {/* HIDE SEARCH IN SIMPLE MODE */}
                    {!isSimpleMode && (
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                            <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 dark:placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    )}
                    
                    <button onClick={handleRandomize} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm flex items-center gap-2" title="Randomize"><Dices size={16} /></button>
            </div>
        </header>
    );
};

export default BuilderHeader;