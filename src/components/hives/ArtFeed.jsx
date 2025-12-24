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
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback,
        generatedImage, isGeneratingImage
    } = useArtHive();

    const [hasStarted, setHasStarted] = useState(false);
    const bottomRef = useRef(null);

    // NEW: Track Technical Specs from the Blueprint UI
    const [technicalSpecs, setTechnicalSpecs] = useState({});

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
    }, [history, loading, isGeneratingImage, generatedImage]);

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

    // --- RENDERERS ---

    // PHASE 1: MUSE
    const renderMuse = (msg) => {
        const data = parseAgentJson(msg);
        return <MuseDeck data={data} onConfirm={submitChoices} />;
    };

    // PHASE 2: STYLIST
    const renderStylist = (msg) => {
        const data = parseAgentJson(msg);
        return <StylistDeck data={data} onConfirm={submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (With Technical Controls)
    const renderBlueprint = (msg) => {
        const data = parseAgentJson(msg);

        return (
            <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in">
                {/* The Visual Layer Stack + Controls */}
                {/* We listen for settings changes here */}
                <ArtBlueprint
                    data={data}
                    onSettingsChange={setTechnicalSpecs}
                />

                {/* Action Buttons */}
                {!loading && currentPhase === 'cinematographer' && (
                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            onClick={sendToAudit}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                        >
                            <ShieldCheck size={18} /> Send to Visual Audit
                        </button>

                        <button
                            // PASS THE SPECS TO THE GENERATOR
                            onClick={() => generateImage(technicalSpecs)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
                        >
                            <Zap size={18} /> Approve & Generate
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // PHASE 4: CRITIC
    const renderCritic = (msg) => {
        const data = parseAgentJson(msg);
        return <ArtCriticDeck data={data} onConfirm={refineBlueprint} />;
    };

    // PHASE 5: GALLERY (Final Output + Image)
    const renderGallery = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_prompt) return null;

        return (
            <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4 relative pb-20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

                {/* 1. THE IMAGE FRAME */}
                <div className="mb-6 bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative min-h-[300px] flex items-center justify-center group">

                    {/* A. Loading State */}
                    {isGeneratingImage && (
                        <div className="text-center space-y-4">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                            <p className="text-purple-400 font-mono text-xs animate-pulse">
                                Developing Negative...
                            </p>
                        </div>
                    )}

                    {/* B. The Masterpiece */}
                    {generatedImage && (
                        <div className="relative w-full h-full flex justify-center bg-zinc-950">
                            <img
                                src={generatedImage}
                                alt="Generated Masterpiece"
                                className="w-auto h-auto max-w-full max-h-[600px] object-contain animate-in fade-in duration-1000 shadow-2xl"
                            />
                            {/* Download Action */}
                            <a
                                href={generatedImage}
                                download={`hivemind-art-${Date.now()}.png`}
                                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur hover:bg-white text-white hover:text-black rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Download Image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            </a>
                        </div>
                    )}

                    {/* C. Placeholder */}
                    {!generatedImage && !isGeneratingImage && (
                        <div className="text-slate-600 flex flex-col items-center">
                            <Palette size={48} className="mb-2 opacity-20" />
                            <span className="text-xs">Waiting for prompt approval...</span>
                        </div>
                    )}
                </div>

                {/* 2. THE PROMPT CONSOLE */}
                <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/30 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                            <Terminal size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Prompt Console</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 italic">"{data.synthesis_summary}"</p>

                    <div className="bg-black/80 p-4 rounded-xl border border-slate-700 font-mono text-xs text-purple-100 whitespace-pre-wrap select-all">
                        {data.final_prompt}
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
                <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 p-2 text-center text-sm font-medium text-purple-300 animate-in fade-in">
                    {statusMessage}
                </div>
            )}

            {/* 2. Main Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar">
                {history.map((msg, idx) => {
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

                {loading && (
                    <div className="flex justify-center p-8 animate-in fade-in">
                        <Loader size={32} className="animate-spin text-purple-500" />
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

export default ArtFeed;
