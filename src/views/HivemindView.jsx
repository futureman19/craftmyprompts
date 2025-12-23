import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Edit3, MessageSquare, Code2, Palette } from 'lucide-react';

// --- HIVEMIND ENGINES ---
import { useCodingHive } from '../hooks/hives/useCodingHive.js';
import CodingFeed from '../components/hives/CodingFeed.jsx';

import { useTextHive } from '../hooks/hives/useTextHive.js';
import TextFeed from '../components/hives/TextFeed.jsx';

import ApiKeyHelpModal from '../components/test-runner/ApiKeyHelpModal.jsx';
import ManagerDrawer from '../components/hivemind/ManagerDrawer.jsx';

// --- ENGINE WRAPPERS ---
// These ensure the hook is initialized *inside* the view lifecycle

const CodingEngineWrapper = ({ prompt, keys }) => {
    const hivemind = useCodingHive(keys);

    // Auto-start on mount
    useEffect(() => {
        if (prompt && hivemind.currentPhase === 'idle') {
            hivemind.startMission(prompt);
        }
    }, [prompt]);

    return (
        <React.Fragment>
            <CodingFeed
                history={hivemind.history}
                loading={hivemind.loading}
                statusMessage={hivemind.statusMessage}
                currentPhase={hivemind.currentPhase}
                githubToken={hivemind.githubToken}
                actions={{
                    submitChoices: hivemind.submitChoices,
                    submitSpecs: hivemind.submitSpecs,
                    sendToAudit: hivemind.sendToAudit,
                    compileBuild: hivemind.compileBuild,
                    saveGithubToken: hivemind.saveGithubToken,
                    deployToGithub: hivemind.deployToGithub
                }}
            />
            {/* Command DECK (Footer) */}
            {!hivemind.loading && hivemind.history.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto flex justify-end gap-2 pointer-events-auto">
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
            {/* MISSION CONTROL BAR */}
            {!hivemind.isDrawerOpen && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 animate-in slide-in-from-bottom-10">
                    <button
                        onClick={() => hivemind.setIsDrawerOpen(true)}
                        className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 text-slate-300 hover:text-white px-6 py-3 rounded-full shadow-2xl shadow-black/50 hover:shadow-indigo-500/20 hover:border-indigo-500/60 transition-all group flex items-center gap-3 active:scale-95"
                    >
                        <div className="relative">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping absolute opacity-75"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full relative"></div>
                        </div>
                        <span className="text-sm font-medium tracking-wide">Swarm Command</span>
                        <span className="text-xs text-slate-500 border-l border-slate-700 pl-3 group-hover:text-indigo-300 transition-colors">Type to interrupt...</span>
                    </button>
                </div>
            )}
        </React.Fragment>
    );
};

const TextEngineWrapper = ({ prompt, keys }) => {
    const hivemind = useTextHive(keys);

    // Auto-start on mount
    useEffect(() => {
        if (prompt && hivemind.currentPhase === 'idle') {
            hivemind.startMission(prompt);
        }
    }, [prompt]);

    return (
        <React.Fragment>
            <TextFeed
                history={hivemind.history}
                loading={hivemind.loading}
                statusMessage={hivemind.statusMessage}
                currentPhase={hivemind.currentPhase}
                actions={{
                    submitChoices: hivemind.submitChoices,
                    submitSpecs: hivemind.submitSpecs,
                    sendToAudit: hivemind.sendToAudit,
                    compileBuild: hivemind.compileBuild
                }}
            />
            {/* Command DECK (Footer) */}
            {!hivemind.loading && hivemind.history.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto flex justify-end gap-2 pointer-events-auto">
                        <button
                            onClick={hivemind.compileBuild}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Zap size={16} /> Finalize
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
            {/* MISSION CONTROL BAR */}
            {!hivemind.isDrawerOpen && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 animate-in slide-in-from-bottom-10">
                    <button
                        onClick={() => hivemind.setIsDrawerOpen(true)}
                        className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 text-slate-300 hover:text-white px-6 py-3 rounded-full shadow-2xl shadow-black/50 hover:shadow-indigo-500/20 hover:border-indigo-500/60 transition-all group flex items-center gap-3 active:scale-95"
                    >
                        <div className="relative">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping absolute opacity-75"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full relative"></div>
                        </div>
                        <span className="text-sm font-medium tracking-wide">Swarm Command</span>
                        <span className="text-xs text-slate-500 border-l border-slate-700 pl-3 group-hover:text-indigo-300 transition-colors">Type to interrupt...</span>
                    </button>
                </div>
            )}
        </React.Fragment>
    );
};

const HivemindView = ({ user, globalApiKey, globalOpenAIKey }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const incomingPrompt = location.state?.prompt || '';
    const incomingMode = location.state?.mode || location.state?.category || 'coding';

    // Helper for Mode Labels
    const getModeLabel = (m) => {
        const labels = {
            coding: 'Coding Squad',
            art: 'Art Studio',
            text: 'Editorial Room',
            video: 'Production Set'
        };
        return labels[m] || 'Coding Squad';
    };

    // Keys object to pass down
    const keys = {
        openai: globalOpenAIKey,
        gemini: globalApiKey,
        anthropic: localStorage.getItem('anthropic_key'),
        groq: localStorage.getItem('groq_key')
    };

    // 3. Navigation Back
    const handleBack = () => {
        navigate('/', { state: { prompt: incomingPrompt, category: 'code' } });
    };

    // --- ROUTER ---
    const renderActiveHive = () => {
        // NOTE: Art/Video fallback to Coding for now until their engines are built
        if (incomingMode === 'text') {
            return <TextEngineWrapper prompt={incomingPrompt} keys={keys} />;
        }
        // Default to Coding
        return <CodingEngineWrapper prompt={incomingPrompt} keys={keys} />;
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
                            Operational Mode: {getModeLabel(incomingMode)}
                        </p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                    {/* Status is now handled inside Feed/Wrapper, or we could lift it up, 
                             but for cleaner separation, we leave the detailed status in the feed 
                             and maybe put a global "Engine Active" here? */}
                    <span className="flex items-center gap-2 text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        Engine Active
                    </span>
                </div>
            </div>

            {/* --- MAIN FEED (The Storyline) --- */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                {/* 
                     Logic Change: We basically always render the engine if there is a prompt.
                     If no prompt (idle state navigation), show the selector.
                 */}
                {!incomingPrompt ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8 text-center">
                            Select Your Mission
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
                            {/* CODING MISSION */}
                            <button
                                onClick={() => {
                                    const prompt = window.prompt("What app would you like to build?");
                                    // Use navigate instead of hivemind.startMission to trigger reload/router
                                    if (prompt) navigate('.', { state: { prompt, mode: 'coding' } });
                                }}
                                className="group relative p-8 bg-slate-900 border border-indigo-500/30 rounded-2xl hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/20 text-left overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 group-hover:h-2 transition-all" />
                                <div className="mb-4 p-4 bg-indigo-500/10 rounded-full w-fit text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Code2 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Software Engineer</h3>
                                <p className="text-slate-400 text-sm">Build React apps, tools, and utilities. The Hivemind generates full file structures and code.</p>
                            </button>

                            {/* ART MISSION */}
                            <button
                                onClick={() => {
                                    const prompt = window.prompt("What image do you want to create?");
                                    if (prompt) navigate('.', { state: { prompt, mode: 'art' } });
                                }}
                                className="group relative p-8 bg-slate-900 border border-fuchsia-500/30 rounded-2xl hover:border-fuchsia-500 transition-all hover:shadow-2xl hover:shadow-fuchsia-500/20 text-left overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 group-hover:h-2 transition-all" />
                                <div className="mb-4 p-4 bg-fuchsia-500/10 rounded-full w-fit text-fuchsia-400 group-hover:scale-110 transition-transform">
                                    <Palette size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Art Director</h3>
                                <p className="text-slate-400 text-sm">Craft ultra-photorealistic prompts. The Hivemind defines lighting, camera, and style.</p>
                            </button>

                            {/* TEXT MISSION */}
                            <button
                                onClick={() => {
                                    const prompt = window.prompt("What content do you need to write?");
                                    if (prompt) navigate('.', { state: { prompt, mode: 'text' } });
                                }}
                                className="group relative p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl hover:border-emerald-500 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 text-left overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 group-hover:h-2 transition-all" />
                                <div className="mb-4 p-4 bg-emerald-500/10 rounded-full w-fit text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Edit3 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Editor-in-Chief</h3>
                                <p className="text-slate-400 text-sm">Draft blogs, social threads, and copy. The Hivemind defines tone, voice, and structure.</p>
                            </button>

                            {/* VIDEO MISSION */}
                            <button
                                onClick={() => {
                                    const prompt = window.prompt("What video idea do you have?");
                                    if (prompt) navigate('.', { state: { prompt, mode: 'video' } });
                                }}
                                className="group relative p-8 bg-slate-900 border border-amber-500/30 rounded-2xl hover:border-amber-500 transition-all hover:shadow-2xl hover:shadow-amber-500/20 text-left overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 group-hover:h-2 transition-all" />
                                <div className="mb-4 p-4 bg-amber-500/10 rounded-full w-fit text-amber-400 group-hover:scale-110 transition-transform">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Video Producer</h3>
                                <p className="text-slate-400 text-sm">Plan scripts and shot lists. The Hivemind directs camera angles, VFX, and pacing.</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 pb-32">
                        {/* Mission Card */}
                        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Current Mission</h3>
                            <p className="text-lg text-slate-100 font-medium italic">"{incomingPrompt}"</p>
                        </div>

                        {/* MAIN CONTENT AREA */}
                        <div className="relative">
                            {renderActiveHive()}
                        </div>
                    </div>
                )}
            </div>

            {/* API Key Modal (Reused) */}
            <ApiKeyHelpModal
                isOpen={false} // Managed by global state or profile if needed
                onClose={() => { }}
            />
        </div>
    );
};

export default HivemindView;


export default HivemindView;
