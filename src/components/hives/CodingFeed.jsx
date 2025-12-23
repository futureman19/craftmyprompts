import React from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

// --- IMPORT AGENT DECKS (Coding Specific) ---
import VisionaryDeck from '../agent/VisionaryDeck.jsx';
import SpecsDeck from '../agent/SpecsDeck.jsx';
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx';
import FileDeck from '../agent/FileDeck.jsx';
import CriticDeck from '../agent/CriticDeck.jsx';
import DeploymentDeck from '../agent/DeploymentDeck.jsx';

const CodingFeed = ({ history, loading, statusMessage, actions, currentPhase, githubToken }) => {

    const mode = 'coding'; // Always coding

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    const strategyRole = 'The Visionary';
    const specsRole = 'The Tech Lead';
    const buildRole = 'The Architect';

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const buildMsg = history.findLast(m => m.role === buildRole);

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

    // PHASE 1: VISION (The Visionary)
    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        if (!data) {
            if (strategyMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {strategyRole} FAILED</div>{strategyMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {strategyRole}...</div>;
        }
        // Force Coding Mode
        return <VisionaryDeck data={data} mode="coding" onConfirm={actions.submitChoices} />;
    };

    // PHASE 2: SPECS (The Tech Lead)
    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) {
            if (specsMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {specsRole} FAILED</div>{specsMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {specsRole}...</div>;
        }
        // Force Coding Mode
        return <SpecsDeck data={data} mode="coding" onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (The Architect)
    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);

        if (!data) {
            if (buildMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {buildRole} FAILED</div>{buildMsg.text}</div>;
            // Don't default to StylistDeck. Coding uses ProjectBlueprint + FileDeck.
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {buildRole}...</div>;
        }

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
                <Loader size={48} className="animate-spin text-cyan-500" />
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

export default CodingFeed;
