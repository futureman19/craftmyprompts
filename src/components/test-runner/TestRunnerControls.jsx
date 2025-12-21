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

    // Determine active tab based on viewMode and provider
    let activeTab = 'standard';
    if (viewMode === 'simple') activeTab = 'standard';
    else if (provider === 'smart_chain') activeTab = 'chain';
    else if (provider === 'battle') activeTab = 'arena';
    else if (provider === 'swarm') activeTab = 'swarm';

    const handleModeSelect = (modeId) => {
        if (modeId === 'standard') {
            onViewChange('simple');
            onProviderChange('gemini');
        } else if (modeId === 'chain') {
            onViewChange('advanced');
            onProviderChange('smart_chain');
        } else if (modeId === 'arena') {
            onViewChange('advanced');
            onProviderChange('battle');
        } else if (modeId === 'swarm') {
            onViewChange('advanced');
            onProviderChange('swarm');
        }
    };

    const MODES = [
        { id: 'standard', label: 'Test with AI', icon: <Bot size={16} />, color: 'text-indigo-500' },
        { id: 'chain', label: 'Smart Prompt', icon: <Sparkles size={16} />, color: 'text-amber-500', premium: true },
        { id: 'arena', label: 'Arena Mode', icon: <Swords size={16} />, color: 'text-rose-500', premium: true },
        { id: 'swarm', label: 'Hivemind', icon: <Users size={16} />, color: 'text-violet-500', premium: true },
    ];

    return (
        <div className="space-y-4">
            {/* UNIFIED MODE SELECTOR (Standard Tabs) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl overflow-x-auto no-scrollbar gap-2">
                {MODES.map(mode => {
                    const isActive = activeTab === mode.id;
                    const isLocked = mode.premium && !isLoggedIn;

                    if (isLocked) {
                        return (
                            <button
                                key={mode.id}
                                disabled
                                className="flex-1 min-w-[100px] py-1.5 px-3 rounded-lg text-sm font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70 flex items-center justify-center gap-2 bg-transparent"
                            >
                                {mode.icon}
                                {mode.label}
                                <Lock size={12} className="opacity-50" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={mode.id}
                            onClick={() => handleModeSelect(mode.id)}
                            className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isActive
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100 ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <span className={isActive ? mode.color : ''}>{mode.icon}</span>
                            <span>{mode.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* CONTROLS AREA */}
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">

                {/* 1. TEST WITH AI (Standard) */}
                {activeTab === 'standard' && (
                    <div className="space-y-2">
                        <select
                            value={provider}
                            onChange={(e) => onProviderChange(e.target.value)}
                            className="w-full p-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="gemini">Gemini 2.5 Flash Lite (Default)</option>
                            <option value="openai">GPT-4o (OpenAI)</option>
                            <option value="anthropic">Claude 3.5 Sonnet</option>
                            <option value="groq">Llama 3 (Groq)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 px-1">
                            Direct Access. Single model execution for quick tasks.
                        </p>
                    </div>
                )}

                {/* 2. SMART PROMPT (Smart Chain) */}
                {activeTab === 'chain' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-800 rounded-md text-amber-600 dark:text-amber-300">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">MoE Pipeline Active</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                                4 Stages: Drafting, Reasoning, Filtering, Polishing.
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. BATTLE MODE */}
                {activeTab === 'arena' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-200 dark:border-rose-800/50 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <select
                                    value={battleConfig?.fighterA || 'gemini'}
                                    onChange={(e) => onBattleConfigChange('fighterA', e.target.value)}
                                    className="w-full text-[10px] p-1.5 rounded-md border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 outline-none"
                                >
                                    <option value="gemini">Gemini</option>
                                    <option value="openai">GPT-4o</option>
                                    <option value="anthropic">Claude</option>
                                </select>
                            </div>
                            <span className="text-rose-400 font-bold font-mono text-xs">VS</span>
                            <div className="flex-1">
                                <select
                                    value={battleConfig?.fighterB || 'openai'}
                                    onChange={(e) => onBattleConfigChange('fighterB', e.target.value)}
                                    className="w-full text-[10px] p-1.5 rounded-md border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 outline-none"
                                >
                                    <option value="gemini">Gemini</option>
                                    <option value="openai">GPT-4o</option>
                                    <option value="anthropic">Claude</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                            Compare output quality side-by-side.
                        </p>
                    </div>
                )}

                {/* 4. HIVEMIND (Swarm) */}
                {activeTab === 'swarm' && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 space-y-2">
                        {/* SQUAD SELECTOR */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-slate-400">Select Squad</label>
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                                {[
                                    { id: 'code', label: 'Tech', icon: <Terminal size={12} /> },
                                    { id: 'text', label: 'Creative', icon: <Sparkles size={12} /> },
                                    { id: 'data', label: 'Data', icon: <Bot size={12} /> }
                                ].map((squad) => (
                                    <button
                                        key={squad.id}
                                        onClick={() => onSwarmCategoryChange(squad.id)}
                                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${swarmCategory === squad.id
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {squad.icon}
                                        {squad.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* 3. API KEY MANAGEMENT (Compact) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span>Secure Local Storage</span>
                </div>
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                    <Key size={10} /> Keys
                </button>
            </div>
        </div>
    );
};

export default TestRunnerControls;