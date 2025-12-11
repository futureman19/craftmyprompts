import React from 'react';
import { 
    Key, RefreshCw, Zap, Bot, Sparkles, Swords, GitCompare, 
    Layers, MonitorPlay, ArrowRight, Target 
} from 'lucide-react';

const TestRunnerControls = ({
    // State
    viewMode, provider, geminiKey, openaiKey, refineConfig, 
    selectedModel, availableModels, 
    // Derived State
    isUsingGlobalGemini, isUsingGlobalOpenAI,
    // Actions
    onViewChange, onProviderChange, onGeminiKeyChange, onOpenaiKeyChange,
    onClearKey, onFetchModels, onModelChange, onRefineConfigChange
}) => {

    return (
        <div className="space-y-6">
            
            {/* TIER 1: VIEW MODE SELECTOR (Moved inside controls for cleaner layout) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => onViewChange('simple')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <MonitorPlay size={16} /> Individual Run
                </button>
                <button 
                    onClick={() => onViewChange('advanced')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'advanced' ? 'bg-white dark:bg-slate-700 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <Layers size={16} /> Orchestrator
                </button>
            </div>

            {/* TIER 2: PROVIDER SELECTOR */}
            {viewMode === 'simple' ? (
                <div className="flex gap-2">
                    <button onClick={() => onProviderChange('gemini')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold ${provider === 'gemini' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Sparkles size={16} /> Gemini
                    </button>
                    <button onClick={() => onProviderChange('openai')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold ${provider === 'openai' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Bot size={16} /> OpenAI
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => onProviderChange('battle')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold ${provider === 'battle' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Swords size={16} /> Battle Mode
                    </button>
                    <button onClick={() => onProviderChange('refine')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold ${provider === 'refine' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <GitCompare size={16} /> Refine Loop
                    </button>
                </div>
            )}
            
            {/* REFINE CONFIGURATION PANEL */}
            {provider === 'refine' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/50 animate-in fade-in space-y-4">
                    <div className="flex items-center justify-between">
                         <h4 className="text-xs font-bold uppercase text-orange-600 dark:text-orange-400 flex items-center gap-2">
                            <Target size={14} /> Critique Focus
                         </h4>
                         <select 
                            value={refineConfig.focus}
                            onChange={(e) => onRefineConfigChange('focus', e.target.value)}
                            className="text-xs p-1.5 rounded border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        >
                            <option value="general">General Improvement</option>
                            <option value="security">Security Audit</option>
                            <option value="performance">Performance Optimization</option>
                            <option value="cleanliness">Code Cleanliness</option>
                            <option value="roast">Roast My Code 🔥</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-orange-500 font-bold uppercase block mb-1">Drafter</label>
                            <select 
                                value={refineConfig.drafter}
                                onChange={(e) => onRefineConfigChange('drafter', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="gemini">Gemini</option>
                                <option value="openai">OpenAI</option>
                            </select>
                        </div>
                        <ArrowRight size={16} className="text-orange-300 mt-5" />
                        <div className="flex-1">
                            <label className="text-[10px] text-orange-500 font-bold uppercase block mb-1">Critiquer</label>
                            <select 
                                value={refineConfig.critiquer}
                                onChange={(e) => onRefineConfigChange('critiquer', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="openai">OpenAI</option>
                                <option value="gemini">Gemini</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* API KEY INPUTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                
                {/* GEMINI KEY */}
                {(provider === 'gemini' || provider === 'battle' || (provider === 'refine' && (refineConfig.drafter === 'gemini' || refineConfig.critiquer === 'gemini'))) && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1"><Key size={12} /> Gemini Key</label>
                            {provider === 'gemini' && <button onClick={onFetchModels} disabled={!geminiKey} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-500 hover:underline disabled:opacity-30"><RefreshCw size={10} /> Refresh Models</button>}
                        </div>
                        {isUsingGlobalGemini ? (
                             <div className="flex items-center gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-md text-indigo-700 dark:text-indigo-400 text-xs font-medium"><Zap size={14} fill="currentColor" /> <span>Connected via App Key (Free)</span></div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={geminiKey} onChange={(e) => onGeminiKeyChange(e.target.value)} placeholder="Paste Google API Key..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                {geminiKey && <button onClick={() => onClearKey('gemini')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                            </div>
                        )}
                        {provider === 'gemini' && availableModels.length > 0 && (
                             <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs outline-none">
                                {availableModels.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>)}
                            </select>
                        )}
                    </div>
                )}
                
                {/* OPENAI KEY */}
                {(provider === 'openai' || provider === 'battle' || (provider === 'refine' && (refineConfig.drafter === 'openai' || refineConfig.critiquer === 'openai'))) && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><Key size={12} /> OpenAI Key</label>
                        {isUsingGlobalOpenAI ? (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-md text-emerald-700 dark:text-emerald-400 text-xs font-medium"><Zap size={14} fill="currentColor" /> <span>Connected via App Key</span></div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={openaiKey} onChange={(e) => onOpenaiKeyChange(e.target.value)} placeholder="sk-..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none" />
                                {openaiKey && <button onClick={() => onClearKey('openai')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestRunnerControls;