import React, { useState, useEffect, useRef } from 'react';
import { useVideoHive } from '../../hooks/hives/useVideoHive';
import ProducerDeck from '../agent/video/ProducerDeck';
import DirectorDeck from '../agent/video/DirectorDeck';
import VideoManifest from '../agent/video/VideoManifest';
import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';
import { Terminal, Copy, Check } from 'lucide-react';

const VideoFeed = ({ initialPrompt, onStateChange }) => {
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, compileBlueprint,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback
    } = useVideoHive();

    const [manifest, setManifest] = useState({});
    const [draftSelections, setDraftSelections] = useState({});
    const [copied, setCopied] = useState(false);
    const bottomRef = useRef(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (initialPrompt && !hasStarted) {
            startMission(initialPrompt);
            setHasStarted(true);
        }
    }, [initialPrompt]);

    useEffect(() => { setDraftSelections({}); }, [currentPhase]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDraftSelect = (key, value) => {
        setDraftSelections(prev => {
            // Allow toggle OFF if already selected (optional, but good UX)
            // For now, just overwrite
            return { ...prev, [key]: value };
        });
    };

    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'strategy') {
            const formatted = `Genre: ${c.genre}, Hook: ${c.hook}, Setting: ${c.setting}`;
            setManifest(prev => ({ ...prev, strategy: formatted }));
            submitChoices(formatted);
        } else if (currentPhase === 'spec') {
            const formatted = `Camera: ${c.camera}, Light: ${c.lighting}, Motion: ${c.motion}`;
            setManifest(prev => ({ ...prev, direction: formatted }));
            compileBlueprint(formatted);
        }
    };

    const handleAutoPilot = () => {
        const activeMsg = history[history.length - 1];
        if (!activeMsg) return;

        let data = {};
        try {
            data = JSON.parse(activeMsg.content);
        } catch (e) { return; }

        const randoms = {};
        const pickRandom = (keyArr, targetKey) => {
            const arr = data[keyArr] || [];
            if (arr.length) {
                const choice = arr[Math.floor(Math.random() * arr.length)];
                randoms[targetKey] = choice.label || choice.title;
            }
        };

        if (currentPhase === 'strategy') {
            pickRandom('genre_options', 'genre');
            pickRandom('hook_options', 'hook');
            pickRandom('setting_options', 'setting');
        } else if (currentPhase === 'spec') {
            pickRandom('camera_options', 'camera');
            pickRandom('lighting_options', 'lighting');
            pickRandom('motion_options', 'motion');
        }
        setDraftSelections(randoms);
    };

    const checkIsReady = () => {
        if (currentPhase === 'strategy') return draftSelections.genre && draftSelections.hook && draftSelections.setting;
        if (currentPhase === 'spec') return draftSelections.camera && draftSelections.lighting && draftSelections.motion;
        return false;
    };

    const renderFinal = (msg) => {
        let data = {};
        try { data = JSON.parse(msg.content); } catch (e) { return null; }

        // Mark final in manifest
        if (!manifest.final && data.final_prompt) {
            // We can't set state directly in render usually, but for this one-shot effect it's "okay" or better in useEffect
            // Let's rely on the user seeing the result.
            // Better: we can update manifest in an effect if needed, but for now let's just render.
            // Actually, let's update useEffect to detect 'final' message type and update manifest there if we wanted to be pure.
        }

        return (
            <div className="w-full h-full p-6 pb-20 overflow-y-auto">
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl relative shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-4">
                        <div className="flex items-center gap-2 text-orange-400">
                            <Terminal size={16} /> <span className="text-sm font-bold uppercase tracking-widest">Video Prompt Locked</span>
                        </div>
                        <button onClick={() => handleCopy(data.final_prompt)} className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    <p className="text-base text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{data.final_prompt}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT COLUMN */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    {history.map((msg, idx) => {
                        const isLast = idx === history.length - 1;
                        if (!isLast && msg.type !== 'final') return null;

                        let data = {};
                        try { data = JSON.parse(msg.content); } catch (e) { }

                        if (msg.type === 'strategy_options') return <ProducerDeck key={idx} data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
                        if (msg.type === 'spec_options') return <DirectorDeck key={idx} data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
                        if (msg.type === 'final') return renderFinal(msg);
                        return null;
                    })}

                    {loading && <AgentLoader message={statusMessage} />}

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

            {/* RIGHT COLUMN */}
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
