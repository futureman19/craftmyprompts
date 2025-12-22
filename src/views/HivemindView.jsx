import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Edit3 } from 'lucide-react';
import { useHivemind } from '../hooks/useHivemind.js'; // <--- IMPORTING THE NEW BRAIN
import ApiKeyHelpModal from '../components/test-runner/ApiKeyHelpModal.jsx';
import HivemindFeed from '../components/hivemind/HivemindFeed.jsx';
import ManagerDrawer from '../components/hivemind/ManagerDrawer.jsx';

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

                    {/* MAIN CONTENT AREA */}
                    <div className="relative">
                        <HivemindFeed
                            history={hivemind.history}
                            loading={hivemind.loading}
                            statusMessage={hivemind.statusMessage}
                            currentPhase={hivemind.currentPhase} // Pass phase!
                            githubToken={hivemind.githubToken} // <--- PASS TOKEN
                            actions={{
                                submitChoices: hivemind.submitChoices,
                                submitSpecs: hivemind.submitSpecs,
                                sendToAudit: hivemind.sendToAudit,
                                compileBuild: hivemind.compileBuild,
                                saveGithubToken: hivemind.saveGithubToken, // <--- PASS SAVE
                                deployToGithub: hivemind.deployToGithub  // <--- PASS DEPLOY
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* --- COMMAND DECK (Footer) --- */}
            {/* Only show when not loading and we have history */}
            {!hivemind.loading && hivemind.history.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto flex justify-end gap-2 pointer-events-auto">

                        {/* Manager Trigger */}
                        <button
                            onClick={() => hivemind.setIsDrawerOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Users size={16} /> Consult Manager
                        </button>

                        {/* Compile Button */}
                        <button
                            onClick={hivemind.compileBuild}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Zap size={16} /> Compile Build
                        </button>
                    </div>
                </div>
            )}

            {/* --- MANAGER DRAWER --- */}
            <ManagerDrawer
                isOpen={hivemind.isDrawerOpen}
                onClose={() => hivemind.setIsDrawerOpen(false)}
                messages={hivemind.managerMessages}
                onSendMessage={hivemind.handleManagerFeedback}
                loading={hivemind.loading}
            />

            {/* API Key Modal (Reused) */}
            <ApiKeyHelpModal
                isOpen={false} // Managed by global state or profile if needed
                onClose={() => { }}
            />
        </div>
    );
};

export default HivemindView;
