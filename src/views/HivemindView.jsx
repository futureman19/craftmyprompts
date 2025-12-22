import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Edit3 } from 'lucide-react';
import { useHivemind } from '../hooks/useHivemind.js'; // <--- IMPORTING THE NEW BRAIN
import TestRunnerResults from '../components/test-runner/TestRunnerResults.jsx';
import ApiKeyHelpModal from '../components/test-runner/ApiKeyHelpModal.jsx';

const HivemindView = ({ user, globalApiKey, globalOpenAIKey }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const incomingPrompt = location.state?.prompt || '';

    // 1. Initialize the DEDICATED Hivemind Brain
    const hivemind = useHivemind({
        openai: globalOpenAIKey,
        gemini: globalApiKey,
        anthropic: localStorage.getItem('anthropic_key'),
        groq: localStorage.getItem('groq_key')
    });

    // 2. Auto-Start Logic (Run Once)
    const hasStarted = useRef(false);

    useEffect(() => {
        // If we have a prompt and haven't started yet...
        if (incomingPrompt && !hasStarted.current) {
            hasStarted.current = true;
            console.log("🚀 Hivemind Protocol Initiated:", incomingPrompt);

            // Trigger the Mission using the new hook
            hivemind.startMission(incomingPrompt);
        }
    }, [incomingPrompt]);

    // 3. Navigation Back
    const handleBack = () => {
        navigate('/', { state: { prompt: incomingPrompt, category: 'code' } });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">

            {/* --- HEADER --- */}
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-fuchsia-500"><Users size={20} /></span>
                            Hivemind Command Center
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Operational Mode: Coding Squad
                        </p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-slate-400">
                        {hivemind.loading ? (
                            <span className="flex items-center gap-2 text-amber-400">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                                {hivemind.statusMessage || "Agents thinking..."}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                Systems Ready
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MAIN FEED (The Storyline) --- */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-4xl mx-auto space-y-8 pb-32">

                    {/* Mission Card */}
                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Current Mission</h3>
                        <p className="text-lg text-slate-100 font-medium italic">"{incomingPrompt}"</p>
                    </div>

                    {/* Agent Outputs */}
                    <TestRunnerResults
                        loading={hivemind.loading}
                        result={null}
                        provider="swarm" // Force swarm rendering style
                        swarmHistory={hivemind.history} // Use history from new hook

                        // Pass handlers from new hook
                        onLoopBack={hivemind.refineLoop}
                        onSynthesize={hivemind.compileBuild}

                        // Pass State
                        statusMessage={hivemind.statusMessage}
                        error={hivemind.error}
                    />
                </div>
            </div>

            {/* --- COMMAND DECK (Footer) --- */}
            {/* Only show when not loading and we have history */}
            {!hivemind.loading && hivemind.history.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl flex gap-2 ring-1 ring-white/10">

                        {/* Refine Input */}
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-3 text-slate-500">
                                <Edit3 size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Give feedback to refine the blueprint..."
                                className="w-full h-full bg-slate-950/50 rounded-xl pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 border border-transparent focus:border-fuchsia-500/50 transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                        hivemind.refineLoop(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>

                        {/* Compile Button */}
                        <button
                            onClick={hivemind.compileBuild}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Zap size={16} /> Compile Build
                        </button>
                    </div>
                </div>
            )}

            {/* API Key Modal (Reused) */}
            <ApiKeyHelpModal
                isOpen={false} // Managed by global state or profile if needed
                onClose={() => { }}
            />
        </div>
    );
};

export default HivemindView;
