import React, { useRef, useEffect } from 'react';
import { Loader, Copy, CheckCircle2, FileText, List, PenTool, BookOpen } from 'lucide-react';

// --- IMPORT AGENT DECKS (Text Specific) ---
import EditorDeck from '../agent/text/EditorDeck.jsx';  // "Editor-in-Chief"
import SpecsDeck from '../agent/SpecsDeck.jsx';         // "Tone Calibration"
import Manuscript from '../agent/text/Manuscript.jsx';  // "Content Outline"
import CriticDeck from '../agent/CriticDeck.jsx';

import { generateFinalOutput } from '../../utils/formatters.js';

const TextFeed = ({ history, loading, statusMessage, actions, currentPhase }) => {

    const mode = 'text'; // Always text
    const bottomRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading, currentPhase]);

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    const strategyRole = 'The Editor-in-Chief';
    const specsRole = 'The Linguist';
    const scribeRole = 'The Scribe';
    const publisherRole = 'The Publisher';

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const scribeMsg = history.findLast(m => m.role === scribeRole);
    const publisherMsg = history.findLast(m => m.role === publisherRole);
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
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {strategyRole}...</div>;

        // Use the specialized EditorDeck
        return <EditorDeck data={data} onConfirm={actions.submitChoices} />;
    };

    // PHASE 2: SPECS (The Linguist)
    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {specsRole}...</div>;
        return <SpecsDeck data={data} mode="text" onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (The Scribe)
    const renderBlueprint = () => {
        const data = parseAgentJson(scribeMsg, scribeRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {scribeRole}...</div>;

        return (
            <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in space-y-6">
                {/* 1. Visual Outline (Manuscript) */}
                <Manuscript data={data} />

                {/* 2. Confirm Action */}
                {!loading && (
                    <div className="flex justify-end pt-4 border-t border-slate-800">
                        <button
                            onClick={actions.generateDraft}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
                        >
                            <PenTool size={18} /> Approve Outline & Draft
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: DRAFTING (The Publisher)
    const renderDraft = () => {
        const data = parseAgentJson(publisherMsg, publisherRole);
        if (!data) return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {publisherRole}...</div>;

        return (
            <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in space-y-6">

                {/* Header */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">First Draft</h3>
                            <p className="text-sm text-slate-400 mt-2">{data.publication_summary}</p>
                        </div>
                    </div>
                </div>

                {/* Draft Content */}
                <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl min-h-[400px]">
                    <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed max-w-none">
                        {data.final_text}
                    </pre>
                </div>

                {/* Actions */}
                {!loading && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={actions.sendToAudit}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                        >
                            <CheckCircle2 size={18} /> Send to Critic
                        </button>
                    </div>
                )}
            </div>
        )
    };


    // PHASE 5: CRITIQUE (Critic)
    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {/* 1. Context: The Draft */}
                {renderDraft()}

                {/* 2. The Critic's Feedback Card */}
                {data ? (
                    <CriticDeck data={data} onConfirm={(selections) => actions.compileBuild(selections)} />
                ) : (
                    <div className="text-slate-500 p-4 border border-slate-800 rounded bg-slate-900/50 text-center text-sm">
                        Critic Analysis Pending...
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

    // PHASE 6: FINAL (Instant Publish - DONE)
    const renderFinal = () => {
        // Find latest Publisher output for final display
        const finalDraftData = parseAgentJson(publisherMsg, publisherRole);
        const finalText = finalDraftData?.final_text || "Error retrieving final text.";

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
                                <h2 className="text-xl font-bold text-white">Content Published</h2>
                                <p className="text-emerald-400 text-xs font-mono">MISSION ACCOMPLISHED</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigator.clipboard.writeText(finalText)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Copy size={14} /> Copy Text
                            </button>
                        </div>
                    </div>

                    {/* The Content */}
                    <div className="p-8 bg-white overflow-y-auto max-h-[70vh] shadow-inner">
                        <pre className="whitespace-pre-wrap font-serif text-slate-900 text-lg leading-relaxed">
                            {finalText}
                        </pre>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
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
            {currentPhase === 'drafting' && renderDraft()}
            {currentPhase === 'critique' && renderCritique()}
            {currentPhase === 'done' && renderFinal()}

            {currentPhase === 'idle' && (
                <div className="text-center text-slate-500 mt-20 font-mono text-sm">
                    Initialize Hivemind to begin...
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};

export default TextFeed;
