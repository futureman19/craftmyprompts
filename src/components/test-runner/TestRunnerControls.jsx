import React from 'react';
import { 
    Key, RefreshCw, Zap, Bot, Sparkles, Swords, GitCompare, 
    Layers, MonitorPlay, ArrowRight, Target, ShieldCheck, Users, 
    Activity, Brain, Lock 
} from 'lucide-react';

const TestRunnerControls = ({
    // State
    viewMode, provider, 
    geminiKey, openaiKey, groqKey, anthropicKey,
    refineConfig, swarmConfig,
    selectedModel, availableModels, 
    // Derived State
    isUsingGlobalGemini, isUsingGlobalOpenAI, isLoggedIn, // <--- New Prop
    // Actions
    onViewChange, onProviderChange, 
    onGeminiKeyChange, onOpenaiKeyChange, onGroqKeyChange, onAnthropicKeyChange,
    onClearKey, onFetchModels, onModelChange, onRefineConfigChange, onSwarmConfigChange
}) => {

    const renderLockedButton = (label, icon) => (
        <button disabled className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed relative group">
            {icon} {label}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Login to unlock
            </div>
            <div className="absolute -top-1 -right-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                 <Lock size={10} className="text-slate-400" />
            </div>
        </button>
    );

    return (
        <div className="space-y-6">
            
            {/* TIER 1: VIEW MODE SELECTOR */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => onViewChange('simple')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <MonitorPlay size={16} /> Individual Run
                </button>
                
                {/* Lock Orchestrator for Guests */}
                {isLoggedIn ? (
                    <button 
                        onClick={() => onViewChange('advanced')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'advanced' ? 'bg-white dark:bg-slate-700 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        <Layers size={16} /> Orchestrator
                    </button>
                ) : (
                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed relative group">
                        <Layers size={16} /> Orchestrator <Lock size={12} />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            Login to unlock advanced modes
                        </div>
                    </button>
                )}
            </div>

            {/* TIER 2: PROVIDER SELECTOR */}
            {viewMode === 'simple' ? (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {/* Free/Standard Providers (Always Available) */}
                    <button onClick={() => onProviderChange('gemini')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'gemini' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Sparkles size={16} /> Gemini
                    </button>
                    <button onClick={() => onProviderChange('openai')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'openai' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Bot size={16} /> OpenAI
                    </button>

                    {/* Pro Providers (Locked for Guests) */}
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => onProviderChange('groq')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'groq' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                                <Activity size={16} /> Groq
                            </button>
                            <button onClick={() => onProviderChange('anthropic')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'anthropic' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                                <Brain size={16} /> Anthropic
                            </button>
                        </>
                    ) : (
                        <>
                            {renderLockedButton("Groq", <Activity size={16} />)}
                            {renderLockedButton("Anthropic", <Brain size={16} />)}
                        </>
                    )}
                </div>
            ) : (
                /* Advanced Modes (Only rendered if isLoggedIn based on Tier 1 logic, but good to be safe) */
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button onClick={() => onProviderChange('battle')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'battle' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Swords size={16} /> Battle
                    </button>
                    <button onClick={() => onProviderChange('refine')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'refine' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <GitCompare size={16} /> Refine
                    </button>
                    <button onClick={() => onProviderChange('swarm')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'swarm' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                        <Users size={16} /> Swarm
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
                                <option value="groq">Groq</option>
                                <option value="anthropic">Anthropic</option>
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
                                <option value="groq">Groq</option>
                                <option value="anthropic">Anthropic</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* SWARM CONFIGURATION PANEL */}
            {provider === 'swarm' && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50 animate-in fade-in space-y-4">
                    <div className="flex items-center justify-between border-b border-violet-200 dark:border-violet-800 pb-2 mb-2">
                         <h4 className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400 flex items-center gap-2">
                            <Users size={14} /> Meeting Room
                         </h4>
                         <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-violet-400 uppercase">Rounds:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="5" 
                                value={swarmConfig.rounds}
                                onChange={(e) => onSwarmConfigChange('rounds', parseInt(e.target.value))}
                                className="w-12 text-xs p-1 rounded border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-800 text-center outline-none focus:ring-1 focus:ring-violet-500"
                            />
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Agent A */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-violet-500 uppercase">Agent A</span>
                                <span className="text-[10px] text-slate-400 capitalize">{swarmConfig.agentA}</span>
                            </div>
                            <input 
                                type="text" 
                                value={swarmConfig.roleA}
                                onChange={(e) => onSwarmConfigChange('roleA', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="e.g. Visionary CEO"
                            />
                        </div>

                        {/* Agent B */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-violet-500 uppercase">Agent B</span>
                                <span className="text-[10px] text-slate-400 capitalize">{swarmConfig.agentB}</span>
                            </div>
                            <input 
                                type="text" 
                                value={swarmConfig.roleB}
                                onChange={(e) => onSwarmConfigChange('roleB', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="e.g. Skeptical Engineer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* API KEY INPUTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Keys are stored locally on your device for security.</span>
                </div>
                
                {/* Gemini Input */}
                {(provider === 'gemini' || provider === 'battle' || provider === 'swarm' || (provider === 'refine' && (refineConfig.drafter === 'gemini' || refineConfig.critiquer === 'gemini'))) && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1"><Key size={12} /> Gemini Key</label>{provider === 'gemini' && <button onClick={onFetchModels} disabled={!geminiKey} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-500 hover:underline disabled:opacity-30"><RefreshCw size={10} /> Refresh Models</button>}</div>
                        {isUsingGlobalGemini ? <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400 text-sm font-medium"><Zap size={16} fill="currentColor" /> <span>Connected via App Key (Free)</span></div> : <div className="flex gap-2"><input type="password" value={geminiKey} onChange={(e) => onGeminiKeyChange(e.target.value)} placeholder="Paste Google API Key..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none" />{geminiKey && <button onClick={() => onClearKey('gemini')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}</div>}
                        {provider === 'gemini' && availableModels.length > 0 && <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs outline-none">{availableModels.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>)}</select>}
                    </div>
                )}
                
                {/* OpenAI Input */}
                {(provider === 'openai' || provider === 'battle' || provider === 'swarm' || (provider === 'refine' && (refineConfig.drafter === 'openai' || refineConfig.critiquer === 'openai'))) && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><Key size={12} /> OpenAI Key</label>
                        {isUsingGlobalOpenAI ? <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium"><Zap size={16} fill="currentColor" /> <span>Connected via App Key</span></div> : <div className="flex gap-2"><input type="password" value={openaiKey} onChange={(e) => onOpenaiKeyChange(e.target.value)} placeholder="sk-..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none" />{openaiKey && <button onClick={() => onClearKey('openai')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}</div>}
                    </div>
                )}

                {/* Groq Input - Only show if logged in */}
                {isLoggedIn && (provider === 'groq' || (provider === 'refine' && (refineConfig.drafter === 'groq' || refineConfig.critiquer === 'groq'))) && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-orange-500 flex items-center gap-1"><Key size={12} /> Groq Key (Llama 4)</label>
                        <div className="flex gap-2">
                            <input type="password" value={groqKey || ''} onChange={(e) => onGroqKeyChange(e.target.value)} placeholder="gsk_..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-orange-500 outline-none" />
                            {groqKey && <button onClick={() => onClearKey('groq')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                        </div>
                    </div>
                )}

                {/* Anthropic Input - Only show if logged in */}
                {isLoggedIn && (provider === 'anthropic' || (provider === 'refine' && (refineConfig.drafter === 'anthropic' || refineConfig.critiquer === 'anthropic'))) && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-rose-500 flex items-center gap-1"><Key size={12} /> Anthropic Key (Claude)</label>
                        <div className="flex gap-2">
                            <input type="password" value={anthropicKey || ''} onChange={(e) => onAnthropicKeyChange(e.target.value)} placeholder="sk-ant-..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-rose-500 outline-none" />
                            {anthropicKey && <button onClick={() => onClearKey('anthropic')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestRunnerControls;