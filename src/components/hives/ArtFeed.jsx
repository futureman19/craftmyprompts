import React, { useState, useEffect, useRef } from 'react';
import ArtManifest from '../agent/art/ArtManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

// --- IMPORTS ---
import MuseDeck from '../agent/art/MuseDeck';
import CinemaDeck from '../agent/art/CinemaDeck';
import MaverickDeck from '../agent/art/MaverickDeck';
import CompositionDeck from '../agent/art/CompositionDeck';
import GalleryDeck from '../agent/art/GalleryDeck';

const ArtFeed = ({ history, loading, statusMessage, actions, currentPhase, managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback }) => {
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    // --- PARSER ---
    const parseAgentJson = (msg, context) => {
        if (!msg) return null;
        try {
            const payload = msg.content || msg.text;
            if (!payload) return null;
            const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start === -1 || end === -1) return null;

            const json = JSON.parse(raw.substring(start, end + 1));

            // Normalize Options
            let data = json.options ? { ...json, ...json.options } : json;
            if (data.conceptOptions) data.concept_options = data.conceptOptions;
            if (data.styleOptions) data.style_options = data.styleOptions;

            return data;
        } catch (e) { console.error(`[${context}] Parse Error:`, e); }
        return null;
    };

    // --- ROLE MATCHING ---
    const strategyMsg = history.findLast(m => m.role && (m.role.includes('Muse') || m.role.includes('Visionary')));
    const specsMsg = history.findLast(m => m.role && (m.role.includes('Cinematographer') || m.role.includes('Tech')));
    const maverickMsg = history.findLast(m => m.role && (m.role.includes('Maverick') || m.role.includes('Chaos')));
    const buildMsg = history.findLast(m => m.role && (m.role.includes('Stylist') || m.role.includes('Architect')));
    const finalMsg = history.findLast(m => m.role && (m.role.includes('Gallery') || m.role.includes('Executive')));

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);
    useEffect(() => { setDraftSelections({}); }, [currentPhase]);

    // --- PROGRESS TRACKING ---
    useEffect(() => {
        if (maverickMsg) setManifest(prev => ({ ...prev, maverick: "Wildcards Ready" }));
        if (buildMsg) setManifest(prev => ({ ...prev, blueprint: "Composition Locked" }));
        if (finalMsg) setManifest(prev => ({ ...prev, final: "Masterpiece Rendered" }));
    }, [maverickMsg, buildMsg, finalMsg]);

    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.concept && draftSelections.subject && draftSelections.mood;
        if (currentPhase === 'specs') return draftSelections.style && draftSelections.lighting && draftSelections.camera;
        if (currentPhase === 'maverick') return true; // Optional step, always ready
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
        } else if (currentPhase === 'maverick') {
            // NEW: Handle Maverick confirmation
            setManifest(prev => ({ ...prev, maverick: c.maverick || [] }));
            actions.refineBlueprint(c.maverick || []); // Pass array or empty
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(strategyMsg, 'Auto');
            if (data) {
                const auto = {
                    concept: data.concept_options?.[0]?.label || "Default",
                    subject: data.subject_options?.[0]?.label || "Default",
                    mood: data.mood_options?.[0]?.label || "Default"
                };
                setManifest(prev => ({ ...prev, vision: auto }));
                actions.submitChoices(auto);
            }
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg, 'Auto');
            if (data) {
                const auto = {
                    style: data.style_options?.[0]?.label || "Default",
                    lighting: data.lighting_options?.[0]?.label || "Default",
                    camera: data.camera_options?.[0]?.label || "Default"
                };
                setManifest(prev => ({ ...prev, specs: auto }));
                actions.submitSpecs(auto);
            }
        } else if (currentPhase === 'maverick') {
            // Auto-Pilot picks the first wildcard
            const data = parseAgentJson(maverickMsg, 'Auto');
            const auto = data?.wildcards?.[0] ? [data.wildcards[0]] : [];
            setManifest(prev => ({ ...prev, maverick: auto }));
            actions.refineBlueprint(auto);
        }
    };

    const handleRender = () => {
        // Trigger the final step (Gallery Agent)
        actions.renderFinal();
    };

    // --- RENDERERS ---
    const renderVision = () => <MuseDeck data={parseAgentJson(strategyMsg, 'Muse')} selections={draftSelections} onSelect={handleDraftSelect} />;
    const renderSpecs = () => <CinemaDeck data={parseAgentJson(specsMsg, 'Cinema')} selections={draftSelections} onSelect={handleDraftSelect} />;

    const renderMaverick = () => {
        const data = parseAgentJson(maverickMsg, 'Maverick');
        // Now using Standard Deck Props (selections/onSelect) instead of onConfirm
        return <MaverickDeck data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
    };

    const renderBlueprint = () => {
        const raw = parseAgentJson(buildMsg, 'Composition');
        // If raw has 'composition' inside, pass the whole raw object so the deck can find the summary too.
        // Otherwise pass raw directly.
        const structure = raw || { note: "Processing..." };
        return <CompositionDeck structure={structure} />;
    };

    const renderFinal = () => {
        const json = parseAgentJson(finalMsg, 'Gallery');
        // MERGE the parsed JSON with the raw message properties (like generatedImage)
        const finalData = { ...json, generatedImage: finalMsg?.generatedImage };
        return <GalleryDeck finalData={finalData} />;
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && strategyMsg && renderVision()}
                        {currentPhase === 'specs' && specsMsg && renderSpecs()}
                        {currentPhase === 'maverick' && maverickMsg && renderMaverick()}
                        {currentPhase === 'blueprint' && buildMsg && renderBlueprint()}
                        {currentPhase === 'done' && renderFinal()}
                        {loading && <AgentLoader message={statusMessage} />}
                    </div>
                    <div ref={bottomRef} />
                </div>
                <ManagerDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} messages={managerMessages} onSendMessage={handleManagerFeedback} loading={loading} />
            </div>
            <ArtManifest
                manifest={manifest}
                currentPhase={currentPhase}
                onConfirm={handleSidebarConfirm}
                onAutoPilot={handleAutoPilot}
                onRender={handleRender}
                isReady={checkIsReady()}
            />
        </div>
    );
};

export default ArtFeed;