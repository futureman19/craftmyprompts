import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Code2, Palette, Edit3, Zap } from 'lucide-react';

// --- IMPORT DEDICATED ENGINES ---
import { useCodingHive } from '../hooks/hives/useCodingHive.js';
import CodingFeed from '../components/hives/CodingFeed.jsx';

import { useTextHive } from '../hooks/hives/useTextHive.js';
import TextFeed from '../components/hives/TextFeed.jsx';

import { useArtHive } from '../hooks/hives/useArtHive.js';
import ArtFeed from '../components/hives/ArtFeed.jsx';

import { useVideoHive } from '../hooks/hives/useVideoHive.js';
import VideoFeed from '../components/hives/VideoFeed.jsx';

// --- WRAPPER COMPONENTS (Initialize the specific Brain) ---

const CodingEngine = ({ prompt, apiKey }) => {
    // Initialize the Coding Brain
    const hive = useCodingHive({ gemini: apiKey });

    // Auto-start if prompt exists
    React.useEffect(() => {
        if (prompt && hive.currentPhase === 'idle') {
            hive.startMission(prompt);
        }
    }, [prompt]);

    return (
        <CodingFeed
            history={hive.history}
            loading={hive.loading}
            statusMessage={hive.statusMessage}
            currentPhase={hive.currentPhase}
            actions={{
                submitChoices: hive.submitChoices,
                submitSpecs: hive.submitSpecs,
                sendToAudit: hive.sendToAudit,
                compileBuild: hive.compileBuild,
                refineBlueprint: hive.refineBlueprint,
                saveGithubToken: hive.saveGithubToken,
                deployToGithub: hive.deployToGithub
            }}
            githubToken={hive.githubToken}
            managerMessages={hive.managerMessages}
            isDrawerOpen={hive.isDrawerOpen}
            setIsDrawerOpen={hive.setIsDrawerOpen}
            handleManagerFeedback={hive.handleManagerFeedback}
        />
    );
};

const TextEngine = ({ prompt, apiKey }) => {
    // TextFeed is now self-contained (The Orchestrator)
    return (
        <TextFeed
            initialPrompt={prompt}
            onStateChange={(phase) => console.log('Text Phase:', phase)}
        />
    );
};

const ArtEngine = ({ prompt, apiKey }) => {
    // ArtFeed is now self-contained (The Orchestrator)
    return (
        <ArtFeed
            initialPrompt={prompt}
            onStateChange={(phase) => console.log('Art Phase:', phase)}
        />
    );
};

const VideoEngine = ({ prompt, apiKey }) => {
    // Initialize the Video Brain
    const hive = useVideoHive({ gemini: apiKey });

    // Auto-start
    React.useEffect(() => {
        if (prompt && hive.currentPhase === 'idle') {
            hive.startMission(prompt);
        }
    }, [prompt, hive]);

    return (
        <VideoFeed
            initialPrompt={prompt} // VideoFeed handles the startMission internally via useEffect if prompt exists
            onStateChange={(phase) => console.log('Video Phase:', phase)}
        />
    );
};

// --- MAIN ROUTER VIEW ---

const HivemindView = ({ user, globalApiKey }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Determine Mode & Prompt
    const incomingPrompt = location.state?.prompt || '';
    const incomingMode = location.state?.category || null;

    // Internal state for Mission Select (if no incoming mode)
    const [manualMode, setManualMode] = useState(null);

    const activeMode = incomingMode || manualMode;

    const handleBack = () => {
        navigate('/');
    };

    const handleManualLaunch = (mode, prompt) => {
        setManualMode(mode);
        // We update location state to simulate a fresh navigation
        navigate('/hivemind', { state: { prompt, category: mode }, replace: true });
    };

    // --- RENDERERS ---

    const renderHeader = () => {
        let label = "Hivemind Command Center";
        let subLabel = "Select Operation";

        if (activeMode === 'coding') { subLabel = "Operational Mode: Coding Squad"; }
        if (activeMode === 'text') { subLabel = "Operational Mode: Editorial Room"; }
        if (activeMode === 'art') { subLabel = "Operational Mode: Art Studio"; }
        if (activeMode === 'video') { subLabel = "Operational Mode: Production Set"; }

        return (
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-fuchsia-500"><Users size={20} /></span>
                            {label}
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            {subLabel}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderMissionSelect = () => (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 p-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8 text-center">
                Select Your Mission
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
                {/* CODING */}
                <button
                    onClick={() => {
                        const p = window.prompt("What app would you like to build?");
                        if (p) handleManualLaunch('coding', p);
                    }}
                    className="group relative p-8 bg-slate-900 border border-indigo-500/30 rounded-2xl hover:border-indigo-500 transition-all text-left"
                >
                    <div className="mb-4 p-4 bg-indigo-500/10 rounded-full w-fit text-indigo-400">
                        <Code2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Software Engineer</h3>
                    <p className="text-slate-400 text-sm">Build React apps, tools, and utilities.</p>
                </button>

                {/* TEXT */}
                <button
                    onClick={() => {
                        const p = window.prompt("What content do you need to write?");
                        if (p) handleManualLaunch('text', p);
                    }}
                    className="group relative p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl hover:border-emerald-500 transition-all text-left"
                >
                    <div className="mb-4 p-4 bg-emerald-500/10 rounded-full w-fit text-emerald-400">
                        <Edit3 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Editor-in-Chief</h3>
                    <p className="text-slate-400 text-sm">Draft blogs, threads, and copy.</p>
                </button>

                {/* ART */}
                <button
                    onClick={() => {
                        const p = window.prompt("Describe your Masterpiece:");
                        if (p) handleManualLaunch('art', p);
                    }}
                    className="group relative p-8 bg-slate-900 border border-fuchsia-500/30 rounded-2xl hover:border-fuchsia-500 transition-all text-left"
                >
                    <div className="mb-4 p-4 bg-fuchsia-500/10 rounded-full w-fit text-fuchsia-400">
                        <Palette size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Art Director</h3>
                    <p className="text-slate-400 text-sm">Generate ultra-realistic prompts.</p>
                </button>

                {/* VIDEO */}
                <button
                    onClick={() => {
                        const p = window.prompt("Describe the video concept:");
                        if (p) handleManualLaunch('video', p);
                    }}
                    className="group relative p-8 bg-slate-900 border border-amber-500/30 rounded-2xl hover:border-amber-500 transition-all text-left"
                >
                    <div className="mb-4 p-4 bg-amber-500/10 rounded-full w-fit text-amber-400">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Video Producer</h3>
                    <p className="text-slate-400 text-sm">Direct scenes and scripts.</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {renderHeader()}

            <div className="flex-1 overflow-y-auto relative">
                {!activeMode && renderMissionSelect()}

                {activeMode === 'coding' && (
                    <CodingEngine prompt={incomingPrompt} apiKey={globalApiKey} />
                )}

                {activeMode === 'text' && (
                    <TextEngine prompt={incomingPrompt} apiKey={globalApiKey} />
                )}

                {activeMode === 'art' && (
                    <ArtEngine prompt={incomingPrompt} apiKey={globalApiKey} />
                )}

                {activeMode === 'video' && (
                    <VideoEngine prompt={incomingPrompt} apiKey={globalApiKey} />
                )}
            </div>
        </div>
    );
};

export default HivemindView;
