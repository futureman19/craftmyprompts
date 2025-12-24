import React from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle, Bot } from 'lucide-react';

// --- IMPORT AGENT DECKS ---
// --- IMPORT AGENT DECKS ---
import VisionaryDeck from '../agent/coding/VisionaryDeck.jsx';
import SpecsDeck from '../agent/coding/SpecsDeck.jsx';
import ProjectBlueprint from '../agent/coding/ProjectBlueprint.jsx';
import FileDeck from '../agent/coding/FileDeck.jsx';
import CriticDeck from '../agent/coding/CriticDeck.jsx';
import DeploymentDeck from '../agent/coding/DeploymentDeck.jsx';

// --- IMPORT FEEDBACK BAR (Restored) ---
// Loading ManagerDrawer acting as Feedback Bar
import ManagerFeedback from '../hivemind/ManagerDrawer.jsx';

const CodingFeed = ({
    history,
    loading,
    statusMessage,
    actions,
    currentPhase,
    githubToken,
    // Restored Props for Feedback Bar
    managerMessages,
    isDrawerOpen,
    setIsDrawerOpen,
    handleManagerFeedback
}) => {

    const mode = 'coding';

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

    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm">Waiting for {strategyRole}...</div>;
        return <VisionaryDeck data={data} mode="coding" onConfirm={actions.submitChoices} />;
    };

    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm">Waiting for {specsRole}...</div>;
        return <SpecsDeck data={data} mode="coding" onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (The Architect)
    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);

        if (!data) {
            if (buildMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {buildRole} FAILED</div>{buildMsg.text}</div>;
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

                {/* 1. WIRE UP INTERNAL CARD BUTTONS 
                    - onRefine -> Sends to Critic (Audit)
                    - onApprove -> Skips Critic, goes straight to Build
                */}
                <ProjectBlueprint
                    structure={data?.structure}
                    onRefine={actions.sendToAudit}
                    onApprove={actions.compileBuild}
                />

                {data?.modules && <FileDeck modules={data.modules} />}

                {!loading && currentPhase === 'blueprint' && (
                    <div className="flex justify-end pt-4 gap-3">
                        {/* Option A: The Standard Route (Check with Critic) */}
                        <button
                            onClick={actions.sendToAudit}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                        >
                            <ShieldCheck size={18} /> Send to Audit
                        </button>

                        {/* Option B: The Fast Lane (Ship It!) */}
                        <button
                            onClick={actions.compileBuild}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95"
                        >
                            <Zap size={18} /> Approve & Build
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: CRITIQUE (The Loop vs The Exit)
    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {renderBlueprint()}

                {data ? (
                    <CriticDeck
                        data={data}
                        onConfirm={(selections) => actions.refineBlueprint(selections)} // <--- WIRED TO LOOP
                    />
                ) : (
                    <div className="text-red-400 p-4 border border-red-500 rounded bg-red-900/10">
                        Critic Output Invalid.
                    </div>
                )}

                {/* EXECUTIVE OVERRIDE (Exit) */}
                <div className="flex flex-col items-center justify-center pt-8 border-t border-cyan-900/30">
                    <p className="text-cyan-500/70 text-xs mb-3 uppercase tracking-widest font-bold">
                        Satisfied with the Code?
                    </p>
                    <button
                        onClick={() => actions.compileBuild()} // <--- WIRED TO EXIT
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-900/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Zap size={24} className="fill-white" />
                        Initialize Build Sequence
                    </button>
                </div>
            </div>
        );
    };

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
        <div className="flex flex-col h-full relative">
            <div className="pb-32 px-4 flex-1">
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

            {/* --- RESTORED FEEDBACK BAR --- */}
            {/* --- RESTORED FEEDBACK BAR --- */}
            {currentPhase !== 'idle' && (
                <ManagerFeedback
                    messages={managerMessages}
                    onSendMessage={handleManagerFeedback}
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default CodingFeed;
