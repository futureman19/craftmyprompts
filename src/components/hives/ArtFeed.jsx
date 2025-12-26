import React, { useState, useEffect, useRef } from 'react';
import { Loader, Copy, Check, Download, Terminal } from 'lucide-react'; // Added Copy, Check, Download, Terminal
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
    const [copied, setCopied] = useState(false); // UI state for copy button feedback

    // --- MANIFEST & SELECTION STATE ---
    const [manifest, setManifest] = useState({
        strategy: null,
        environment: null,
        visual_style: null,
        style: null,
        technical: null,
        generated: false
    });

    // --- DRAFT STATE ---
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

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- HELPERS ---
    const parseAgentJson = (msg) => {
        if (!msg || !msg.content) return null;
        try {
            const clean = msg.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
        } catch (e) { return null; }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async (imageUrl) => {
        try {
            // Fetch Blob to force download
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Timestamped filename
            link.download = `hivemind-art-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed, falling back to open:", err);
            window.open(imageUrl, '_blank');
        }
    };

    // --- INTERCEPTORS ---

    // 1. Handle Card Clicks
    const handleDraftSelect = (key, value) => {
        setDraftSelections(prev => ({ ...prev, [key]: value }));
    };

    // 2. Handle Manifest "Continue" Button
    const handleSidebarConfirm = () => {
        const choices = draftSelections;

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
        else if (currentPhase === 'spec' || currentPhase === 'stylist' || currentPhase === 'styling') {
            const formatted = `Material: ${choices.material}, Lighting: ${choices.lighting}, Palette: ${choices.color}`;

            setManifest(prev => ({
                ...prev,
                style: `${choices.material} + ${choices.lighting}`
            }));
            submitSpecs(formatted);
        }
        else if (currentPhase === 'scribe' || currentPhase === 'blueprint' || currentPhase === 'cinematographer') {
            generateImage(technicalSpecs);
            setManifest(prev => ({ ...prev, generated: true }));
        }
    };

    // 3. Handle Manifest "Auto-Pilot" Button
    const handleAutoPilot = () => {
        const activeMsg = history[history.length - 1];
        if (!activeMsg) return;

        const data = parseAgentJson(activeMsg);
        if (!data) return;

        const randoms = {};
        const pickRandom = (keyArr, targetKey) => {
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

    // 4. Validate Readiness
    const checkIsReady = () => {
        if (currentPhase === 'strategy' || currentPhase === 'muse') {
            return draftSelections.genre && draftSelections.environment && draftSelections.style;
        }
        if (currentPhase === 'spec' || currentPhase === 'stylist' || currentPhase === 'styling') {
            return draftSelections.material && draftSelections.lighting && draftSelections.color;
        }
        if (currentPhase === 'scribe' || currentPhase === 'blueprint' || currentPhase === 'cinematographer') {
            return true;
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
            <div className="w-full h-full p-4 overflow-hidden animate-in fade-in">
                <ArtBlueprint
                    data={data}
                    onSettingsChange={(specs) => {
                        setTechnicalSpecs(specs);
                        setManifest(prev => ({ ...prev, technical: specs }));
                    }}
                />
            </div>
        );
    };

    // --- UPDATED RENDER GALLERY ---
    const renderGallery = (msg) => {
        const data = parseAgentJson(msg);
        // Note: data.final_prompt might be empty if the generation failed, so we check generatedImage too
        if (!isGeneratingImage && !generatedImage) return null;
        const promptText = data?.final_prompt || "Prompt unavailable.";

        return (
            <div className="w-full h-full p-4 flex flex-col gap-4 pb-20 overflow-y-auto animate-in slide-in-from-bottom-4">

                {/* 1. IMAGE CONTAINER (with Download Button) */}
                <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl w-full shrink-0 flex items-center justify-center group min-h-[300px]">
                    {isGeneratingImage && (
                        <div className="text-center space-y-4">
                            <Loader size={32} className="animate-spin text-purple-500 mx-auto" />
                            <p className="text-purple-400 font-mono text-xs animate-pulse">Developing Masterpiece...</p>
                        </div>
                    )}
                    {generatedImage && (
                        <>
                            <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                            {/* Download Button Overlay */}
                            <button
                                onClick={() => handleDownload(generatedImage)}
                                className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur rounded-full text-slate-300 hover:text-white hover:bg-purple-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Download Image"
                            >
                                <Download size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* 2. PROMPT CONTAINER (with Copy Button) */}
                {!isGeneratingImage && generatedImage && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shrink-0">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-900">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Terminal size={16} />
                                <h4 className="text-xs font-bold uppercase tracking-wider">Final Prompt</h4>
                            </div>
                            <button
                                onClick={() => handleCopy(promptText)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {promptText}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">

            {/* LEFT COLUMN: Workspace + Manager */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">

                {statusMessage && loading && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-1.5 px-4 text-xs font-mono text-purple-300 animate-in fade-in">
                        {statusMessage}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
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

            {/* RIGHT COLUMN: The Manifest */}
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
