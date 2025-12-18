import React from 'react';
import { 
    Key, Zap, Bot, Sparkles, Swords, GitCompare, Layers, MonitorPlay, 
    ArrowRight, Target, ShieldCheck, Users, Activity, Brain, Lock, 
    Plus, X, HelpCircle, Cpu, Info 
} from 'lucide-react';

const TestRunnerControls = ({
    viewMode, provider, geminiKey, openaiKey, groqKey, anthropicKey, 
    refineConfig, swarmConfig, battleConfig, selectedModel, availableModels, 
    isUsingGlobalGemini, isUsingGlobalOpenAI, isLoggedIn, 
    routerReasoning, // <--- New Prop for explanation
    onViewChange, onProviderChange, onGeminiKeyChange, onOpenaiKeyChange, 
    onGroqKeyChange, onAnthropicKeyChange, onClearKey, onFetchModels, onModelChange, 
    onRefineConfigChange, onSwarmConfigChange, onBattleConfigChange, 
    addSwarmAgent, removeSwarmAgent, updateSwarmAgent, setShowHelpModal
}) => {
    
    const renderLockedButton = (label, icon) => (
        <button disabled className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed relative group min-w-[100px]">
            {icon} {label}
            <div className="absolute -top-1 -right-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-white dark:border-slate-700 shadow-sm"><Lock size={10} className="text-slate-400" /></div>
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
            {/* --- VIEW TOGGLE --- */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => onViewChange('simple')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'simple' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
                >
                    <MonitorPlay size={16} /> Choose your AI
                </button>
                {isLoggedIn ? (
                    <button 
                        onClick={() => onViewChange('advanced')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'advanced' ? 'bg-white dark:bg-slate-700 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
                    >
                        <Layers size={16} /> Orchestrator
                    </button>
                ) : (
                    <button 
                        disabled 
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    >
                        <Layers size={16} /> Orchestrator <Lock size={12} />
                    </button>
                )}
            </div>

            {/* --- PROVIDER SELECTION --- */}
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

                        <button 
                            onClick={() => onProviderChange('gemini')} 
                            className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                provider === 'gemini' 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                        >
                            <Sparkles size={16} /> Gemini
                        </button>

                        <button 
                            onClick={() => onProviderChange('openai')} 
                            className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                provider === 'openai' 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                        >
                            <Bot size={16} /> OpenAI
                        </button>

                        {isLoggedIn ? (
                            <>
                                <button 
                                    onClick={() => onProviderChange('groq')} 
                                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        provider === 'groq' ? 'border-orange-500 text-orange-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}
                                >
                                    <Activity size={16}/> Groq
                                </button>
                                <button 
                                    onClick={() => onProviderChange('anthropic')} 
                                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        provider === 'anthropic' ? 'border-rose-500 text-rose-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                    }`}
                                >
                                    <Cpu size={16}/> Claude
                                </button>
                            </>
                        ) : (
                            <>
                                {renderLockedButton("Groq", <Activity size={16} />)}
                                {renderLockedButton("Claude", <Cpu size={16} />)}
                            </>
                        )}
                    </div>

                    {/* NEW: ROUTING EXPLANATION DISPLAY */}
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
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button 
                        onClick={() => onProviderChange('battle')} 
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            provider === 'battle' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                    >
                        <Swords size={16} /> Versus
                    </button>
                    <button 
                        onClick={() => onProviderChange('refine')} 
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            provider === 'refine' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                    >
                        <GitCompare size={16} /> Refine
                    </button>
                    <button 
                        onClick={() => onProviderChange('swarm')} 
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            provider === 'swarm' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                    >
                        <Users size={16} /> Collab
                    </button>
                </div>
            )}
            
            {/* CONFIGS (Battle, Refine, Swarm) */}
            {provider === 'battle' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2 mb-2">
                        <h4 className="text-xs font-bold uppercase text-amber-600 flex items-center gap-2">
                            <Swords size={14} /> Versus Arena
                        </h4>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Fighter 1</label>
                            <select 
                                value={battleConfig?.fighterA} 
                                onChange={(e) => onBattleConfigChange('fighterA', e.target.value)} 
                                className="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 dark:text-white"
                            >
                                {providerOptions}
                            </select>
                        </div>
                        <div className="text-amber-400 font-bold">VS</div>
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Fighter 2</label>
                            <select 
                                value={battleConfig?.fighterB} 
                                onChange={(e) => onBattleConfigChange('fighterB', e.target.value)} 
                                className="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 dark:text-white"
                            >
                                {providerOptions}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {provider === 'refine' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-orange-600 flex items-center gap-2">
                            <Target size={14} /> Critique Focus
                        </h4>
                        <select 
                            value={refineConfig.focus} 
                            onChange={(e) => onRefineConfigChange('focus', e.target.value)} 
                            className="text-xs p-1.5 rounded border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-800 dark:text-white"
                        >
                            <option value="general">General</option>
                            <option value="security">Security</option>
                            <option value="roast">Roast 🔥</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-orange-500 font-bold uppercase block mb-1">Drafter</label>
                            <select 
                                value={refineConfig.drafter} 
                                onChange={(e) => onRefineConfigChange('drafter', e.target.value)} 
                                className="w-full text-xs p-2 rounded-lg border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-800 dark:text-white"
                            >
                                {providerOptions}
                            </select>
                        </div>
                        <ArrowRight size={16} className="text-orange-300 mt-5" />
                        <div className="flex-1">
                            <label className="text-[10px] text-orange-500 font-bold uppercase block mb-1">Critiquer</label>
                            <select 
                                value={refineConfig.critiquer} 
                                onChange={(e) => onRefineConfigChange('critiquer', e.target.value)} 
                                className="w-full text-xs p-2 rounded-lg border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-800 dark:text-white"
                            >
                                {providerOptions}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {provider === 'swarm' && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-violet-200 dark:border-violet-800 pb-2 mb-2">
                        <h4 className="text-xs font-bold uppercase text-violet-600 flex items-center gap-2">
                            <Users size={14} /> Collab Room
                        </h4>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-violet-400">Rounds:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="5" 
                                value={swarmConfig.rounds} 
                                onChange={(e) => onSwarmConfigChange('rounds', parseInt(e.target.value))} 
                                className="w-12 text-xs p-1 rounded border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-800 dark:text-white text-center" 
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {swarmConfig.agents.map((agent, index) => (
                            <div key={agent.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-violet-100 dark:border-violet-700 flex gap-3 items-start relative group">
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
                                        className="w-full text-xs p-2 rounded border border-violet-200 dark:border-violet-700 bg-slate-50 dark:bg-slate-900 dark:text-white" 
                                        placeholder="Role (e.g. Code Auditor)" 
                                    />
                                </div>
                                {swarmConfig.agents.length > 2 && (
                                    <button 
                                        onClick={() => removeSwarmAgent(agent.id)} 
                                        className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <Plus size={14} /> Add Agent
                        </button>
                    )}
                </div>
            )}

            {/* --- KEYS --- */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Keys are stored locally.</span>
                </div>

                {/* Gemini Input */}
                {(provider === 'auto' || provider === 'gemini' || provider === 'battle' || provider === 'swarm' || (provider === 'refine' && (refineConfig.drafter === 'gemini' || refineConfig.critiquer === 'gemini'))) && (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1">
                                <Key size={12}/> Gemini {renderHelpLink()}
                            </label>
                            {provider === 'gemini' && (
                                <button onClick={onFetchModels} disabled={!geminiKey} className="text-[10px] text-slate-400 hover:text-indigo-500 hover:underline disabled:opacity-30">
                                    Refresh Models
                                </button>
                            )}
                        </div>
                        {isUsingGlobalGemini ? (
                            <div className="text-xs p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800">
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

                {/* OpenAI Input */}
                {(provider === 'auto' || provider === 'openai' || provider === 'battle' || provider === 'swarm' || (provider === 'refine' && (refineConfig.drafter === 'openai' || refineConfig.critiquer === 'openai'))) && (
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold uppercase text-emerald-500 flex gap-1">
                            <Key size={12}/> OpenAI {renderHelpLink()}
                        </label>
                        {isUsingGlobalOpenAI ? (
                            <div className="text-xs p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded">
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

                {/* Anthropic Input */}
                {isLoggedIn && (provider === 'auto' || provider === 'anthropic' || (provider === 'refine' && (refineConfig.drafter === 'anthropic' || refineConfig.critiquer === 'anthropic'))) && (
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold uppercase text-rose-500 flex gap-1">
                            <Key size={12}/> Anthropic {renderHelpLink()}
                        </label>
                        <input 
                            type="password" 
                            value={anthropicKey} 
                            onChange={(e) => onAnthropicKeyChange(e.target.value)} 
                            placeholder="sk-ant-..." 
                            className="w-full px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-rose-500" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestRunnerControls;