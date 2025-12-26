import React, { useState, useEffect, useRef } from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

// --- IMPORT NEW DECKS ---
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

    // --- SCROLL TO BOTTOM ---
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- RESET DRAFTS ON PHASE CHANGE ---
    useEffect(() => {
        setDraftSelections({});
    }, [currentPhase]);

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
            const formatted = `Archetype: ${c.archetype}, Features: ${c.features}, UX: ${c.ux}`;
            setManifest(prev => ({ ...prev, strategy: formatted }));
            actions.submitChoices(formatted);
        } else if (currentPhase === 'specs') {
            const formatted = `Frontend: ${c.frontend}, Backend: ${c.backend}, UI: ${c.ui}`;
            setManifest(prev => ({ ...prev, stack: formatted }));
            actions.submitSpecs(formatted);
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, strategy: "Auto-Pilot Strategy" }));
            actions.submitChoices({}); // Empty object = Auto-Pilot
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, stack: "Auto-Pilot Stack" }));
            actions.submitSpecs({});
        }
    };

    // --- FIND LAST MESSAGES ---
    const strategyRole = 'The Visionary';
    const specsRole = 'The Tech Lead';
    const buildRole = 'The Architect';

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const buildMsg = history.findLast(m => m.role === buildRole);
    const criticMsg = history.findLast(m => m.role === 'The Critic');
    const executiveMsg = history.findLast(m => m.role === 'The Executive');

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
        if (!data) return null; // Wait for data
        return (
            <div className="space-y-6 animate-in fade-in pb-10">
                <ProjectBlueprint
                    structure={data?.structure}
                    onRefine={actions.sendToAudit}
                    onApprove={actions.compileBuild}
                />
                {data?.modules && <FileDeck modules={data.modules} />}
                {!loading && currentPhase === 'blueprint' && (
                    <div className="flex justify-end gap-3 px-4">
                        <button onClick={actions.sendToAudit} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors">
                            <ShieldCheck size={18} /> Audit Code
                        </button>
                        <button onClick={actions.compileBuild} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20">
                            <Zap size={18} /> Build Now
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {renderBlueprint()}
                {data && <CriticDeck data={data} onConfirm={actions.refineBlueprint} />}
            </div>
        );
    };

    const renderFinal = () => {
        const projectData = parseAgentJson(executiveMsg, 'Executive');
        if (!projectData) return null;
        return <DeploymentDeck projectData={projectData} githubToken={githubToken} onSaveToken={actions.saveGithubToken} onDeploy={actions.deployToGithub} />;
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT: MAIN FEED */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">

                    {/* Render History based on Phase */}
                    {/* Note: We typically show the *current* interactive deck, or the result of previous ones if scrolling back. 
                        For simplicity in this Mega-Update, we render the ACTIVE phase content. */}

                    <div className="flex-1">
                        {currentPhase === 'vision' && strategyMsg && renderVision()}
                        {currentPhase === 'specs' && specsMsg && renderSpecs()}
                        {currentPhase === 'blueprint' && buildMsg && renderBlueprint()}
                        {currentPhase === 'critique' && renderCritique()}
                        {currentPhase === 'done' && renderFinal()}

                        {/* Loader at bottom */}
                        {loading && <AgentLoader message={statusMessage} />}
                    </div>

                    <div ref={bottomRef} />
                </div>

                {/* MANAGER DRAWER */}
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
            />
        </div>
    );
};

export default CodingFeed;
