import React, { useState, useEffect, useRef } from 'react';
import { Loader, Feather, FileText, ShieldCheck, PenTool, Copy, Check } from 'lucide-react';
import { useTextHive } from '../../hooks/hives/useTextHive';

// Text Components
import EditorDeck from '../agent/text/EditorDeck';
import LinguistDeck from '../agent/text/LinguistDeck';
import Manuscript from '../agent/text/Manuscript';
import TextCriticDeck from '../agent/text/TextCriticDeck';
// Shared/Global Components
import ManagerDrawer from '../hivemind/ManagerDrawer';

const TextFeed = ({ initialPrompt, onStateChange }) => {
    // 1. Initialize the Text Brain
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, sendToAudit, refineBlueprint, compileManuscript,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback
    } = useTextHive();

    const [hasStarted, setHasStarted] = useState(false);
    const [copied, setCopied] = useState(false);
    const bottomRef = useRef(null);

    // Start mission on first load
    useEffect(() => {
        if (initialPrompt && !hasStarted) {
            startMission(initialPrompt);
            setHasStarted(true);
        }
    }, [initialPrompt]);

    // Notify parent layout of phase changes
    useEffect(() => {
        onStateChange && onStateChange(currentPhase);
    }, [currentPhase]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- HELPER: Parse Agent JSON safely ---
    const parseAgentJson = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) {
            console.error("JSON Parse Error in Feed:", e);
            return null;
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- RENDERERS ---

    // PHASE 1: EDITOR (Strategy)
    const renderEditor = (msg) => {
        const data = parseAgentJson(msg);
        return <EditorDeck data={data} onConfirm={submitChoices} />;
    };

    // PHASE 2: LINGUIST (Voice)
    const renderLinguist = (msg) => {
        const data = parseAgentJson(msg);
        return <LinguistDeck data={data} onConfirm={submitSpecs} />;
    };

    // PHASE 3: SCRIBE (Blueprint/Manuscript)
    const renderManuscript = (msg) => {
        const data = parseAgentJson(msg);

        return (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in">
                {/* The Outline View */}
                <Manuscript data={data} />

                {/* Action Buttons */}
                {!loading && currentPhase === 'scribe' && (
                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            onClick={sendToAudit}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                        >
                            <ShieldCheck size={18} /> Send to Editorial Audit
                        </button>

                        <button
                            onClick={compileManuscript}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95"
                        >
                            <PenTool size={18} /> Approve & Publish
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: CRITIC (Audit)
    const renderCritic = (msg) => {
        const data = parseAgentJson(msg);
        return <TextCriticDeck data={data} onConfirm={refineBlueprint} />;
    };

    // PHASE 5: PUBLISHER (Final Document)
    const renderPublication = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_text) return null;

        return (
            <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4 pb-20">

                {/* Document Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Final Draft</h3>
                            <p className="text-xs text-slate-400">{data.publication_summary}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCopy(data.final_text)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white rounded-lg text-slate-400 text-xs font-bold transition-all"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy Text"}
                    </button>
                </div>

                {/* The Document Paper */}
                <div className="bg-slate-100 text-slate-900 p-8 md:p-12 rounded-xl shadow-2xl font-serif leading-relaxed whitespace-pre-wrap selection:bg-emerald-200 selection:text-emerald-900">
                    {data.final_text}
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Status Bar */}
            {statusMessage && (
                <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 p-2 text-center text-sm font-medium text-emerald-300 animate-in fade-in">
                    {statusMessage}
                </div>
            )}

            {/* 2. Main Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
                {history.map((msg, idx) => {
                    const isLast = idx === history.length - 1;
                    // Only show the last "active" card, unless it's the final output
                    // or we want to keep history visible (optional, keeping history visible for context is usually better)
                    if (!isLast && msg.type !== 'final') return null;

                    switch (msg.type) {
                        case 'strategy_options': return renderEditor(msg);
                        case 'spec_options': return renderLinguist(msg);
                        case 'blueprint': return renderManuscript(msg);
                        case 'critique': return renderCritic(msg);
                        case 'final': return renderPublication(msg);
                        default: return null;
                    }
                })}

                {loading && (
                    <div className="flex justify-center p-8 animate-in fade-in">
                        <Loader size={32} className="animate-spin text-emerald-500" />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* 3. Manager Drawer */}
            <ManagerDrawer
                isOpen={isDrawerOpen}
                setIsOpen={setIsDrawerOpen}
                messages={managerMessages}
                onSendMessage={handleManagerFeedback}
                loading={loading}
            />
        </div>
    );
};

export default TextFeed;
