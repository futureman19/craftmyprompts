import React, { useState, useEffect, useRef } from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

import VideoManifest from '../agent/video/VideoManifest';
import ProducerDeck from '../agent/video/ProducerDeck';
import DirectorDeck from '../agent/video/DirectorDeck';
// import Storyboard from '../agent/video/Storyboard'; // Placeholder if needed
// import Production from '../agent/video/Production'; // Placeholder if needed

import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

const VideoFeed = ({
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

    // --- FIND MESSAGES (FUZZY MATCHING) ---
    const visionMsg = history.findLast(m => m.role && (m.role.includes('Producer') || m.role.includes('Vision')));
    const specsMsg = history.findLast(m => m.role && (m.role.includes('Director') || m.role.includes('Specs')));
    const blueMsg = history.findLast(m => m.role && (m.role.includes('VFX') || m.role.includes('Visual')));
    const finalMsg = history.findLast(m => m.role && (m.role.includes('Editor') || m.role.includes('Production')));

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
        if (blueMsg) setManifest(prev => ({ ...prev, blueprint: "Storyboard Locked" }));
        if (finalMsg) setManifest(prev => ({ ...prev, final: "Production Complete" }));
    }, [blueMsg, finalMsg]);

    // --- HELPER: ROBUST JSON PARSER ---
    const parseAgentJson = (msg, contextName) => {
        if (!msg) return null;
        try {
            const raw = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                const json = JSON.parse(raw.substring(start, end + 1));

                // DATA NORMALIZATION
                let data = json.options ? { ...json, ...json.options } : json;

                // Vision Phase keys
                if (data.genre && Array.isArray(data.genre)) data.genre_options = data.genre;
                if (data.genreOptions) data.genre_options = data.genreOptions;

                if (data.hook && Array.isArray(data.hook)) data.hook_options = data.hook;
                if (data.hookOptions) data.hook_options = data.hookOptions;

                if (data.setting && Array.isArray(data.setting)) data.setting_options = data.setting;
                if (data.settingOptions) data.setting_options = data.settingOptions;

                // Specs Phase keys
                if (data.camera && Array.isArray(data.camera)) data.camera_options = data.camera;
                if (data.cameraOptions) data.camera_options = data.cameraOptions;

                if (data.lighting && Array.isArray(data.lighting)) data.lighting_options = data.lighting;
                if (data.lightingOptions) data.lighting_options = data.lightingOptions;

                if (data.motion && Array.isArray(data.motion)) data.motion_options = data.motion;
                if (data.motionOptions) data.motion_options = data.motionOptions;

                console.log(`[${contextName}] Parsed Data:`, data);
                return data;
            }
        } catch (e) { console.error(`${contextName} Parse Error:`, e); }
        return null;
    };

    // --- SELECTION HANDLER ---
    const handleDraftSelect = (key, value) => setDraftSelections(prev => ({ ...prev, [key]: value }));

    // --- READY CHECK ---
    const checkIsReady = () => {
        if (currentPhase === 'vision') return draftSelections.genre && draftSelections.hook && draftSelections.setting;
        if (currentPhase === 'specs') return draftSelections.camera && draftSelections.lighting && draftSelections.motion;
        return false;
    };

    // --- SIDEBAR ACTIONS ---
    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, vision: c }));
            const formatted = `Genre: ${c.genre}, Hook: ${c.hook}, Setting: ${c.setting}`;
            actions.submitChoices(formatted);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, specs: c }));
            const formatted = `Camera: ${c.camera}, Lighting: ${c.lighting}, Motion: ${c.motion}`;
            actions.submitSpecs(formatted);
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(visionMsg, 'AutoPilot-Producer');
            const auto = {
                genre: data?.genre_options?.[0]?.label || data?.genre_options?.[0] || "Default",
                hook: data?.hook_options?.[0]?.label || data?.hook_options?.[0] || "Default",
                setting: data?.setting_options?.[0]?.label || data?.setting_options?.[0] || "Default"
            };
            setManifest(prev => ({ ...prev, vision: auto }));
            actions.submitChoices(`Genre: ${auto.genre}, Hook: ${auto.hook}, Setting: ${auto.setting}`);
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(specsMsg, 'AutoPilot-Director');
            const auto = {
                camera: data?.camera_options?.[0]?.label || data?.camera_options?.[0] || "Default",
                lighting: data?.lighting_options?.[0]?.label || data?.lighting_options?.[0] || "Default",
                motion: data?.motion_options?.[0]?.label || data?.motion_options?.[0] || "Default"
            };
            setManifest(prev => ({ ...prev, specs: auto }));
            actions.submitSpecs(`Camera: ${auto.camera}, Lighting: ${auto.lighting}, Motion: ${auto.motion}`);
        }
    };

    // --- RENDERERS ---
    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT: MAIN FEED */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && visionMsg && <ProducerDeck data={parseAgentJson(visionMsg, 'Producer')} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'specs' && specsMsg && <DirectorDeck data={parseAgentJson(specsMsg, 'Director')} selections={draftSelections} onSelect={handleDraftSelect} />}

                        {/* Placeholders for Video Blueprint/Final */}
                        {currentPhase === 'blueprint' && blueMsg && (
                            <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
                                <h2 className="text-2xl font-bold text-purple-400 mb-4 font-serif">Storyboard & VFX Plan</h2>
                                <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                                    {blueMsg.text}
                                </div>
                            </div>
                        )}
                        {currentPhase === 'done' && finalMsg && (
                            <div className="p-8 max-w-4xl mx-auto animate-in fade-in text-center">
                                <h2 className="text-2xl font-bold text-purple-400 mb-4">Production Complete</h2>
                                <p className="text-slate-400 mb-8">Your video specification has been finalized.</p>
                                {/* In a real video app, embed the video player here */}
                                <div className="p-6 border border-purple-500/30 bg-purple-900/10 rounded-xl">
                                    <div className="text-slate-300 font-mono text-xs text-left whitespace-pre-wrap">
                                        {finalMsg.text}
                                    </div>
                                </div>
                            </div>
                        )}

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
            <VideoManifest
                manifest={manifest}
                currentPhase={currentPhase}
                onConfirm={handleSidebarConfirm}
                onAutoPilot={handleAutoPilot}
                isReady={checkIsReady()}
            />
        </div>
    );
};

export default VideoFeed;
