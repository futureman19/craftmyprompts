import React from 'react';
import { Loader, Layers, ShieldCheck, Zap, Package, Download, AlertTriangle } from 'lucide-react';
import VisionaryDeck from '../agent/VisionaryDeck.jsx';
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx';
import FileDeck from '../agent/FileDeck.jsx';
import { generateProjectZip } from '../../utils/artifactEngine.js'; // Ensure path is correct

const HivemindFeed = ({ history, loading, statusMessage, actions, currentPhase }) => {

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    // We scan history to find the latest data for each role
    const visionaryMsg = history.findLast(m => m.role === 'The Visionary');
    const architectMsg = history.findLast(m => m.role === 'The Architect');
    const criticMsg = history.findLast(m => m.role === 'The Critic');
    const executiveMsg = history.findLast(m => m.role === 'The Executive');

    // --- 2. RENDERERS ---

    // PHASE 1: STRATEGY (Visionary)
    const renderVision = () => {
        if (!visionaryMsg) return null;
        let data = null;
        let parseError = null;

        try {
            // Attempt to parse
            const raw = typeof visionaryMsg.text === 'string' ? visionaryMsg.text : JSON.stringify(visionaryMsg.text);

            // Check for Agent Error String first
            if (raw.includes("Agent Offline") || raw.includes("Error")) {
                throw new Error(raw);
            }

            const clean = raw.replace(/```json|```/g, '').trim();
            // Find the first { and last } to isolate JSON from any conversational intro/outro
            const jsonStart = clean.indexOf('{');
            const jsonEnd = clean.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                data = JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
            } else {
                throw new Error("No JSON object found in response.");
            }

        } catch (e) {
            parseError = e.message;
        }

        // If parsing failed or API returned an error string, show the Error Card
        if (!data || parseError) {
            return (
                <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                        <AlertTriangle size={24} />
                        <h3 className="text-lg font-bold">Signal Interrupted</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                        The Visionary could not generate a strategy. This usually means the AI model failed or returned invalid data.
                    </p>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-300 overflow-auto max-h-40 mb-6 border border-red-900/30">
                        {visionaryMsg.text || parseError}
                    </div>

                    <div className="flex justify-end gap-3">
                        {/* Fallback button to skip Visionary if it keeps failing */}
                        <button
                            onClick={() => actions.submitChoices({ strategy: "Manual Override" })}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            Skip Strategy Phase
                        </button>
                    </div>
                </div>
            );
        }

        // Success Case
        return (
            <VisionaryDeck
                data={data}
                onConfirm={actions.submitChoices}
            />
        );
    };

    // PHASE 2: BLUEPRINT (Architect)
    const renderBlueprint = () => {
        if (!architectMsg) return null;
        let data = null;
        try {
            const raw = typeof architectMsg.text === 'string' ? architectMsg.text : JSON.stringify(architectMsg.text);
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) data = JSON.parse(match[0]);
        } catch (e) { console.error(e); }

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

                {/* The Tree */}
                <ProjectBlueprint
                    structure={data?.structure}
                    onRefine={() => { }} // Optional: Manual trigger
                    onApprove={() => actions.sendToAudit()}
                />

                {/* The Files (Hidden by default) */}
                {data?.modules && <FileDeck modules={data.modules} />}

                {/* Action Bar */}
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

    // PHASE 3: CRITIQUE (Critic)
    const renderCritique = () => {
        if (!criticMsg) return null;
        return (
            <div className="w-full max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4 text-rose-400">
                        <ShieldCheck size={24} />
                        <h3 className="text-lg font-bold">Audit Report</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                        <pre className="whitespace-pre-wrap font-sans">{criticMsg.text}</pre>
                    </div>

                    {/* The Loop Controls are handled by the Footer in HivemindView, 
                        but we can add a 'Compile' shortcut here if satisfied */}
                    {!loading && (
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button
                                onClick={actions.compileBuild}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2"
                            >
                                <Zap size={16} /> LGTM - Compile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // PHASE 4: FINAL (Executive)
    const renderFinal = () => {
        if (!executiveMsg) return null;
        let projectData = {};
        try {
            const raw = executiveMsg.text.replace(/```json|```/g, '').trim();
            projectData = JSON.parse(raw);
        } catch (e) { console.error("Final Parse Error", e); }

        return (
            <div className="w-full max-w-md mx-auto mt-10 animate-in zoom-in-95">
                <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />

                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20">
                        <Package size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{projectData.project_name || "Build Complete"}</h2>
                    <p className="text-slate-400 mb-8">{projectData.description || "Ready for deployment."}</p>

                    <button
                        onClick={() => generateProjectZip(projectData)}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Download size={20} /> Download Source Code (.zip)
                    </button>
                </div>
            </div>
        );
    };

    // --- 3. MAIN RENDER SWITCH ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader size={48} className="animate-spin text-fuchsia-500" />
                <p className="text-slate-400 animate-pulse font-mono">{statusMessage}</p>
            </div>
        );
    }

    return (
        <div className="pb-32"> {/* Padding for footer */}
            {currentPhase === 'vision' && renderVision()}
            {currentPhase === 'blueprint' && renderBlueprint()}
            {currentPhase === 'critique' && (
                <>
                    {renderBlueprint()} {/* Keep blueprint visible */}
                    {renderCritique()}
                </>
            )}
            {currentPhase === 'done' && renderFinal()}
            {currentPhase === 'idle' && <div className="text-center text-slate-500 mt-20">Waiting for mission start...</div>}
        </div>
    );
};

export default HivemindFeed;
