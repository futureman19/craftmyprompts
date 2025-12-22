import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Edit3 } from 'lucide-react';
import TestRunnerPanel from '../components/test-runner/TestRunnerPanel.jsx';

const HivemindView = ({ user, globalApiKey, globalOpenAIKey }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // 0. Debugging
    console.log("Hivemind received state:", location.state);

    // 1. Auto-Load Prompt from Navigation State
    const incomingPrompt = location.state?.prompt || '';

    // 2. State Initialization (Robust Lazy Loader)
    const [mission, setMission] = useState(() => incomingPrompt);

    // 3. Auto-Start Logic: Only if actual content exists
    const [isStarted, setIsStarted] = useState(() => !!incomingPrompt);

    // 4. Safety Effect (for re-navigation or delay)
    useEffect(() => {
        if (incomingPrompt && mission !== incomingPrompt) {
            console.log("♻️ State re-syncing from navigation...");
            setMission(incomingPrompt);
            setIsStarted(true);
        }
    }, [incomingPrompt]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Back to Builder (Minimize) */}
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                        title="Back to Builder"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                                <Users size={18} />
                            </div>
                            The Hivemind
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* STATE A: INPUT (Only if no prompt provided) */}
                {!isStarted && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-full max-w-2xl space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">What are we building?</h2>
                                <p className="text-sm text-slate-400">Define the mission. The Swarm will handle the rest.</p>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-40 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none text-base dark:text-slate-200 placeholder-slate-400 transition-all"
                                    placeholder="Describe your app..."
                                    value={mission}
                                    onChange={(e) => setMission(e.target.value)}
                                />
                                <button
                                    onClick={() => setIsStarted(true)}
                                    disabled={!mission.trim()}
                                    className="absolute bottom-4 right-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    Start Build
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATE B: EXECUTION (Runner) */}
                {isStarted && (
                    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom-10 duration-500 min-h-0">
                        {/* Context Bar */}
                        <div className="px-6 py-2 bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-bold text-violet-500 shrink-0">Mission:</span>
                                <span className="truncate max-w-md italic">"{mission}"</span>
                            </div>
                            <button
                                onClick={() => { setIsStarted(false); navigate('/'); }}
                                className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                <Edit3 size={12} /> Refine Prompt
                            </button>
                        </div>

                        {/* The Runner (Scroll Handling) */}
                        <div className="flex-1 overflow-hidden relative">
                            <TestRunnerPanel
                                prompt={mission}
                                defaultApiKey={globalApiKey}
                                defaultOpenAIKey={globalOpenAIKey}
                                isSocialMode={false}
                                activeCategory="code"
                                autoRun={true}
                                initialProvider="swarm" // <--- CRITICAL FIX: Forces Swarm Mode
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HivemindView;
