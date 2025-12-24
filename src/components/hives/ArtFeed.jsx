import React, { useState, useEffect, useRef } from 'react';
import { Loader, Palette, ShieldCheck, Zap, Terminal } from 'lucide-react';
import { useArtHive } from '../../hooks/hives/useArtHive';

// Art Components
import MuseDeck from '../agent/art/MuseDeck';
import StylistDeck from '../agent/art/StylistDeck';
import ArtBlueprint from '../agent/art/ArtBlueprint';
import ArtCriticDeck from '../agent/art/ArtCriticDeck';
// Shared/Global Components
import ManagerDrawer from '../hivemind/ManagerDrawer';

const ArtFeed = ({ initialPrompt, onStateChange }) => {
    // 1. Initialize the Art Brain
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, sendToAudit, refineBlueprint, generateImage,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback
    } = useArtHive();

    const [hasStarted, setHasStarted] = useState(false);
    const bottomRef = useRef(null);

    // Start mission on first load
    useEffect(() => {
        if (initialPrompt && !hasStarted) {
            startMission(initialPrompt);
            setHasStarted(true);
        }
    }, [initialPrompt]);

    // Notify parent layout of phase changes (for UI polish)
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
            // Handle potential markdown wrapping
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) {
            console.error("JSON Parse Error in Feed:", e);
            return null;
        }
    };

    // --- RENDERERS FOR EACH PHASE ---

    // PHASE 1: MUSE (Strategy)
    const renderMuse = (msg) => {
        const data = parseAgentJson(msg);
        return <MuseDeck data={data} onConfirm={submitChoices} />;
    };

    // PHASE 2: STYLIST (Specs)
    const renderStylist = (msg) => {
        const data = parseAgentJson(msg);
        return <StylistDeck data={data} onConfirm={submitSpecs} />;
    };

    // PHASE 3: CINEMATOGRAPHER (Blueprint)
    const renderBlueprint = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in">
                {/* The Visual Layer Stack */}
                <ArtBlueprint data={data} />

                {/* Action Buttons (Fast Lane vs Audit) */}
                {!loading && currentPhase === 'cinematographer' && (
                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            onClick={sendToAudit}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                        >
                            <ShieldCheck size={18} /> Send to Visual Audit
                        </button>

                        <button
                            onClick={generateImage}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
                        >
                            <Zap size={18} /> Approve & Generate
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: CRITIC (Audit)
    const renderCritic = (msg) => {
        const data = parseAgentJson(msg);
        return <ArtCriticDeck data={data} onConfirm={refineBlueprint} />;
    };

    // PHASE 5: GALLERY (Final Output)
    const renderGallery = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_prompt) return null;

        return (
            <div className="w-full max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl -z-10" />
                <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/50 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                            <Terminal size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Final Generation Prompt</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 italic">{data.synthesis_summary}</p>

                    {/* The Final Prompt Box */}
                    <div className="bg-black/50 p-4 rounded-xl border border-slate-700 font-mono text-sm text-purple-100 whitespace-pre-wrap select-all">
                        {data.final_prompt}
                    </div>

                    <div className="mt-4 text-center text-xs text-slate-500">
                        Ready for DALL-E 3 / Midjourney. Copy the prompt above.
                    </div>
                </div>
            </div>
        );
    };


    // --- MAIN RENDER ---
    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Status Bar (Sticky Top) */}
            {statusMessage && (
                <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 p-2 text-center text-sm font-medium text-purple-300 animate-in fade-in">
                    {statusMessage}
                </div>
            )}

            {/* 2. Main Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
                {history.map((msg, idx) => {
                    // We only render the *last* message of the current phase to avoid clutter
                    const isLast = idx === history.length - 1;
                    if (!isLast && msg.type !== 'final') return null;

                    switch (msg.type) {
                        case 'strategy_options': return renderMuse(msg);
                        case 'spec_options': return renderStylist(msg);
                        case 'blueprint': return renderBlueprint(msg);
                        case 'critique': return renderCritic(msg);
                        case 'final': return renderGallery(msg);
                        default: return null;
                    }
                })}

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center p-8 animate-in fade-in">
                        <Loader size={32} className="animate-spin text-purple-500" />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* 3. Manager Drawer (Global Co-Pilot) */}
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

export default ArtFeed;
