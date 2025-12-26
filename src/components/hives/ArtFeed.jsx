import React, { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import { useArtHive } from '../../hooks/hives/useArtHive';

// Art Components
import MuseDeck from '../agent/art/MuseDeck';
import StylistDeck from '../agent/art/StylistDeck';
import ArtBlueprint from '../agent/art/ArtBlueprint';
import ArtManifest from '../agent/art/ArtManifest';

// Shared
import ManagerDrawer from '../hivemind/ManagerDrawer';

const ArtFeed = ({ initialPrompt, onStateChange }) => {
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, generateImage,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback,
        generatedImage, isGeneratingImage
    } = useArtHive();

    const [hasStarted, setHasStarted] = useState(false);
    const [technicalSpecs, setTechnicalSpecs] = useState({});

    // --- MANIFEST STATE (Persistent Project Data) ---
    const [manifest, setManifest] = useState({
        strategy: null,     // Genre
        environment: null,  // Env
        visual_style: null, // Visual Style
        style: null,        // Aggregate Stylist choice
        technical: null,    // Blueprint specs
        generated: false
    });

    // --- DRAFT STATE (Temporary selections per phase) ---
    const [draftSelections, setDraftSelections] = useState({});

    // Reset draft when phase changes (e.g. going from Muse -> Stylist)
    useEffect(() => {
        setDraftSelections({});
    }, [currentPhase]);

    const bottomRef = useRef(null);

    // Initial Start
    useEffect(() => {
        if (initialPrompt && !hasStarted) {
            startMission(initialPrompt);
            setHasStarted(true);
        }
    }, [initialPrompt]);

    useEffect(() => {
        onStateChange && onStateChange(currentPhase);
    }, [currentPhase]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- PARSER ---
    const parseAgentJson = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) { return null; }
    };

    // --- INTERCEPTORS (The Logic Glue) ---

    // 1. Handle Card Clicks (Updates temporary draft)
    const handleDraftSelect = (key, value) => {
        setDraftSelections(prev => ({ ...prev, [key]: value }));
    };

    // 2. Handle Manifest "Continue" Button
    const handleSidebarConfirm = () => {
        const choices = draftSelections;

        // PHASE 1: THE MUSE (Strategy)
        if (currentPhase === 'strategy' || currentPhase === 'muse') {
            const formatted = `Genre: ${choices.genre}, Environment: ${choices.environment}, Style: ${choices.style}`;

            setManifest(prev => ({
                ...prev,
                strategy: choices.genre,
                environment: choices.environment,
                visual_style: choices.style
            }));
            submitChoices(formatted);
        }
        // PHASE 2: THE STYLIST (Specs)
        else if (currentPhase === 'spec' || currentPhase === 'stylist' || currentPhase === 'styling') {
            const formatted = `Material: ${choices.material}, Lighting: ${choices.lighting}, Palette: ${choices.color}`;

            setManifest(prev => ({
                ...prev,
                style: `${choices.material} + ${choices.lighting}` // Simple summary for sidebar
            }));
            submitSpecs(formatted);
        }
    };

    // 3. Handle Manifest "Auto-Pilot" Button
    const handleAutoPilot = () => {
        const activeMsg = history[history.length - 1];
        if (!activeMsg) return;

        const data = parseAgentJson(activeMsg);
        if (!data) return;

        const randoms = {};

        // Helper to pick randoms
        const pickRandom = (keyArr, targetKey) => { // targetKey needed to map to draftSelections keys
            const arr = data[keyArr] || [];
            if (arr.length) {
                const choice = arr[Math.floor(Math.random() * arr.length)];
                const label = choice.label || choice.title;
                randoms[targetKey] = label;
            }
        };

        if (currentPhase === 'strategy' || currentPhase === 'muse') {
            pickRandom('genre_options', 'genre');
            pickRandom('environment_options', 'environment');
            pickRandom('style_options', 'style');
        }
        else if (currentPhase === 'spec' || currentPhase === 'stylist' || currentPhase === 'styling') {
            pickRandom('material_options', 'material');
            pickRandom('lighting_options', 'lighting');
            pickRandom('color_options', 'color');
        }

        setDraftSelections(randoms);
    };

    // 4. Validate Readiness (Enables/Disables "Continue" button)
    const checkIsReady = () => {
        if (currentPhase === 'strategy' || currentPhase === 'muse') {
            return draftSelections.genre && draftSelections.environment && draftSelections.style;
        }
        if (currentPhase === 'spec' || currentPhase === 'stylist' || currentPhase === 'styling') {
            return draftSelections.material && draftSelections.lighting && draftSelections.color;
        }
        return false;
    };

    // --- RENDERERS ---

    const renderMuse = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <MuseDeck
                data={data}
                selections={draftSelections}
                onSelect={handleDraftSelect}
            />
        );
    };

    const renderStylist = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <StylistDeck
                data={data}
                selections={draftSelections}
                onSelect={handleDraftSelect}
            />
        );
    };

    const renderBlueprint = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <div className="w-full h-full p-4 overflow-y-auto">
                <ArtBlueprint
                    data={data}
                    onSettingsChange={(specs) => {
                        setTechnicalSpecs(specs);
                        setManifest(prev => ({ ...prev, technical: specs }));
                    }}
                />
                <div className="mt-4 pb-20">
                    <button
                        onClick={() => {
                            generateImage(technicalSpecs);
                            setManifest(prev => ({ ...prev, generated: true }));
                        }}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-transform"
                    >
                        Generate Masterpiece
                    </button>
                </div>
            </div>
        );
    };

    const renderGallery = (msg) => {
        const data = parseAgentJson(msg);
        if (!data || !data.final_prompt) return null;
        return (
            <div className="w-full h-full p-6 flex items-center justify-center pb-20">
                <div className="bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative w-full max-w-2xl aspect-square flex items-center justify-center group">
                    {isGeneratingImage && (
                        <div className="text-center space-y-4">
                            <Loader size={32} className="animate-spin text-purple-500 mx-auto" />
                            <p className="text-purple-400 font-mono text-xs animate-pulse">Developing...</p>
                        </div>
                    )}
                    {generatedImage && (
                        <>
                            <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-slate-300 line-clamp-2">{data.final_prompt}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">

            {/* LEFT COLUMN: Workspace + Manager */}
            {/* We use flex-col here so the Deck and Manager stack vertically */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">

                {/* 1. STATUS BAR */}
                {statusMessage && loading && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-1.5 px-4 text-xs font-mono text-purple-300 animate-in fade-in">
                        {statusMessage}
                    </div>
                )}

                {/* 2. SCROLLABLE DECK AREA */}
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    {history.map((msg, idx) => {
                        const isLast = idx === history.length - 1;
                        // Performance: Only render the active deck
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

                {/* 3. MANAGER DRAWER (Docked at bottom of Left Column) */}
                <ManagerDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    messages={managerMessages}
                    onSendMessage={handleManagerFeedback}
                    loading={loading}
                />

            </div>

            {/* RIGHT COLUMN: The Manifest (Now Unobstructed!) */}
            <ArtManifest
                manifest={manifest}
                currentPhase={currentPhase}
                onConfirm={handleSidebarConfirm}
                onAutoPilot={handleAutoPilot}
                isReady={checkIsReady()}
            />

        </div>
    );
};

export default ArtFeed;
