import React from 'react';
import { 
  Wand2, Brain, XCircle, Code, Terminal, Globe, RefreshCw, Download, 
  Ban, Sliders, ImagePlus, Cpu, ChevronDown 
} from 'lucide-react';
import { STYLE_PREVIEWS } from '../../data/stylePreviews.js';

const BuilderInputPanel = ({ 
    // State
    state, detectedVars, expandedCategories, expandedSubcats, filteredData,
    contextUrl, isFetchingContext,
    // Actions
    dispatch, setContextUrl, handleFetchContext, toggleCategory, toggleSelection, toggleSubcatExpansion
}) => {
    return (
        <div className="space-y-4">
            {/* --- TOPIC BOX --- */}
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

            {/* --- CODE CONTEXT --- */}
            {state.mode === 'text' && state.textSubMode === 'coding' && (
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-sm animate-in slide-in-from-top-2 fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Terminal size={14} /> Code Context</h3>
                        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
                            <Globe size={12} className="text-indigo-400 ml-1" />
                            <input 
                                type="text" 
                                placeholder="Fetch URL..." 
                                value={contextUrl}
                                onChange={(e) => setContextUrl(e.target.value)}
                                className="bg-transparent border-none text-xs text-slate-200 w-32 focus:w-64 transition-all focus:outline-none placeholder-slate-600"
                            />
                            <button 
                                onClick={handleFetchContext} 
                                disabled={isFetchingContext || !contextUrl}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1 transition-colors disabled:opacity-50"
                            >
                                {isFetchingContext ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                            </button>
                        </div>
                    </div>
                    <textarea className="w-full p-3 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-xs font-mono leading-relaxed placeholder-slate-600" rows={5} placeholder="// Paste your broken code or current file content here..." value={state.codeContext} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'codeContext', value: e.target.value })} />
                </div>
            )}

            {/* --- VIDEO MODE INPUTS --- */}
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

            {/* --- ART INPUTS --- */}
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

                    {/* Model Specific Controls */}
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

            {/* --- CATEGORY GRID (2 Columns on Large Screens) --- */}
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
                                                        <button onClick={() => toggleSelection(category.id, option)} className={`px-2.5 py-1 rounded-md text-xs border transition-all ${isSelected ? (state.mode === 'text' ? 'bg-indigo-600 border-indigo-600 text-white' : (state.mode === 'video' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-pink-600 border-pink-600 text-white')) : 'bg-white dark:bg-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>{option}</button>
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
    );
};

export default BuilderInputPanel;