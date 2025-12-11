import React from 'react';
import { 
  Sparkles, MessageSquare, Palette, Video, Command, Search, Dices, 
  Wand2, Bookmark, MonitorPlay, Layers 
} from 'lucide-react';
import { PRESETS } from '../../data/constants.jsx';

const BuilderHeader = ({ 
    // State
    state, mobileTab, searchTerm, user, customPresets, currentData,
    // Actions
    dispatch, setMobileTab, setSearchTerm, setShowWizard, applyPreset, showToast
}) => {

    const handleRandomize = () => {
        dispatch({ type: 'RANDOMIZE', payload: currentData });
        showToast("Randomized selections!");
    };

    return (
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
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'text' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'text' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><MessageSquare size={14} /> Text</button>
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'art' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'art' ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Palette size={14} /> Art</button>
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'video' })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${state.mode === 'video' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Video size={14} /> Video</button>
                    </div>
                </div>

                {/* Sub-Mode / Target Selectors */}
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

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 dark:placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={handleRandomize} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm flex items-center gap-2" title="Randomize"><Dices size={18} /></button>
            </div>
        </header>
    );
};

export default BuilderHeader;