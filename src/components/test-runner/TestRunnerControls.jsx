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

    // helper to set mode
    const handleModeSelect = (modeId) => {
        if (modeId === 'simple') {
            onViewChange('simple');
            onProviderChange('gemini'); // Default to gemini
        } else if (modeId === 'smart_chain') {
            onViewChange('advanced');
            onProviderChange('smart_chain');
        } else if (modeId === 'battle') {
            onViewChange('advanced');
            onProviderChange('battle');
        } else if (modeId === 'swarm') {
            onViewChange('advanced');
            onProviderChange('swarm');
        }
    };

    // Determine active tab based on viewMode and provider
    let activeTab = 'simple';
    if (viewMode === 'advanced') {
        if (provider === 'smart_chain') activeTab = 'smart_chain';
        else if (provider === 'battle') activeTab = 'battle';
        else if (provider === 'swarm') activeTab = 'swarm';
    }

    const MODES = [
        { id: 'simple', label: 'Test with AI', icon: <Bot size={14} />, color: 'text-indigo-500' },
        { id: 'smart_chain', label: 'Smart Prompt', icon: <Sparkles size={14} />, color: 'text-amber-500', premium: true },
        { id: 'battle', label: 'Arena Mode', icon: <Swords size={14} />, color: 'text-rose-500', premium: true },
        { id: 'swarm', label: 'Hivemind', icon: <Users size={14} />, color: 'text-violet-500', premium: true },
    ];

    return (
        <div className="space-y-6">

            {/* UNIFIED MODE SELECTOR (Tabs) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {MODES.map(mode => {
                    const isActive = activeTab === mode.id;
                    const isLocked = mode.premium && !isLoggedIn;

                    if (isLocked) {
                        return (
                            <button
                                key={mode.id}
                                disabled
                                className="flex-1 min-w-[100px] flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-70 relative group"
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    {mode.icon}
                                    <span>{mode.label}</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider opacity-60 flex items-center gap-1">
                                    <Lock size={8} /> Pro
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={mode.id}
                            onClick={() => handleModeSelect(mode.id)}
                            className={`flex-1 min-w-[100px] flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${isActive
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100 ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className={`flex items-center gap-1.5 mb-0.5 ${isActive ? mode.color : ''}`}>
                                {mode.icon}
                                <span>{mode.label}</span>
                            </div>
                            {/* <span className="text-[9px] uppercase tracking-wider opacity-60">
                                {mode.sub || 'Active'}
                            </span> */}
                        </button>
                    );
                })}
            </div>

            {/* CONTROLS AREA */}
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">

                {/* 1. TEST WITH AI (Standard) */}
                {activeTab === 'simple' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                            <span>Select Model</span>
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            Direct Access. Single model execution for quick tasks.
                        </p>
                        <select
                            value={provider}
                            onChange={(e) => onProviderChange(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="gemini">Gemini 2.5 Flash Lite (Default)</option>
                            <option value="openai">GPT-4o (OpenAI)</option>
                            <option value="anthropic">Claude 3.5 Sonnet</option>
                            <option value="groq">Llama 3 (Groq)</option>
                        </select>
                    </div>
                )}

                {/* 2. SMART PROMPT (Smart Chain) */}
                {activeTab === 'smart_chain' && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg text-amber-600 dark:text-amber-300">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">MoE Pipeline Active</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Your prompt will flow through 4 specialized stages: drafting (Gemini), reasoning (GPT-4), filtering (Llama), and polishing (Claude).
                            </p>
                        </div>
                    </div>
                )}

                {/* 3. BATTLE MODE */}
                {activeTab === 'battle' && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800/50 space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800 pb-2 mb-2">
                            <h4 className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <Swords size={14} /> Arena Configuration
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Model Battle. Compare output quality across multiple AIs side-by-side.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <select
                                    value={battleConfig?.fighterA || 'gemini'}
                                    onChange={(e) => onBattleConfigChange('fighterA', e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 outline-none"
                                >
                                    <option value="gemini">Gemini</option>
                                    <option value="openai">GPT-4o</option>
                                    <option value="anthropic">Claude</option>
                                </select>
                            </div>
                            <span className="text-rose-400 font-bold font-mono">VS</span>
                            <div className="flex-1">
                                <select
                                    value={battleConfig?.fighterB || 'openai'}
                                    onChange={(e) => onBattleConfigChange('fighterB', e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 outline-none"
                                >
                                    <option value="gemini">Gemini</option>
                                    <option value="openai">GPT-4o</option>
                                    <option value="anthropic">Claude</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. HIVEMIND (Swarm) */}
                {activeTab === 'swarm' && (
                    <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800/50 flex items-center gap-4">
                        <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg text-violet-600 dark:text-violet-300">
                            <Users size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">The Hivemind is Listening</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Cognitive Swarm. A specialized team of agents collaborates on complex problems.
                            </p>
                        </div>
                    </div>
                )}

            </div>

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