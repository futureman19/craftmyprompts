import React, { useState } from 'react';
import { Users, Zap, Play, Layers } from 'lucide-react';
import TestRunnerPanel from '../components/test-runner/TestRunnerPanel.jsx';

const HivemindView = ({ user, globalApiKey, globalOpenAIKey }) => {
    // Local state for the "Mission" since we aren't in the Builder
    const [mission, setMission] = useState('');
    const [isStarted, setIsStarted] = useState(false);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <Users size={24} />
                        </div>
                        The Hivemind
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Multi-Agent Autonomous Swarm • Narrative Execution Engine
                    </p>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* 1. INPUT STAGE (Visible only before start) */}
                {!isStarted && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-full max-w-2xl space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">What is the mission?</h2>
                                <p className="text-sm text-slate-400">Define the objective for the Swarm. The Visionary will take it from there.</p>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-40 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none text-base dark:text-slate-200 placeholder-slate-400 transition-all"
                                    placeholder="e.g. Create a fully functional Snake game in Python with a start menu and high score tracking..."
                                    value={mission}
                                    onChange={(e) => setMission(e.target.value)}
                                />
                                <button
                                    onClick={() => setIsStarted(true)}
                                    disabled={!mission.trim()}
                                    className="absolute bottom-4 right-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    <Zap size={18} /> Initialize Swarm
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <strong className="block text-slate-600 dark:text-slate-300 mb-1">1. Vision</strong>
                                    Strategic Planning
                                </div>
                                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <strong className="block text-slate-600 dark:text-slate-300 mb-1">2. Architecture</strong>
                                    Blueprint & Specs
                                </div>
                                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <strong className="block text-slate-600 dark:text-slate-300 mb-1">3. Execution</strong>
                                    Code & Synthesis
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. EXECUTION STAGE (Full Screen Runner) */}
                {isStarted && (
                    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom-10 duration-500">
                        {/* Toolbar */}
                        <div className="px-6 py-2 bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-violet-500">Active Mission:</span>
                                <span className="truncate max-w-md">"{mission}"</span>
                            </div>
                            <button onClick={() => setIsStarted(false)} className="hover:text-slate-800 dark:hover:text-slate-200 underline">
                                New Mission
                            </button>
                        </div>

                        {/* The Runner */}
                        <div className="flex-1 overflow-hidden">
                            <TestRunnerPanel
                                prompt={mission}
                                defaultApiKey={globalApiKey}
                                defaultOpenAIKey={globalOpenAIKey}
                                isSocialMode={false} // Hivemind logic handles squad detection internally or defaults to Tech
                                activeCategory="code" // Defaulting to code/tech squad for the main Hivemind view
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HivemindView;
