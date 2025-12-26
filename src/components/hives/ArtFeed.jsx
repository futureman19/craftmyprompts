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

    // --- MANIFEST & SELECTION STATE ---
    const [manifest, setManifest] = useState({
        strategy: null,
        environment: null,
        visual_style: null,
        style: null,
        technical: null,
        generated: false
    });

    // Temporary storage for selections BEFORE user clicks Confirm in Sidebar
    const [draftSelections, setDraftSelections] = useState({});

    // Reset draft when phase changes
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

    // --- INTERCEPTORS ---

    // 1. Called when user clicks a Card in the Deck
    const handleDraftSelect = (key, value) => {
        setDraftSelections(prev => ({ ...prev, [key]: value }));
    };

    // 2. Called when user clicks "Continue" in Manifest Sidebar
    const handleSidebarConfirm = () => {
        if (currentPhase === 'strategy') {
            // Processing Muse Selections
            const choices = draftSelections;
            const formatted = `Genre: ${choices.genre}, Environment: ${choices.environment}, Style: ${choices.style}`;

            setManifest(prev => ({
                ...prev,
                strategy: choices.genre,
                environment: choices.environment,
                visual_style: choices.style
            }));
            submitChoices(formatted);
        }
        else if (currentPhase === 'spec') {
            // Processing Stylist Selections (Simple single choice for now, or expand later)
            const choice = Object.values(draftSelections)[0]; // Fallback if Stylist isn't multi-deck yet
            setManifest(prev => ({ ...prev, style: choice }));
            submitSpecs(choice);
        }
    };

    // 3. Called when user clicks "Auto-Pilot" in Manifest Sidebar
    const handleAutoPilot = () => {
        // Find the active message data
        const activeMsg = history[history.length - 1];
        if (!activeMsg) return;

        const data = parseAgentJson(activeMsg);
        if (!data) return;

        if (currentPhase === 'strategy') {
            // Randomly pick for Muse
            const randoms = {};
            ['genre_options', 'environment_options', 'style_options'].forEach(key => {
                const arr = data[key] || [];
                if (arr.length) {
                    const choice = arr[Math.floor(Math.random() * arr.length)];
                    // key is "genre_options", we need "genre"
                    const shortKey = key.replace('_options', '');
                    const label = choice.label || choice.title;
                    randoms[shortKey] = label;
                }
            });
            setDraftSelections(randoms);
        }
    };

    // Helper: Validate if we are ready to continue
    const checkIsReady = () => {
        if (currentPhase === 'strategy') {
            return draftSelections.genre && draftSelections.environment && draftSelections.style;
        }
        if (currentPhase === 'spec') {
            // Stylist might not be updated to multi-deck yet, so assume > 0 keys
            return Object.keys(draftSelections).length > 0;
        }
        return false;
    };

    // --- PARSER ---
    const parseAgentJson = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) { return null; }
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
        // StylistDeck needs similar update to accept props, but for now we pass basics
        // If StylistDeck isn't updated, this might break. 
        // For now, let's assume StylistDeck is NEXT on the todo list.
        return <StylistDeck data={data} onConfirm={(c) => handleDraftSelect('style', c)} />;
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
                <div className="mt-4">
                    <button
                        onClick={() => {
                            generateImage(technicalSpecs);
                            setManifest(prev => ({ ...prev, generated: true }));
                        }}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg"
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
            <div className="w-full h-full p-6 flex items-center justify-center">
                <div className="bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative w-full max-w-2xl aspect-square flex items-center justify-center">
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

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">

            {/* CENTER: THE WORKSPACE */}
            <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-950 flex flex-col relative">

                {statusMessage && loading && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-1.5 px-4 text-xs font-mono text-purple-300">
                        {statusMessage}
                    </div>
                )}

                <div className="w-full flex-1 flex flex-col h-full">
                    {history.map((msg, idx) => {
                        const isLast = idx === history.length - 1;
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

                <ManagerDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    messages={managerMessages}
                    onSendMessage={handleManagerFeedback}
                    loading={loading}
                />
            </div>

            {/* RIGHT: THE MANIFEST (Fixed Sidebar + Controls) */}
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
