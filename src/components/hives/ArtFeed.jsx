import React, { useState, useEffect, useRef } from 'react';
import ArtManifest from '../agent/art/ArtManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';
import MuseDeck from '../agent/art/MuseDeck';
import CinemaDeck from '../agent/art/CinemaDeck';
import MimicDeck from '../agent/art/MimicDeck'; // NEW
import MaverickDeck from '../agent/art/MaverickDeck';
import TechDeck from '../agent/art/TechDeck'; // NEW
import GalleryDeck from '../agent/art/GalleryDeck';

const ArtFeed = ({ history, loading, statusMessage, actions, currentPhase, managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback }) => {
    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const bottomRef = useRef(null);

    const parseAgentJson = (msg) => {
        if (!msg) return null;
        try {
            const payload = msg.content || msg.text;
            if (!payload) return null;
            const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start === -1 || end === -1) return null;
            const json = JSON.parse(raw.substring(start, end + 1));
            let data = json.options ? { ...json, ...json.options } : json;
            if (data.conceptOptions) data.concept_options = data.conceptOptions;
            if (data.styleOptions) data.style_options = data.styleOptions;
            return data;
        } catch (e) { console.error("Parse Error", e); }
        return null;
    };

    const strategyMsg = history.findLast(m => m.role && (m.role.includes('Muse') || m.role.includes('Visionary')));
    const specsMsg = history.findLast(m => m.role && (m.role.includes('Cinematographer') || m.role.includes('Tech')));
    const mimicMsg = history.findLast(m => m.role && (m.role.includes('Mimic') || m.role.includes('Style')));
    const maverickMsg = history.findLast(m => m.role && (m.role.includes('Maverick') || m.role.includes('Chaos')));
    const finalMsg = history.findLast(m => m.role && (m.role.includes('Gallery') || m.role.includes('Executive')));

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);
    useEffect(() => { setDraftSelections({}); }, [currentPhase]);

    useEffect(() => {
        if (mimicMsg) setManifest(prev => ({ ...prev, mimic: "Styles Curated" }));
        if (maverickMsg) setManifest(prev => ({ ...prev, maverick: "Wildcards Ready" }));
        if (finalMsg) setManifest(prev => ({ ...prev, final: "Masterpiece Rendered" }));
    }, [mimicMsg, maverickMsg, finalMsg]);

    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.concept && draftSelections.subject && draftSelections.mood;
        if (currentPhase === 'specs') return draftSelections.style && draftSelections.lighting && draftSelections.camera;
        if (currentPhase === 'mimic') return draftSelections.mimic && draftSelections.mimic.length > 0;
        return false;
    };

    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, vision: c }));
            actions.submitChoices(c);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, specs: c }));
            actions.submitSpecs(c); // Go to Mimic
        } else if (currentPhase === 'mimic') {
            setManifest(prev => ({ ...prev, mimic: c.mimic || [] }));
            actions.submitMimic(c.mimic || []); // Go to Maverick
        } else if (currentPhase === 'maverick') {
            setManifest(prev => ({ ...prev, maverick: c.maverick || [] }));
            actions.submitMaverick(c.maverick || []); // Go to Technical
        }
    };

    const handleRender = () => {
        // Collect technical specs from draft (or defaults)
        const techSpecs = draftSelections.technical || { ratio: "16:9", model: "Midjourney", quality: "4k" };
        setManifest(prev => ({ ...prev, technical: techSpecs }));
        actions.renderFinal(techSpecs);
    };

    const handleAutoPilot = () => {
        // 1. VISION (Muse)
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
        }
        // 2. SPECS (Cinematographer)
        else if (currentPhase === 'specs') {
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
        }
        // 3. MIMIC (Randomly pick 1 Influence)
        else if (currentPhase === 'mimic') {
            const data = parseAgentJson(mimicMsg, 'Auto');
            if (data?.influences?.length > 0) {
                // Pick a random one for variety
                const random = data.influences[Math.floor(Math.random() * data.influences.length)];
                const selection = [random];
                setManifest(prev => ({ ...prev, mimic: selection }));
                actions.submitMimic(selection);
            }
        }
        // 4. MAVERICK (Randomly pick 1 Wildcard)
        else if (currentPhase === 'maverick') {
            const data = parseAgentJson(maverickMsg, 'Auto');
            if (data?.wildcards?.length > 0) {
                const random = data.wildcards[Math.floor(Math.random() * data.wildcards.length)];
                const selection = [random];
                setManifest(prev => ({ ...prev, maverick: selection }));
                actions.submitMaverick(selection);
            }
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && strategyMsg && <MuseDeck data={parseAgentJson(strategyMsg)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'specs' && specsMsg && <CinemaDeck data={parseAgentJson(specsMsg)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'mimic' && mimicMsg && <MimicDeck data={parseAgentJson(mimicMsg)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'maverick' && maverickMsg && <MaverickDeck data={parseAgentJson(maverickMsg)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'technical' && <TechDeck selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'done' && <GalleryDeck finalData={{ ...parseAgentJson(finalMsg), generatedImage: finalMsg?.generatedImage }} />}
                        {loading && <AgentLoader message={statusMessage} />}
                    </div>
                    <div ref={bottomRef} />
                </div>
                <ManagerDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} messages={managerMessages} onSendMessage={handleManagerFeedback} loading={loading} />
            </div>
            <ArtManifest manifest={manifest} currentPhase={currentPhase} onConfirm={handleSidebarConfirm} onAutoPilot={handleAutoPilot} onRender={handleRender} isReady={checkIsReady()} />
        </div>
    );
};
export default ArtFeed;