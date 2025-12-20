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
    // Safety Defaults to prevent White Screen of Death
    keys = {}, setters = {},
    swarmConfig = { agents: [] }, battleConfig = {},
    selectedModel, availableModels = [], // Ensure availableModels is not undefined
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
            {/* TIER 2: PROVIDER SELECTOR */}
            {viewMode === 'simple' ? (
                /* STANDARD MODE */
                <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Select Model</label>
                        <select
                            value={provider}
                            onChange={(e) => onProviderChange(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="gemini">Gemini 2.5 Flash Lite (Default)</option>
                            <option value="openai">GPT-4o (OpenAI)</option>
                            <option value="anthropic">Claude 3.5 Sonnet</option>
                        </select>
                    </div>
                </div>
            ) : (
                /* ADVANCED MODE (CARDS) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in">

                    {/* CARD 1: SMART CHAIN */}
                    <button
                        onClick={() => onProviderChange('smart_chain')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md group ${provider === 'smart_chain'
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded shadow-sm">
                            PREMIUM
                        </div>
                        <div className={`p-2 rounded-lg inline-flex mb-3 ${provider === 'smart_chain' ? 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <Sparkles size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Smart Chain</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                            4-Step MoE Pipeline (Draft → Reason → Filter → Polish)
                        </p>
                    </button>

                    {/* CARD 2: BATTLE MODE */}
                    <button
                        onClick={() => onProviderChange('battle')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md group ${provider === 'battle'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <div className={`p-2 rounded-lg inline-flex mb-3 ${provider === 'battle' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <Swords size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Battle Mode</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                            Compare two models side-by-side.
                        </p>
                    </button>

                    {/* CARD 3: SWARM MODE */}
                    <button
                        onClick={() => onProviderChange('swarm')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md group ${provider === 'swarm'
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <div className={`p-2 rounded-lg inline-flex mb-3 ${provider === 'swarm' ? 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <Users size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Swarm Mode</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                            Multi-Agent Collaboration with dynamic roles.
                        </p>
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

            {/* 2. BOARDROOM STATUS (Swarm Mode) */}
            {provider === 'swarm' && (
                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50 animate-in fade-in flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg text-violet-600 dark:text-violet-300">
                        <Users size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400">The Boardroom is Assembled</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Visionary, Architect, and Critic are ready to collaborate on your prompt.
                        </p>
                    </div>
                </div>
            )}

            {/* 3. API KEY MANAGEMENT (Centralized) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Secure Local Storage</span>
                </div>

                <button
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                >
                    <Key size={12} /> Manage API Keys
                </button>
            </div>
        </div>
    );
};

export default TestRunnerControls;