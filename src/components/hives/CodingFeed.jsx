import React, { useState, useEffect, useRef } from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

import VisionaryDeck from '../agent/coding/VisionaryDeck';
import SpecsDeck from '../agent/coding/SpecsDeck';
import ProjectBlueprint from '../agent/coding/ProjectBlueprint';
import FileDeck from '../agent/coding/FileDeck';
import CriticDeck from '../agent/coding/CriticDeck';
import DeploymentDeck from '../agent/coding/DeploymentDeck';

import CodingManifest from '../agent/coding/CodingManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

const CodingFeed = ({
    history,
    loading,
    statusMessage,
    actions,
    currentPhase,
    githubToken,
    managerMessages,
    isDrawerOpen,
    setIsDrawerOpen,
    handleManagerFeedback
}) => {

    // --- STATE ---
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    // --- FIND MESSAGES (Needed for Auto-Pilot Data Access) ---
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
        } catch (e) { console.error(`${contextName} Parse Error:`, e); }
        return null;
    };

    // --- AUTO-UPDATE MANIFEST PROGRESS ---
    useEffect(() => {
        if (buildMsg) {
            setManifest(prev => ({ ...prev, blueprint: "Architecture Locked" }));
        }
        // If Critic speaks, record it
        if (criticMsg) {
            // We can parse the critic's decision or just say "Review Complete"
            setManifest(prev => ({ ...prev, critic: "Review Completed" }));
        }
        // If Executive speaks (Final Build), check if Critic was skipped
        if (executiveMsg) {
            setManifest(prev => {
                const newManifest = { ...prev, final: "Ready for Deployment" };
                // If we reached Final but Critic is empty, mark as Skipped
                if (!prev.critic) {
                    newManifest.critic = "Skipped";
                }
                return newManifest;
            });
        }
    }, [buildMsg, criticMsg, executiveMsg]);

    // --- SCROLL & RESET ---
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    useEffect(() => {
        setDraftSelections({});
    }, [currentPhase]);

    // --- SELECTION HANDLER ---
    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    // --- READY CHECK ---
    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.archetype && draftSelections.features && draftSelections.ux;
        if (currentPhase === 'specs') return draftSelections.frontend && draftSelections.backend && draftSelections.ui;
        return false;
    };

    // --- SIDEBAR ACTIONS ---
    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, strategy: c }));
            const formatted = `Archetype: ${c.archetype}, Features: ${c.features}, UX: ${c.ux}`;
            actions.submitChoices(formatted);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, stack: c }));
            const formatted = `Frontend: ${c.frontend}, Backend: ${c.backend}, UI: ${c.ui}`;
            actions.submitSpecs(formatted);
        }
    };

    // --- SMART AUTO-PILOT ---
    // Takes the 1st option from each deck automatically
    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(strategyMsg, strategyRole);
            if (!data) return;

            // Pick Top Choices
            const autoSelections = {
                archetype: data.archetype_options?.[0]?.label || "Default",
                features: data.feature_options?.[0]?.label || "Default",
                ux: data.ux_options?.[0]?.label || "Default"
            };

            setManifest(prev => ({ ...prev, strategy: autoSelections }));
            const formatted = `Archetype: ${autoSelections.archetype}, Features: ${autoSelections.features}, UX: ${autoSelections.ux}`;
            actions.submitChoices(formatted);

        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg, specsRole);
            if (!data) return;

            const autoSelections = {
                frontend: data.frontend_options?.[0]?.label || "Default",
                backend: data.backend_options?.[0]?.label || "Default",
                ui: data.ui_options?.[0]?.label || "Default"
            };

            setManifest(prev => ({ ...prev, stack: autoSelections }));
            const formatted = `Frontend: ${autoSelections.frontend}, Backend: ${autoSelections.backend}, UI: ${autoSelections.ui}`;
            actions.submitSpecs(formatted);
        }
    };

    // --- RENDERERS ---

    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        return <VisionaryDeck data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
    };

    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        return <SpecsDeck data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
    };

    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);
        if (!data) return null;
        return (
            <div className="space-y-6 animate-in fade-in pb-10">
                <ProjectBlueprint structure={data?.structure} />
                {data?.modules && <FileDeck modules={data.modules} />}
            </div>
        );
    };

    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {renderBlueprint()}
                {data && <CriticDeck data={data} onConfirm={(selections) => {
                    // Update Manifest with Critic choices if made
                    setManifest(prev => ({ ...prev, critic: "Updates Applied" }));
                    actions.refineBlueprint(selections);
                }} />}
            </div>
        );
    };

    const renderFinal = () => {
        const projectData = parseAgentJson(executiveMsg, 'Executive');

        if (projectData && projectData.files) {
            return (
                <DeploymentDeck
                    projectData={projectData}
                    githubToken={githubToken}
                    onSaveToken={actions.saveGithubToken}
                    onDeploy={actions.deployToGithub}
                />
            );
        }

        if (executiveMsg) {
            return (
                <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 border border-red-500/50 rounded-xl text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Build Incomplete</h3>
                    <p className="text-slate-400 text-sm">
                        The Executive finished, but the build manifest was unreadable.
                    </p>
                    <div className="text-xs font-mono bg-black/50 p-4 rounded text-left overflow-auto max-h-32 text-red-300">
                        {executiveMsg.text || "No content returned."}
                    </div>
                    <button
                        onClick={actions.compileBuild}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        Retry Build
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT: MAIN FEED */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1">
                        {currentPhase === 'vision' && strategyMsg && renderVision()}
                        {currentPhase === 'specs' && specsMsg && renderSpecs()}
                        {currentPhase === 'blueprint' && buildMsg && renderBlueprint()}
                        {currentPhase === 'critique' && renderCritique()}
                        {currentPhase === 'done' && renderFinal()}

                        {loading && <AgentLoader message={statusMessage} />}
                    </div>
                    <div ref={bottomRef} />
                </div>

                <ManagerDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    messages={managerMessages}
                    onSendMessage={handleManagerFeedback}
                    loading={loading}
                />
            </div>

            {/* RIGHT: MANIFEST SIDEBAR */}
            <CodingManifest
                manifest={manifest}
                currentPhase={currentPhase}
                onConfirm={handleSidebarConfirm}
                onAutoPilot={handleAutoPilot}
                isReady={checkIsReady()}
                onAudit={actions.sendToAudit}
                onBuild={actions.compileBuild}
            />
        </div>
    );
};

export default CodingFeed;
