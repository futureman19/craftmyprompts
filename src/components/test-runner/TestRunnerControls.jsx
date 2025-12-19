import React from 'react';
import { 
    Key, Zap, Bot, Sparkles, Swords, Layers, MonitorPlay, 
    ShieldCheck, Users, Activity, Brain, Lock, 
    Plus, X, HelpCircle, Cpu, Info 
} from 'lucide-react';

const TestRunnerControls = ({
    // State
    viewMode, provider, 
    geminiKey, openaiKey, groqKey, anthropicKey, 
    swarmConfig, battleConfig, selectedModel, availableModels, 
    isUsingGlobalGemini, isUsingGlobalOpenAI, isLoggedIn, 
    // Router State
    routerReasoning, 
    // Actions
    onViewChange, onProviderChange, 
    onGeminiKeyChange, onOpenaiKeyChange, onGroqKeyChange, onAnthropicKeyChange, 
    onClearKey, onFetchModels, onModelChange, 
    onSwarmConfigChange, onBattleConfigChange, 
    // Handlers
    addSwarmAgent, removeSwarmAgent, updateSwarmAgent, setShowHelpModal
}) => {
    
    const renderLockedButton = (label, icon) => (
        <button disabled className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed relative group min-w-[100px]">
            {icon} {label}
            <div className="absolute -top-1 -right-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-white dark:border-slate-700 shadow-sm">
                <Lock size={10} className="text-slate-400" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Login to unlock
            </div>
        </button>
    );

    const renderHelpLink = () => (
        <button 
            onClick={() => setShowHelpModal(true)} 
            className="text-[10px] flex items-center gap-1 text-indigo-500 hover:text-indigo-600 hover:underline transition-colors"
        >
            <HelpCircle size={10} /> Get Key
        </button>
    );

    const providerOptions = (
        <>
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="groq">Groq</option>
            <option value="anthropic">Anthropic</option>
        </>
    );

    return (
        <div className="space-y-6">
            
            {/* TIER 1: VIEW MODE SELECTOR */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => onViewChange('simple')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <MonitorPlay size={16} /> Choose your AI
                </button>
                
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
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
                        
                        {/* SMART AUTO ROUTER BUTTON */}
                        <button 
                            onClick={() => onProviderChange('auto')} 
                            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                provider === 'auto' 
                                ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-fuchsia-300'
                            }`}
                            title="Automatically choose the best model for the task"
                        >
                            <Brain size={16} className={provider === 'auto' ? 'animate-pulse' : ''} /> Auto
                        </button>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0" />

                        <button onClick={() => onProviderChange('gemini')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'gemini' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                            <Sparkles size={16} /> Gemini
                        </button>
                        <button onClick={() => onProviderChange('openai')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'openai' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                            <Bot size={16} /> OpenAI
                        </button>

                        {isLoggedIn ? (
                            <>
                                <button onClick={() => onProviderChange('groq')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'groq' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                                    <Activity size={16} /> Groq
                                </button>
                                <button onClick={() => onProviderChange('anthropic')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${provider === 'anthropic' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'}`}>
                                    <Cpu size={16} /> Claude
                                </button>
                            </>
                        ) : (
                            <>
                                {renderLockedButton("Groq", <Activity size={16} />)}
                                {renderLockedButton("Claude", <Cpu size={16} />)}
                            </>
                        )}
                    </div>

                    {/* ROUTING EXPLANATION DISPLAY */}
                    {provider === 'auto' && routerReasoning && (
                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-100 dark:border-fuchsia-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="p-1 bg-fuchsia-500 rounded text-white shadow-sm">
                                    <Brain size={12} className="animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">
                                    Meta-Agent Decision
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Info size={14} className="text-fuchsia-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    {routerReasoning}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Advanced Modes (Refine Removed) */
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button 
                        onClick={() => onProviderChange('battle')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${
                            provider === 'battle' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'
                        }`}
                    >
                        <Swords size={16} /> Versus
                    </button>
                    
                    <button 
                        onClick={() => onProviderChange('swarm')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-bold whitespace-nowrap ${
                            provider === 'swarm' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500'
                        }`}
                    >
                        <Users size={16} /> Collab
                    </button>
                </div>
            )}
            
            {/* CONFIGURATION PANELS */}

            {/* 1. VERSUS CONFIG */}
            {provider === 'battle' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2 mb-2">
                         <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <Swords size={14} /> Versus Arena
                         </h4>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Fighter 1</label>
                            <select 
                                value={battleConfig?.fighterA || 'gemini'}
                                onChange={(e) => onBattleConfigChange('fighterA', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                {providerOptions}
                            </select>
                        </div>
                        <div className="text-amber-400 font-bold text-lg mt-4">VS</div>
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Fighter 2</label>
                            <select 
                                value={battleConfig?.fighterB || 'openai'}
                                onChange={(e) => onBattleConfigChange('fighterB', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                {providerOptions}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. COLLAB CONFIG (DYNAMIC AGENTS) */}
            {provider === 'swarm' && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50 animate-in fade-in space-y-4">
                    <div className="flex items-center justify-between border-b border-violet-200 dark:border-violet-800 pb-2 mb-2">
                         <h4 className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400 flex items-center gap-2">
                            <Users size={14} /> Collab Room
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
                    
                    {/* DYNAMIC AGENT LIST */}
                    <div className="space-y-3">
                        {swarmConfig.agents.map((agent, index) => (
                            <div key={agent.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-800 flex gap-3 items-start relative group">
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-violet-500 uppercase">Agent {index + 1}</span>
                                        <select 
                                            value={agent.provider}
                                            onChange={(e) => updateSwarmAgent(agent.id, 'provider', e.target.value)}
                                            className="text-[10px] text-slate-500 bg-transparent outline-none text-right dark:text-slate-400"
                                        >
                                            {providerOptions}
                                        </select>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={agent.role}
                                        onChange={(e) => updateSwarmAgent(agent.id, 'role', e.target.value)}
                                        className="w-full text-xs p-2 rounded border border-violet-200 dark:border-violet-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500"
                                        placeholder="Agent Role (e.g. CEO)"
                                    />
                                </div>
                                {swarmConfig.agents.length > 2 && (
                                    <button 
                                        onClick={() => removeSwarmAgent(agent.id)}
                                        className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Agent"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {swarmConfig.agents.length < 4 && (
                        <button 
                            onClick={addSwarmAgent}
                            className="w-full py-2 border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-lg text-xs font-bold text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={14} /> Add Another Agent
                        </button>
                    )}
                </div>
            )}

            {/* API KEY INPUTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Keys are stored locally on your device for security.</span>
                </div>
                
                {/* Gemini Input (Show if Auto OR Gemini) */}
                {(provider === 'auto' || provider === 'gemini' || provider === 'battle' || provider === 'swarm') && (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1">
                                <Key size={12} /> Gemini {renderHelpLink()}
                            </label>
                            {provider === 'gemini' && (
                                <button onClick={onFetchModels} disabled={!geminiKey} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-500 hover:underline disabled:opacity-30">
                                    Refresh Models
                                </button>
                            )}
                        </div>
                        {isUsingGlobalGemini ? (
                            <div className="text-xs p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400 text-sm font-medium">
                                System Key Active
                            </div>
                        ) : (
                            <input 
                                type="password" 
                                value={geminiKey} 
                                onChange={(e) => onGeminiKeyChange(e.target.value)} 
                                placeholder="API Key..." 
                                className="w-full px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-indigo-500" 
                            />
                        )}
                        {provider === 'gemini' && availableModels.length > 0 && (
                            <select 
                                value={selectedModel} 
                                onChange={(e) => onModelChange(e.target.value)} 
                                className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                            >
                                {availableModels.map(m => (
                                    <option key={m.name} value={m.name}>{m.displayName || m.name.split('/').pop()}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
                
                {/* OpenAI Input (Show if Auto OR OpenAI) */}
                {(provider === 'auto' || provider === 'openai' || provider === 'battle' || provider === 'swarm') && (
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1">
                            <Key size={12} /> OpenAI {renderHelpLink()}
                        </label>
                        {isUsingGlobalOpenAI ? (
                            <div className="text-xs p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                System Key Active
                            </div>
                        ) : (
                            <input 
                                type="password" 
                                value={openaiKey} 
                                onChange={(e) => onOpenaiKeyChange(e.target.value)} 
                                placeholder="sk-..." 
                                className="w-full px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500" 
                            />
                        )}
                    </div>
                )}

                {/* Groq Input (Show if Auto OR Groq) */}
                {isLoggedIn && (provider === 'auto' || provider === 'groq' || provider === 'swarm' || (provider === 'battle' && (battleConfig?.fighterA === 'groq' || battleConfig?.fighterB === 'groq'))) && (
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold uppercase text-orange-500 flex items-center gap-1">
                            <Key size={12} /> Groq Key (Llama 4) {renderHelpLink()}
                        </label>
                        {/* Groq Key Input logic - removed 'isUsingGlobal' check here as it wasn't fully implemented in the hook yet, keeping manual entry */}
                        <div className="flex gap-2">
                            <input type="password" value={groqKey || ''} onChange={(e) => onGroqKeyChange(e.target.value)} placeholder="gsk_..." className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-orange-500 outline-none" />
                            {groqKey && <button onClick={() => onClearKey('groq')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                        </div>
                    </div>
                )}

                {/* Anthropic Input (Show if Auto OR Anthropic) */}
                {isLoggedIn && (provider === 'auto' || provider === 'anthropic' || provider === 'swarm' || (provider === 'battle' && (battleConfig?.fighterA === 'anthropic' || battleConfig?.fighterB === 'anthropic'))) && (
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold uppercase text-rose-500 flex items-center gap-1">
                            <Key size={12} /> Anthropic Key (Claude) {renderHelpLink()}
                        </label>
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