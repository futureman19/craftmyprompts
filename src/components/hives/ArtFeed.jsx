import React, { useState, useEffect, useRef } from 'react';
import ArtManifest from '../agent/art/ArtManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

// --- NEW IMPORTS (Now they exist!) ---
import MuseDeck from '../agent/art/MuseDeck';
import CinemaDeck from '../agent/art/CinemaDeck';
import CompositionDeck from '../agent/art/CompositionDeck';
import GalleryDeck from '../agent/art/GalleryDeck';

const ArtFeed = ({ history, loading, statusMessage, actions, currentPhase, managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback }) => {
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    // --- PARSER ---
    const parseAgentJson = (msg) => {
        if (!msg) return null;
        try {
            const raw = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start !== -1 && end !== -1) return JSON.parse(raw.substring(start, end + 1));
        } catch (e) { console.error("Parse Error:", e); }
        return null;
    };

    // Updated roles to match likely Agent outputs
    const strategyMsg = history.findLast(m => m.role === 'The Muse' || m.role === 'The Visionary');
    const specsMsg = history.findLast(m => m.role === 'The Cinematographer' || m.role === 'The Tech Lead');
    const buildMsg = history.findLast(m => m.role === 'The Stylist' || m.role === 'The Architect');
    const finalMsg = history.findLast(m => m.role === 'The Gallery' || m.role === 'The Executive');

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);
    useEffect(() => { setDraftSelections({}); }, [currentPhase]);

    // AUTO-PROGRESS TRACKING
    useEffect(() => {
        if (buildMsg) setManifest(prev => ({ ...prev, blueprint: "Composition Locked" }));
        if (finalMsg) setManifest(prev => ({ ...prev, final: "Masterpiece Rendered" }));
    }, [buildMsg, finalMsg]);

    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.concept && draftSelections.subject && draftSelections.mood;
        if (currentPhase === 'specs') return draftSelections.style && draftSelections.lighting && draftSelections.camera;
        return false;
    };

    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, vision: c }));
            actions.submitChoices(`Concept: ${c.concept}, Subject: ${c.subject}, Mood: ${c.mood}`);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, specs: c }));
            actions.submitSpecs(`Style: ${c.style}, Lighting: ${c.lighting}, Camera: ${c.camera}`);
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(strategyMsg);
            if (data) {
                const auto = {
                    concept: data.concept_options?.[0]?.label || "Default",
                    subject: data.subject_options?.[0]?.label || "Default",
                    mood: data.mood_options?.[0]?.label || "Default"
                };
                setManifest(prev => ({ ...prev, vision: auto }));
                actions.submitChoices(`Concept: ${auto.concept}, Subject: ${auto.subject}, Mood: ${auto.mood}`);
            }
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg);
            if (data) {
                const auto = {
                    style: data.style_options?.[0]?.label || "Default",
                    lighting: data.lighting_options?.[0]?.label || "Default",
                    camera: data.camera_options?.[0]?.label || "Default"
                };
                setManifest(prev => ({ ...prev, specs: auto }));
                actions.submitSpecs(`Style: ${auto.style}, Lighting: ${auto.lighting}, Camera: ${auto.camera}`);
            }
        }
    };

    // --- RENDERERS ---
    const renderVision = () => <MuseDeck data={parseAgentJson(strategyMsg)} selections={draftSelections} onSelect={handleDraftSelect} />;
    const renderSpecs = () => <CinemaDeck data={parseAgentJson(specsMsg)} selections={draftSelections} onSelect={handleDraftSelect} />;
    const renderBlueprint = () => <CompositionDeck structure={parseAgentJson(buildMsg)?.composition || parseAgentJson(buildMsg)?.structure || { note: "Processing/Structure Mismatch" }} />;
    // Added structure fallback for safety
    const renderFinal = () => <GalleryDeck finalData={parseAgentJson(finalMsg)} />;

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && strategyMsg && renderVision()}
                        {currentPhase === 'specs' && specsMsg && renderSpecs()}
                        {currentPhase === 'blueprint' && buildMsg && renderBlueprint()}
                        {currentPhase === 'done' && renderFinal()}
                        {loading && <AgentLoader message={statusMessage} />}
                    </div>
                    <div ref={bottomRef} />
                </div>
                <ManagerDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} messages={managerMessages} onSendMessage={handleManagerFeedback} loading={loading} />
            </div>
            <ArtManifest manifest={manifest} currentPhase={currentPhase} onConfirm={handleSidebarConfirm} onAutoPilot={handleAutoPilot} isReady={checkIsReady()} />
        </div>
    );
};

export default ArtFeed;
