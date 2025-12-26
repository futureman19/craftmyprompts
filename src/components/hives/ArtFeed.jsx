import React, { useState, useEffect, useRef } from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

import ArtManifest from '../agent/art/ArtManifest';
import MuseDeck from '../agent/art/MuseDeck';
import CinemaDeck from '../agent/art/CinemaDeck';
import CompositionDeck from '../agent/art/CompositionDeck';
import GalleryDeck from '../agent/art/GalleryDeck'; // Assuming these exist or will be placeholders

import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

const ArtFeed = ({
    history,
    loading,
    statusMessage,
    actions,
    currentPhase,
    managerMessages,
    isDrawerOpen,
    setIsDrawerOpen,
    handleManagerFeedback
}) => {

    // --- STATE ---
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    // --- FIND MESSAGES ---
    const visionRole = 'The Muse';
    const specsRole = 'The Cinematographer';
    const blueRole = 'The Stylist';
    const finalRole = 'The Gallery';

    const visionMsg = history.findLast(m => m.role === visionRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const blueMsg = history.findLast(m => m.role === blueRole);
    const finalMsg = history.findLast(m => m.role === finalRole);

    // --- SCROLL TO BOTTOM ---
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    // --- RESET DRAFTS ON PHASE CHANGE ---
    useEffect(() => {
        setDraftSelections({});
    }, [currentPhase]);

    // --- AUTO-UPDATE MANIFEST PROGRESS ---
    useEffect(() => {
        if (blueMsg) setManifest(prev => ({ ...prev, blueprint: "Composition Locked" }));
        if (finalMsg) setManifest(prev => ({ ...prev, final: "Masterpiece Rendered" }));
    }, [blueMsg, finalMsg]);

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
        } catch (e) { console.error(`${contextName} Parse Error:`, e); }
        return null;
    };

    // --- SELECTION HANDLER ---
    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    // --- READY CHECK ---
    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.concept && draftSelections.subject && draftSelections.mood;
        if (currentPhase === 'specs') return draftSelections.style && draftSelections.lighting && draftSelections.camera;
        return false;
    };

    // --- SIDEBAR ACTIONS ---
    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, vision: c }));
            const formatted = `Concept: ${c.concept}, Subject: ${c.subject}, Mood: ${c.mood}`;
            actions.submitChoices(formatted);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, specs: c }));
            const formatted = `Style: ${c.style}, Lighting: ${c.lighting}, Camera: ${c.camera}`;
            actions.submitSpecs(formatted);
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(visionMsg, visionRole);
            const auto = {
                concept: data?.concept_options?.[0]?.label || "Default",
                subject: data?.subject_options?.[0]?.label || "Default",
                mood: data?.mood_options?.[0]?.label || "Default"
            };
            setManifest(prev => ({ ...prev, vision: auto }));
            actions.submitChoices(`Concept: ${auto.concept}, Subject: ${auto.subject}, Mood: ${auto.mood}`);
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg, specsRole);
            const auto = {
                style: data?.style_options?.[0]?.label || "Default",
                lighting: data?.lighting_options?.[0]?.label || "Default",
                camera: data?.camera_options?.[0]?.label || "Default"
            };
            setManifest(prev => ({ ...prev, specs: auto }));
            actions.submitSpecs(`Style: ${auto.style}, Lighting: ${auto.lighting}, Camera: ${auto.camera}`);
        }
    };

    // --- RENDERERS ---
    // Note: Assuming Deck components handle null data gracefully or we pass empty obj

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT: MAIN FEED */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1">
                        {currentPhase === 'vision' && visionMsg && <MuseDeck data={parseAgentJson(visionMsg, visionRole)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'specs' && specsMsg && <CinemaDeck data={parseAgentJson(specsMsg, specsRole)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'blueprint' && blueMsg && <CompositionDeck data={parseAgentJson(blueMsg, blueRole)} />}
                        {currentPhase === 'done' && finalMsg && <GalleryDeck data={parseAgentJson(finalMsg, finalRole)} />}

                        {loading && <AgentLoader message={statusMessage} />}
                    </div>
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

            {/* RIGHT: MANIFEST SIDEBAR */}
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
