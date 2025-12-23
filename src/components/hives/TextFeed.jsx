import { Loader, Copy, CheckCircle, CheckCircle2 } from 'lucide-react';

// --- IMPORT AGENT DECKS (Text Specific) ---
import VisionaryDeck from '../agent/VisionaryDeck.jsx'; // Will render "Editorial Board"
import SpecsDeck from '../agent/SpecsDeck.jsx';         // Will render "Tone Calibration"
import StylistDeck from '../agent/StylistDeck.jsx';     // Will render "Content Outline"
import CriticDeck from '../agent/CriticDeck.jsx';

import { generateFinalOutput } from '../../utils/formatters.js';

const TextFeed = ({ history, loading, statusMessage, actions, currentPhase }) => {

    const mode = 'text'; // Always text

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    const strategyRole = 'The Editor-in-Chief';
    const specsRole = 'The Linguist';
    const buildRole = 'The Scribe';

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const buildMsg = history.findLast(m => m.role === buildRole);

    const criticMsg = history.findLast(m => m.role === 'The Critic');

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

    // PHASE 1: VISION (The Editor)
    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        if (!data) {
            if (strategyMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {strategyRole} FAILED</div>{strategyMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {strategyRole}...</div>;
        }
        return <VisionaryDeck data={data} mode="text" onConfirm={actions.submitChoices} />;
    };

    // PHASE 2: SPECS (The Linguist)
    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) {
            if (specsMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {specsRole} FAILED</div>{specsMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {specsRole}...</div>;
        }
        return <SpecsDeck data={data} mode="text" onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (The Scribe)
    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);

        if (!data) {
            if (buildMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {buildRole} FAILED</div>{buildMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {buildRole}...</div>;
        }

        // Use StylistDeck for "Content Outline"
        return <StylistDeck data={data} mode="text" onConfirm={actions.sendToAudit} />;
    };

    // PHASE 4: CRITIQUE (Critic)
    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {/* 1. Context: The Blueprint */}
                {renderBlueprint()}

                {/* 2. The Critic's Feedback Card */}
                {data ? (
                    <CriticDeck data={data} onConfirm={(selections) => actions.compileBuild(selections)} />
                ) : (
                    <div className="text-red-400 p-4 border border-red-500 rounded bg-red-900/10">
                        Critic Output Invalid.
                    </div>
                )}

                {/* 3. EMERGENCY BYPASS BUTTON (The Fix) */}
                <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-800">
                    <p className="text-slate-500 text-xs mb-3 uppercase tracking-widest font-bold">
                        Satisfied with the draft?
                    </p>
                    <button
                        onClick={() => actions.compileBuild()}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <CheckCircle2 size={24} />
                        Approve & Publish Now
                    </button>
                </div>
            </div>
        );
    };

    // PHASE 5: FINAL (Instant Publish)
    const renderFinal = () => {
        // 1. Find the "Final" entry by TYPE, not by NAME
        // This works for 'The Publisher', 'The Executive', or anyone else.
        const finalMsg = history.find(m => m.type === 'final');

        // 2. Generate the formatted text
        const finalOutput = generateFinalOutput('text', history);

        return (
            <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20">

                    {/* Header */}
                    <div className="bg-slate-950/50 p-4 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Content Strategy Ready</h2>
                                <p className="text-emerald-400 text-xs font-mono">MISSION ACCOMPLISHED</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigator.clipboard.writeText(finalOutput)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Copy size={14} /> Copy Text
                            </button>
                        </div>
                    </div>

                    {/* The Content */}
                    <div className="p-6 bg-slate-900 overflow-y-auto max-h-[60vh]">
                        <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
                            {finalOutput || "Generating final draft..."}
                        </pre>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-xs">
                            Generated by the Hivemind Editorial Board
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // --- 3. MAIN SWITCH ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader size={48} className="animate-spin text-emerald-500" />
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

export default TextFeed;
