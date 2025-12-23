import React from 'react';
import { Loader, Layers, ShieldCheck, Zap, Package, AlertTriangle } from 'lucide-react';

// --- IMPORT ALL AGENT DECKS ---
import VisionaryDeck from '../agent/VisionaryDeck.jsx';
import SpecsDeck from '../agent/SpecsDeck.jsx';       // Phase 2
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx'; // Phase 3 (Coding)
import FileDeck from '../agent/FileDeck.jsx';         // Phase 3 (Files)
import StylistDeck from '../agent/StylistDeck.jsx';   // Phase 3 (Art)
import CriticDeck from '../agent/CriticDeck.jsx';     // Phase 4
import DeploymentDeck from '../agent/DeploymentDeck.jsx'; // Phase 5 (Final)

const HivemindFeed = ({ history, loading, statusMessage, actions, currentPhase, githubToken, mode = 'coding' }) => {

    // --- 1. FIND LATEST AGENT OUTPUTS (Dynamic based on Mode) ---
    const getRoles = (m) => {
        const roles = {
            coding: { strategy: 'The Visionary', specs: 'The Tech Lead', build: 'The Architect' },
            art: { strategy: 'The Muse', specs: 'The Cinematographer', build: 'The Stylist' },
            text: { strategy: 'The Editor-in-Chief', specs: 'The Linguist', build: 'The Scribe' },
            video: { strategy: 'The Producer', specs: 'The Director', build: 'The VFX Supervisor' }
        };
        return roles[m] || roles.coding;
    };

    const { strategy: strategyRole, specs: specsRole, build: buildRole } = getRoles(mode);

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const buildMsg = history.findLast(m => m.role === buildRole);

    // Phase 4 & 5: Audit & Executive (Shared Roles for now, or customize if needed)
    const criticMsg = history.findLast(m => m.role === 'The Critic');
    const executiveMsg = history.findLast(m => m.role === 'The Executive');

    // --- HELPER: SAFE JSON PARSER ---
    const parseAgentJson = (msg, contextName) => {
        if (!msg) return null;
        try {
            const raw = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(raw.substring(start, end + 1));
            }
        } catch (e) {
            console.error(`${contextName} Parse Error:`, e);
        }
        return null;
    };

    // --- 2. RENDERERS ---

    // PHASE 1: VISION (Strategy)
    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {strategyRole}...</div>;
        // VisionaryDeck and Muse use the same "Strategy" schema now
        return <VisionaryDeck data={data} onConfirm={actions.submitChoices} />;
    };

    // PHASE 2: SPECS (Tech Lead / Cinematographer)
    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {specsRole}...</div>;
        // SpecsDeck and Cinematographer use the same "Specs" schema now
        return <SpecsDeck data={data} onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (Architect / Stylist)
    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);

        // --- ART MODE DIVERGENCE ---
        // --- CREATIVE MODES (Art, Text, Video) ---
        // They all use the "Modules" schema, so they share the StylistDeck
        if (mode === 'art' || mode === 'text' || mode === 'video') {
            if (!data) return <div className="text-red-400 p-4">Waiting for {buildRole}...</div>;
            return <StylistDeck data={data} onConfirm={actions.sendToAudit} />;
        }

        // --- CODING MODE (Default) ---
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in">
                <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-900/50 rounded-full text-cyan-400">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Blueprint Generated</h3>
                        <p className="text-sm text-slate-400">{data?.blueprint_summary || "Structure ready for review."}</p>
                    </div>
                </div>

                <ProjectBlueprint structure={data?.structure} />
                {data?.modules && <FileDeck modules={data.modules} />}

                {!loading && currentPhase === 'blueprint' && (
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={actions.sendToAudit}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                        >
                            <ShieldCheck size={18} /> Send to Audit
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: CRITIQUE (Critic)
    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <>
                {renderBlueprint()} {/* Show the work being critiqued */}
                {data ? (
                    <CriticDeck data={data} onConfirm={(selections) => actions.compileBuild(selections)} />
                ) : (
                    <div className="text-red-400 p-4 border border-red-500 mt-4 rounded">
                        Critic Output Invalid. <button onClick={actions.compileBuild} className="underline">Force Compile</button>
                    </div>
                )}
            </>
        );
    };

    // PHASE 5: LAUNCHPAD (Executive)
    const renderFinal = () => {
        // Creative Modes: Show Success Message
        if (mode === 'art' || mode === 'text' || mode === 'video') {
            return (
                <div className="max-w-4xl mx-auto p-6 bg-slate-900 border border-fuchsia-500 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-fuchsia-400 mb-2">
                        {mode === 'art' ? 'Masterpiece Defined' : (mode === 'text' ? 'Content Strategy Ready' : 'Production Bible Ready')}
                    </h2>
                    <p className="text-slate-400">Your plan has been audited and finalized.</p>
                </div>
            );
        }

        const projectData = parseAgentJson(executiveMsg, 'Executive');

        if (!projectData || !projectData.files) {
            return (
                <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-slate-900 border border-red-500 rounded-xl">
                    <h3 className="text-red-500 font-bold mb-2"><AlertTriangle className="inline mr-2" /> Build Corrupted</h3>
                    <p className="text-slate-400 text-sm">The Executive failed to generate a valid file manifest.</p>
                </div>
            );
        }

        return (
            <DeploymentDeck
                projectData={projectData}
                githubToken={githubToken}
                onSaveToken={actions.saveGithubToken}
                onDeploy={actions.deployToGithub}
            />
        );
    };

    // --- 3. MAIN SWITCH ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader size={48} className={`animate-spin ${mode === 'art' ? 'text-fuchsia-500' : 'text-cyan-500'}`} />
                <p className="text-slate-400 animate-pulse font-mono text-sm">{statusMessage}</p>
            </div>
        );
    }

    return (
        <div className="pb-32 px-4">
            {currentPhase === 'vision' && renderVision()}
            {currentPhase === 'specs' && renderSpecs()}
            {currentPhase === 'blueprint' && renderBlueprint()}
            {currentPhase === 'critique' && renderCritique()}
            {currentPhase === 'done' && renderFinal()}

            {currentPhase === 'idle' && (
                <div className="text-center text-slate-500 mt-20 font-mono text-sm">
                    Initialize Hivemind to begin...
                </div>
            )}
        </div>
    );
};

export default HivemindFeed;