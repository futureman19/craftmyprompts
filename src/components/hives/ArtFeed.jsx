import React, { useState, useEffect, useRef } from 'react';
import ArtManifest from '../agent/art/ArtManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

// --- IMPORTS ---
import MuseDeck from '../agent/art/MuseDeck';
import CinemaDeck from '../agent/art/CinemaDeck';
import ArtCriticDeck from '../agent/art/ArtCriticDeck';
import CompositionDeck from '../agent/art/CompositionDeck';
import GalleryDeck from '../agent/art/GalleryDeck';

const ArtFeed = ({ history, loading, statusMessage, actions, currentPhase, managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback }) => {
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    // --- 1. ROBUST PARSER & NORMALIZER ---
    const parseAgentJson = (msg, context) => {
        if (!msg) return null;
        try {
            const raw = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start === -1 || end === -1) return null;

            const json = JSON.parse(raw.substring(start, end + 1));

            // NORMALIZATION: Fix inconsistent keys from AI
            // 1. Check for nested "options" object
            let data = json.options ? { ...json, ...json.options } : json;

            // 2. Map Vision Keys
            if (data.concept && Array.isArray(data.concept)) data.concept_options = data.concept;
            if (data.conceptOptions) data.concept_options = data.conceptOptions;

            if (data.subject && Array.isArray(data.subject)) data.subject_options = data.subject;
            if (data.subjectOptions) data.subject_options = data.subjectOptions;

            if (data.mood && Array.isArray(data.mood)) data.mood_options = data.mood;
            if (data.moodOptions) data.mood_options = data.moodOptions;

            // 3. Map Specs Keys
            if (data.style && Array.isArray(data.style)) data.style_options = data.style;
            if (data.styleOptions) data.style_options = data.styleOptions;

            if (data.lighting && Array.isArray(data.lighting)) data.lighting_options = data.lighting;
            if (data.lightingOptions) data.lighting_options = data.lightingOptions;

            if (data.camera && Array.isArray(data.camera)) data.camera_options = data.camera;
            if (data.cameraOptions) data.camera_options = data.cameraOptions;

            console.log(`[${context}] Parsed Data:`, data); // Debug Log
            return data;

        } catch (e) {
            console.error("Parse Error:", e);
        }
        return null;
    };

    // --- 2. FUZZY ROLE MATCHING ---
    // Uses .includes() to catch "Muse", "The Muse", "Art Director", etc.
    const strategyMsg = history.findLast(m => m.role && (m.role.includes('Muse') || m.role.includes('Visionary')));
    const specsMsg = history.findLast(m => m.role && (m.role.includes('Cinematographer') || m.role.includes('Tech')));
    const criticMsg = history.findLast(m => m.role && (m.role.includes('Critic') || m.role.includes('Auditor')));
    const buildMsg = history.findLast(m => m.role && (m.role.includes('Stylist') || m.role.includes('Architect')));
    const finalMsg = history.findLast(m => m.role && (m.role.includes('Gallery') || m.role.includes('Executive')));

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
            const data = parseAgentJson(strategyMsg, 'AutoPilot-Vision');
            if (data) {
                const auto = {
                    concept: data.concept_options?.[0]?.label || data.concept_options?.[0] || "Default",
                    subject: data.subject_options?.[0]?.label || data.subject_options?.[0] || "Default",
                    mood: data.mood_options?.[0]?.label || data.mood_options?.[0] || "Default"
                };
                setManifest(prev => ({ ...prev, vision: auto }));
                actions.submitChoices(`Concept: ${auto.concept}, Subject: ${auto.subject}, Mood: ${auto.mood}`);
            }
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg, 'AutoPilot-Specs');
            if (data) {
                const auto = {
                    style: data.style_options?.[0]?.label || data.style_options?.[0] || "Default",
                    lighting: data.lighting_options?.[0]?.label || data.lighting_options?.[0] || "Default",
                    camera: data.camera_options?.[0]?.label || data.camera_options?.[0] || "Default"
                };
                setManifest(prev => ({ ...prev, specs: auto }));
                actions.submitSpecs(`Style: ${auto.style}, Lighting: ${auto.lighting}, Camera: ${auto.camera}`);
            }
        }
    };

    // --- RENDERERS ---
    const renderVision = () => <MuseDeck data={parseAgentJson(strategyMsg, 'Muse')} selections={draftSelections} onSelect={handleDraftSelect} />;
    const renderSpecs = () => <CinemaDeck data={parseAgentJson(specsMsg, 'Cinema')} selections={draftSelections} onSelect={handleDraftSelect} />;

    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <ArtCriticDeck data={data} onConfirm={actions.refineBlueprint} />
            </div>
        );
    };

    // Improved Blueprint Parser: Checks multiple possible keys
    const renderBlueprint = () => {
        const raw = parseAgentJson(buildMsg, 'Composition');
        const structure = raw?.composition || raw?.structure || raw?.layers || { note: "Processing..." };
        return <CompositionDeck structure={structure} />;
    };

    const renderFinal = () => <GalleryDeck finalData={parseAgentJson(finalMsg, 'Gallery')} />;

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && strategyMsg && renderVision()}
                        {currentPhase === 'specs' && specsMsg && renderSpecs()}
                        {currentPhase === 'critique' && criticMsg && renderCritique()}
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
