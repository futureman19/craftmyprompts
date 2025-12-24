import React, { useState, useEffect, useRef } from 'react';
import { Loader, Video, Clapperboard, Film, Copy, Check, Sparkles } from 'lucide-react';
import { useVideoHive } from '../../hooks/hives/useVideoHive';

// Video Components
import ProducerDeck from '../agent/video/ProducerDeck';
import DirectorDeck from '../agent/video/DirectorDeck';

// Shared/Global Components
import ManagerDrawer from '../hivemind/ManagerDrawer';

const VideoFeed = ({ initialPrompt, onStateChange }) => {
    // 1. Initialize the Video Brain
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback
    } = useVideoHive();

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

    // PHASE 1: PRODUCER (Concept)
    const renderProducer = (msg) => {
        const data = parseAgentJson(msg);
        return <ProducerDeck data={data} onConfirm={submitChoices} />;
    };

    // PHASE 2: DIRECTOR (Visuals)
    const renderDirector = (msg) => {
        const data = parseAgentJson(msg);
        return <DirectorDeck data={data} onConfirm={submitSpecs} />;
    };

    // PHASE 3: VFX ARTIST (Final Prompt Output)
    const renderVFX = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_prompt) return null;

        return (
            <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Production Ready</h3>
                            <p className="text-xs text-slate-400">{data.synthesis_summary}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCopy(data.final_prompt)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-amber-600 hover:text-white rounded-lg text-slate-400 text-xs font-bold transition-all"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy Prompt"}
                    </button>
                </div>

                {/* The Prompt Terminal */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 transition-opacity opacity-50 group-hover:opacity-100" />

                    <div className="flex items-center gap-2 mb-4 opacity-50">
                        <Film size={16} className="text-amber-500" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
                            Gen-3 / Luma / Sora Protocol
                        </span>
                    </div>

                    <div className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.final_prompt}
                    </div>

                    {/* Footer Hint */}
                    <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center">
                        <span className="text-[10px] text-slate-600">
                            Ready for rendering.
                        </span>
                        <div className="flex gap-2">
                            <a href="https://runwayml.com/" target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-slate-900 rounded text-slate-500 hover:text-white transition-colors">
                                Open Runway
                            </a>
                            <a href="https://lumalabs.ai/" target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-slate-900 rounded text-slate-500 hover:text-white transition-colors">
                                Open Luma
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Status Bar */}
            {statusMessage && (
                <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 p-2 text-center text-sm font-medium text-amber-300 animate-in fade-in">
                    {statusMessage}
                </div>
            )}

            {/* 2. Main Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
                {history.map((msg, idx) => {
                    const isLast = idx === history.length - 1;
                    if (!isLast && msg.type !== 'final') return null;

                    switch (msg.type) {
                        case 'strategy_options': return renderProducer(msg);
                        case 'spec_options': return renderDirector(msg);
                        case 'final': return renderVFX(msg);
                        default: return null;
                    }
                })}

                {loading && (
                    <div className="flex justify-center p-8 animate-in fade-in">
                        <Loader size={32} className="animate-spin text-amber-500" />
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

export default VideoFeed;
