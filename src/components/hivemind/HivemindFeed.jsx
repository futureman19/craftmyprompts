import React from 'react';
import { Loader, Layers, ShieldCheck, Zap, Package, Download, AlertTriangle } from 'lucide-react';
import VisionaryDeck from '../agent/VisionaryDeck.jsx';
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx';
import FileDeck from '../agent/FileDeck.jsx';
import SpecsDeck from '../agent/SpecsDeck.jsx';
import CriticDeck from '../agent/CriticDeck.jsx';
import DeploymentDeck from '../agent/DeploymentDeck.jsx';
import { generateProjectZip } from '../../utils/artifactEngine.js'; // Ensure path is correct

const HivemindFeed = ({ history, loading, statusMessage, actions, currentPhase, githubToken }) => {

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    // We scan history to find the latest data for each role
    const visionaryMsg = history.findLast(m => m.role === 'The Visionary');
    const techMsg = history.findLast(m => m.role === 'The Tech Lead'); // <--- New Tech Lead Logic
    const architectMsg = history.findLast(m => m.role === 'The Architect');
    const criticMsg = history.findLast(m => m.role === 'The Critic');
    const executiveMsg = history.findLast(m => m.role === 'The Executive');

    // --- 2. RENDERERS ---

    // PHASE 1: STRATEGY (Visionary)
    const renderVision = () => {
        if (!visionaryMsg) return null;
        let data = null;
        let parseError = null;
        const rawText = typeof visionaryMsg.text === 'string' ? visionaryMsg.text : JSON.stringify(visionaryMsg.text);

        try {
            // 1. SURGICAL EXTRACTION
            // Find the absolute first '{' and the absolute last '}'
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');

            if (start === -1 || end === -1) {
                throw new Error("No JSON object found in response (Missing curly braces).");
            }

            // Extract the clean JSON block
            const jsonBlock = rawText.substring(start, end + 1);

            // 2. PARSE
            data = JSON.parse(jsonBlock);

            // 3. VALIDATE STRUCTURE
            if (!data.strategy_options || !Array.isArray(data.strategy_options)) {
                throw new Error("JSON parsed, but missing 'strategy_options' array.");
            }

        } catch (e) {
            parseError = e.message;
            console.error("Visionary Parse Failure:", e);
        }

        // ERROR STATE (With Debug View)
        if (!data || parseError) {
            return (
                <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl animate-in zoom-in-95">
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                        <AlertTriangle size={24} />
                        <h3 className="text-lg font-bold">Signal Interrupted</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                        The Visionary returned invalid data. See raw output below:
                    </p>
                    {/* RAW OUTPUT VIEWER */}
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 overflow-auto max-h-64 mb-6 border border-slate-800 whitespace-pre-wrap">
                        {rawText}
                    </div>

                    <div className="flex justify-end gap-3">
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

        // SUCCESS STATE
        return (
            <VisionaryDeck
                data={data}
                onConfirm={actions.submitChoices}
            />
        );
    };

    // PHASE 2: SPECS (Tech Lead)
    const renderSpecs = () => {
        if (!techMsg) return null;
        let data = null;

        // 1. Get String
        const rawText = typeof techMsg.text === 'string' ? techMsg.text : JSON.stringify(techMsg.text);

        try {
            // 2. Surgical Extraction (Find JSON inside text)
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');

            if (start !== -1 && end !== -1) {
                const jsonBlock = rawText.substring(start, end + 1);
                data = JSON.parse(jsonBlock);
            }
        } catch (e) {
            console.error("Tech Lead Parse Error", e);
        }

        // 3. Render
        if (data && data.spec_options) {
            return (
                <SpecsDeck
                    data={data}
                    onConfirm={(selections) => actions.submitSpecs(selections)}
                />
            );
        }
        return null;
    };

    // PHASe 3: BLUEPRINT (Architect)
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
        let data = null;

        // 1. Get String
        const rawText = typeof criticMsg.text === 'string' ? criticMsg.text : JSON.stringify(criticMsg.text);

        try {
            // 2. Surgical Extraction (Find JSON inside text)
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');

            if (start !== -1 && end !== -1) {
                const jsonBlock = rawText.substring(start, end + 1);
                data = JSON.parse(jsonBlock);
            }
        } catch (e) {
            console.error("Critic Parse Error", e);
        }

        // 3. Render
        if (data && data.risk_options) {
            return (
                <CriticDeck
                    data={data}
                    onConfirm={(selections) => actions.compileBuild(selections)}
                />
            );
        }

        // Fallback (If parsing failed, show raw text)
        return (
            <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-slate-900 border border-slate-700 rounded-xl">
                <div className="text-slate-500 font-bold mb-2 uppercase text-xs">Raw Audit Log</div>
                <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">{rawText}</pre>
                <button onClick={actions.compileBuild} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded text-xs font-bold">Force Compile</button>
            </div>
        );
    };

    // PHASE 4: FINAL (Executive)
    const renderFinal = () => {
        if (!executiveMsg) return null;
        let projectData = {};

        // Robust JSON Extraction
        const rawText = typeof executiveMsg.text === 'string' ? executiveMsg.text : JSON.stringify(executiveMsg.text);
        try {
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                projectData = JSON.parse(rawText.substring(start, end + 1));
            }
        } catch (e) { console.error("Executive Parse Error", e); }

        if (!projectData.files) return <div className="text-red-500">Build data corrupted.</div>;

        return (
            <DeploymentDeck
                projectData={projectData}
                githubToken={githubToken}
                onSaveToken={actions.saveGithubToken}
                onDeploy={actions.deployToGithub}
            />
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
            {currentPhase === 'specs' && renderSpecs()}
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
