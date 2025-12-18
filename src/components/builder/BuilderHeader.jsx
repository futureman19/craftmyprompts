import React, { useState } from 'react';
import { 
  Sparkles, MessageSquare, Palette, Video, Command, Search, Dices, 
  TrendingUp, Bookmark, BookmarkPlus, BookOpen, Bot 
} from 'lucide-react';
// FIX: Import from 'presets' without extension for better module resolution in Vite
import { PRESETS } from '../../data/presets';

const BuilderHeader = ({ 
    // State
    state, mobileTab, searchTerm, user, customPresets, currentData,
    showTrendWidget, customKnowledge, 
    // Actions
    dispatch, setMobileTab, setSearchTerm, setShowTrendWidget, applyPreset, showToast,
    handleSaveAsPreset, applyKnowledge, setShowAgent 
}) => {
    // NEW STATE: Tracks which menu is open for mobile accessibility
    const [activeMenu, setActiveMenu] = useState(null); 
    
    const handleRandomize = () => {
        dispatch({ type: 'RANDOMIZE', payload: currentData });
        showToast("Randomized selections!");
    };

    const handleToggleMenu = (menuName) => {
        setActiveMenu(prev => (prev === menuName ? null : menuName));
    };

    const handleApplyPreset = (preset) => {
        applyPreset(preset);
        setActiveMenu(null); // Close menu after selection
    };

    const handleApplyKnowledge = (k) => {
        applyKnowledge(k);
        setActiveMenu(null); // Close menu after selection
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 shadow-sm z-30 sticky top-0 transition-colors">
            
            {/* Mobile Tab Switcher */}
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
                    
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'text' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'text' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><MessageSquare size={12} /> Text</button>
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'art' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'art' ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Palette size={12} /> Art</button>
                        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'video' })} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${state.mode === 'video' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Video size={12} /> Video</button>
                    </div>
                </div>

                {/* Sub-Mode / Target Selectors */}
                {state.mode === 'text' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['general', 'coding', 'social'].map(m => (
                            <button key={m} onClick={() => dispatch({ type: 'SET_SUBMODE', payload: m })} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap transition-colors capitalize ${state.textSubMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{m}</button>
                        ))}
                        </div>
                )}
                {state.mode === 'art' && (
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
                {/* Agent Button */}
                <button 
                    onClick={() => setShowAgent(true)} 
                    className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md transition-all animate-in fade-in"
                    title="Open CraftOS Agent"
                >
                    <Bot size={14} /> <span className="hidden md:inline">Agent</span>
                </button>

                {/* Trend Button */}
                {state.mode === 'text' && (
                    <button 
                        onClick={() => setShowTrendWidget(!showTrendWidget)} 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-md transition-all animate-in fade-in ${
                            showTrendWidget 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}
                        title="Viral Trends"
                    >
                        <TrendingUp size={14} /> <span className="hidden md:inline">Trends</span>
                    </button>
                )}

                {/* Presets Dropdown (Click Menu) */}
                <div className="relative">
                    <button 
                        onClick={() => handleToggleMenu('presets')} 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${activeMenu === 'presets' ? 'bg-slate-700 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white'}`}
                    >
                        <Command size={14} /> <span className="hidden md:inline">Presets</span>
                    </button>
                    
                    {activeMenu === 'presets' && (
                        <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" onMouseLeave={() => setActiveMenu(null)}>
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 p-2 max-h-96 overflow-y-auto">
                                {user && customPresets.length > 0 && (
                                    <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-1 flex items-center gap-1"><Bookmark size={10} /> My Presets</div>
                                        {customPresets.map((p) => (
                                            <button key={p.id} onClick={() => handleApplyPreset(p)} className="w-full text-left px-2 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-between">
                                                <span>{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Quick Start</div>
                                {((state.mode === 'text' ? PRESETS[state.textSubMode] || PRESETS.general : (state.mode === 'video' ? PRESETS.video : (state.textSubMode === 'avatar' ? PRESETS.avatar : PRESETS.art))) || []).map((p, i) => (
                                    <button key={i} onClick={() => handleApplyPreset(p)} className="w-full text-left px-2 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg">{p.label}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Knowledge Dropdown (Click Menu) */}
                <div className="relative">
                    <button 
                        onClick={() => handleToggleMenu('knowledge')} 
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${activeMenu === 'knowledge' ? 'bg-slate-700 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white'}`}
                    >
                        <BookOpen size={14} /> <span className="hidden md:inline">Knowledge</span>
                    </button>
                    
                    {activeMenu === 'knowledge' && (
                        <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" onMouseLeave={() => setActiveMenu(null)}>
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 p-2 max-h-96 overflow-y-auto">
                                {user && customKnowledge && customKnowledge.length > 0 ? (
                                    <>
                                        <div className="text-[10px] font-bold text-violet-500 uppercase px-2 py-1 flex items-center gap-1"><BookOpen size={10} /> My Knowledge</div>
                                        {customKnowledge.map((k) => (
                                            <button key={k.id} onClick={() => handleApplyKnowledge(k)} className="w-full text-left px-2 py-2 text-xs hover:bg-violet-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg group">
                                                <div className="font-bold">{k.title}</div>
                                                <div className="text-[9px] text-slate-400 line-clamp-1">{k.content}</div>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-400">
                                        No knowledge snippets saved.<br/>Go to Library to add some.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Preset Button */}
                <button onClick={handleSaveAsPreset} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1.5" title="Save as Preset"><BookmarkPlus size={16} /></button>

                {/* Search */}
                <div className="relative w-40 focus-within:w-64 transition-all duration-300">
                    <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                    <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 dark:placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={handleRandomize} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm flex items-center gap-2" title="Randomize"><Dices size={16} /></button>
            </div>
        </header>
    );
};

export default BuilderHeader;