import React, { useState, useEffect, useRef } from 'react';
import { Loader, Palette, Terminal } from 'lucide-react';
import { useArtHive } from '../../hooks/hives/useArtHive';

// Art Components
import MuseDeck from '../agent/art/MuseDeck';
import StylistDeck from '../agent/art/StylistDeck';
import ArtBlueprint from '../agent/art/ArtBlueprint';
import ArtManifest from '../agent/art/ArtManifest'; // <--- NEW IMPORT

// Shared/Global Components
import ManagerDrawer from '../hivemind/ManagerDrawer';

const ArtFeed = ({ initialPrompt, onStateChange }) => {
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, sendToAudit, generateImage,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback,
        generatedImage, isGeneratingImage
    } = useArtHive();

    const [hasStarted, setHasStarted] = useState(false);
    const [technicalSpecs, setTechnicalSpecs] = useState({});

    // --- MANIFEST STATE (For Right Sidebar) ---
    const [manifest, setManifest] = useState({
        strategy: null,
        style: null,
        technical: null,
        generated: false
    });

    const bottomRef = useRef(null);

    // Initial Start
    useEffect(() => {
        if (initialPrompt && !hasStarted) {
            startMission(initialPrompt);
            setHasStarted(true);
        }
    }, [initialPrompt]);

    // Phase Change Notify
    useEffect(() => {
        onStateChange && onStateChange(currentPhase);
    }, [currentPhase]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- INTERCEPTORS (To update Manifest) ---
    const handleStrategySelect = (choices) => {
        // choices is now { genre: "...", environment: "...", style: "..." }

        // 1. Format the string for the Chat History / Context
        const formattedChoice = `Genre: ${choices.genre}, Environment: ${choices.environment}, Style: ${choices.style}`;

        // 2. Update Manifest (We can now show all 3 details!)
        setManifest(prev => ({
            ...prev,
            strategy: choices.genre, // Main Concept
            environment: choices.environment, // Extra detail
            visual_style: choices.style // Extra detail
        }));

        // 3. Send formatted string to the Agent Logic
        submitChoices(formattedChoice);
    };

    const handleStyleSelect = (choice) => {
        setManifest(prev => ({ ...prev, style: choice || "Auto-Pilot" }));
        submitSpecs(choice);
    };

    const handleTechnicalChange = (specs) => {
        setTechnicalSpecs(specs);
        setManifest(prev => ({ ...prev, technical: specs }));
    };

    const handleGeneration = async (specs) => {
        await generateImage(specs);
        setManifest(prev => ({ ...prev, generated: true }));
    };

    // --- PARSER ---
    const parseAgentJson = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return null;
        }
    };

    // --- RENDERERS (Updated for Full Width) ---

    const renderMuse = (msg) => {
        const data = parseAgentJson(msg);
        // Pass the interceptor, not the raw hook function
        return <MuseDeck data={data} onConfirm={handleStrategySelect} />;
    };

    const renderStylist = (msg) => {
        const data = parseAgentJson(msg);
        return <StylistDeck data={data} onConfirm={handleStyleSelect} />;
    };

    const renderBlueprint = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <div className="w-full space-y-4 animate-in fade-in pb-12">
                <ArtBlueprint
                    data={data}
                    onSettingsChange={handleTechnicalChange}
                />

                {!loading && currentPhase === 'cinematographer' && (
                    <div className="flex justify-start gap-3">
                        <button
                            onClick={() => handleGeneration(technicalSpecs)}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                        >
                            Generate Masterpiece
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderGallery = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_prompt) return null;

        return (
            <div className="w-full mt-4 animate-in slide-in-from-bottom-4 relative pb-20">
                {/* Image Frame */}
                <div className="bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative min-h-[400px] flex items-center justify-center">
                    {isGeneratingImage && (
                        <div className="text-center space-y-4">
                            <Loader size={32} className="animate-spin text-purple-500 mx-auto" />
                            <p className="text-purple-400 font-mono text-xs animate-pulse">Developing...</p>
                        </div>
                    )}
                    {generatedImage && (
                        <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                    )}
                </div>
            </div>
        );
    };

    // --- MAIN LAYOUT ---
    return (
        <div className="flex h-full overflow-hidden bg-slate-950">

            {/* CENTER: THE WORKSPACE (Scrollable Feed) */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Status Bar - ONLY show when loading (Reclaims space when deck is visible) */}
                {statusMessage && loading && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-1.5 px-4 text-xs font-mono text-purple-300 animate-in fade-in">
                        {statusMessage}
                    </div>
                )}

                {/* Feed Content */}
                {/* CHANGED: Removed 'p-6' padding. Added 'flex flex-col' to ensure full height usage. */}
                <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-950 flex flex-col">

                    {/* CHANGED: Removed 'pt-6' and 'max-w-5xl'. Now it's full width and flush top. */}
                    <div className="w-full flex-1 flex flex-col h-full">
                        {history.map((msg, idx) => {
                            const isLast = idx === history.length - 1;

                            // Only render the active deck to save memory/space
                            if (!isLast && msg.type !== 'final') return null;

                            switch (msg.type) {
                                case 'strategy_options': return renderMuse(msg);
                                case 'spec_options': return renderStylist(msg);
                                case 'blueprint': return renderBlueprint(msg);
                                case 'final': return renderGallery(msg);
                                default: return null;
                            }
                        })}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Manager Drawer (Overlay) */}
                <ManagerDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    messages={managerMessages}
                    onSendMessage={handleManagerFeedback}
                    loading={loading}
                />
            </div>

            {/* RIGHT: THE MANIFEST (Fixed Sidebar) */}
            <ArtManifest manifest={manifest} currentPhase={currentPhase} />

        </div>
    );
};

export default ArtFeed;
