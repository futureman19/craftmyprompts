import React, { useRef, useEffect } from 'react';
import { Loader, Copy, CheckCircle2, Clapperboard, Film, FileVideo } from 'lucide-react';

// --- IMPORT AGENT DECKS (Video Specific) ---
import ProducerDeck from '../agent/video/ProducerDeck.jsx'; // "The Producer"
import DirectorDeck from '../agent/video/DirectorDeck.jsx'; // "The Director"

const VideoFeed = ({ history, loading, statusMessage, actions, currentPhase }) => {

    const bottomRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading, currentPhase]);

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    const producerRole = 'The Producer';
    const directorRole = 'The Director';
    const vfxRole = 'The VFX Artist';

    const producerMsg = history.findLast(m => m.role === producerRole);
    const directorMsg = history.findLast(m => m.role === directorRole);
    const vfxMsg = history.findLast(m => m.role === vfxRole);

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

    // PHASE 1: CONCEPT (Producer)
    const renderConcept = () => {
        const data = parseAgentJson(producerMsg, producerRole);
        if (!data) return <div className="text-purple-400 p-4 font-mono text-sm border border-purple-900/50 rounded bg-purple-900/10">Waiting for {producerRole}...</div>;
        return <ProducerDeck data={data} onConfirm={actions.submitConcept} />;
    };

    // PHASE 2: SPECS (Director)
    const renderSpecs = () => {
        const data = parseAgentJson(directorMsg, directorRole);
        if (!data) return <div className="text-pink-400 p-4 font-mono text-sm border border-pink-900/50 rounded bg-pink-900/10">Waiting for {directorRole}...</div>;
        return <DirectorDeck data={data} onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: FINAL RENDER (VFX)
    const renderFinal = () => {
        const data = parseAgentJson(vfxMsg, vfxRole);
        if (!data) return null;

        const handleCopy = () => {
            if (data.final_prompt) {
                navigator.clipboard.writeText(data.final_prompt);
            }
        };

        return (
            <div className="w-full max-w-4xl mx-auto mt-6 animate-in zoom-in-50 duration-500">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">

                    {/* Glow Effects */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-1000" />

                    <div className="p-8 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-500/10">
                                <FileVideo size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">VFX Synthesis Complete</h2>
                                <p className="text-indigo-400 font-medium">{data.synthesis_summary}</p>
                            </div>
                        </div>

                        {/* Tech Specs */}
                        {data.tech_specs && (
                            <div className="flex gap-4 mb-6">
                                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">
                                    FPS: <span className="text-white">{data.tech_specs.fps}</span>
                                </div>
                                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">
                                    Motion Bucket: <span className="text-white">{data.tech_specs.motion_bucket_id}</span>
                                </div>
                            </div>
                        )}

                        {/* Final Prompt Box */}
                        <div className="bg-black/50 rounded-xl p-6 border border-indigo-500/30 backdrop-blur-sm relative group/code">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Film size={12} /> Generation Prompt
                            </h3>
                            <p className="text-indigo-100 leading-relaxed font-mono text-sm">
                                {data.final_prompt}
                            </p>

                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg opacity-0 group-hover/code:opacity-100 transition-all shadow-lg"
                                title="Copy to Clipboard"
                            >
                                <Copy size={16} />
                            </button>
                        </div>

                        {/* Success Footer */}
                        <div className="mt-8 flex items-center gap-3 text-emerald-400 bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 size={20} />
                            <span className="font-medium">Ready for rendering in Stable Video Diffusion.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex justify-center pb-32">
            <div className="w-full max-w-5xl px-4 md:px-0">
                <div className="space-y-12 py-8">

                    {/* RENDER HISTORY */}
                    {/* We could render chat bubbles here if desired, but adhering to the Deck flow mostly */}

                    {/* PHASE 1: CONCEPT */}
                    {(currentPhase === 'concept' || history.some(m => m.role === producerRole)) && renderConcept()}

                    {/* PHASE 2: SPECS */}
                    {(currentPhase === 'specs' || history.some(m => m.role === directorRole)) && renderSpecs()}

                    {/* PHASE 3: FINAL */}
                    {(currentPhase === 'rendering' || currentPhase === 'done') && renderFinal()}

                    {/* LOADING INDICATOR */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                                <div className="relative bg-slate-900 p-4 rounded-full border border-slate-800 shadow-2xl">
                                    <Loader className="animate-spin text-indigo-500" size={32} />
                                </div>
                            </div>
                            <p className="mt-6 text-slate-400 font-medium animate-pulse">{statusMessage}</p>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
};

export default VideoFeed;
