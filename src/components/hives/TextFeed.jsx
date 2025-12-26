import React, { useState, useEffect, useRef } from 'react';
import { Loader, FileText, Check, Copy } from 'lucide-react';
import { useTextHive } from '../../hooks/hives/useTextHive';

// Text Components
import EditorDeck from '../agent/text/EditorDeck';
import LinguistDeck from '../agent/text/LinguistDeck';
import Manuscript from '../agent/text/Manuscript'; // Assumed existing
import TextCriticDeck from '../agent/text/TextCriticDeck'; // Assumed existing
import TextManifest from '../agent/text/TextManifest';

// Shared
import ManagerDrawer from '../hivemind/ManagerDrawer';

const TextFeed = ({ initialPrompt, onStateChange }) => {
    const {
        history, currentPhase, loading, statusMessage,
        startMission, submitChoices, submitSpecs, sendToAudit, refineBlueprint, compileManuscript,
        managerMessages, isDrawerOpen, setIsDrawerOpen, handleManagerFeedback
    } = useTextHive();

    const [hasStarted, setHasStarted] = useState(false);
    const [copied, setCopied] = useState(false);

    // --- STATE ---
    const [manifest, setManifest] = useState({
        strategy: null, // Format + Angle
        voice: null,    // Vocab + Structure
        blueprint: false,
        final: false
    });

    const [draftSelections, setDraftSelections] = useState({});

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

    // --- LOGIC ---
    const handleDraftSelect = (key, value) => {
        setDraftSelections(prev => ({ ...prev, [key]: value }));
    };

    const handleSidebarConfirm = () => {
        const choices = draftSelections;
        if (currentPhase === 'strategy' || currentPhase === 'editor') {
            const formatted = `Format: ${choices.format}, Angle: ${choices.angle}, Tone: ${choices.tone}`;
            setManifest(prev => ({ ...prev, strategy: formatted }));
            submitChoices(formatted);
        }
        else if (currentPhase === 'spec' || currentPhase === 'linguist') {
            const formatted = `Vocab: ${choices.vocab}, Structure: ${choices.structure}, Rhetoric: ${choices.rhetoric}`;
            setManifest(prev => ({ ...prev, voice: formatted }));
            submitSpecs(formatted);
        }
    };

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
                randoms[targetKey] = choice.label || choice.title;
            }
        };

        if (currentPhase === 'strategy') {
            pickRandom('format_options', 'format');
            pickRandom('angle_options', 'angle');
            pickRandom('tone_options', 'tone');
        } else if (currentPhase === 'spec') {
            pickRandom('vocab_options', 'vocab');
            pickRandom('structure_options', 'structure');
            pickRandom('rhetoric_options', 'rhetoric');
        }
        setDraftSelections(randoms);
    };

    const checkIsReady = () => {
        if (currentPhase === 'strategy') return draftSelections.format && draftSelections.angle && draftSelections.tone;
        if (currentPhase === 'spec') return draftSelections.vocab && draftSelections.structure && draftSelections.rhetoric;
        return false;
    };

    // --- RENDERERS ---
    const renderEditor = (msg) => {
        const data = parseAgentJson(msg);
        return <EditorDeck data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
    };

    const renderLinguist = (msg) => {
        const data = parseAgentJson(msg);
        return <LinguistDeck data={data} selections={draftSelections} onSelect={handleDraftSelect} />;
    };

    const renderManuscript = (msg) => {
        const data = parseAgentJson(msg);
        return (
            <div className="w-full h-full p-4 overflow-y-auto">
                <Manuscript data={data} />
                <div className="mt-4 flex gap-4 pb-20">
                    <button onClick={sendToAudit} className="flex-1 py-4 bg-slate-800 rounded-xl text-slate-300 font-bold hover:bg-slate-700">Request Audit</button>
                    <button
                        onClick={() => {
                            compileManuscript();
                            setManifest(prev => ({ ...prev, blueprint: true }));
                        }}
                        className="flex-1 py-4 bg-emerald-600 rounded-xl text-white font-bold hover:bg-emerald-500 shadow-lg"
                    >
                        Approve & Publish
                    </button>
                </div>
            </div>
        );
    };

    const renderPublication = (msg) => {
        const data = parseAgentJson(msg);
        if (!data) return null;

        // Mark final in manifest
        if (!manifest.final) setManifest(prev => ({ ...prev, final: true }));

        return (
            <div className="w-full h-full p-6 pb-20 overflow-y-auto">
                <div className="bg-slate-100 text-slate-900 p-8 md:p-12 rounded-xl shadow-2xl font-serif leading-relaxed whitespace-pre-wrap relative group">
                    <button
                        onClick={() => handleCopy(data.final_text)}
                        className="absolute top-4 right-4 p-2 bg-slate-200/50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors text-slate-500"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {data.final_text}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT COLUMN */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                {statusMessage && loading && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-1.5 px-4 text-xs font-mono text-emerald-300 animate-in fade-in">
                        {statusMessage}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    {history.map((msg, idx) => {
                        const isLast = idx === history.length - 1;
                        if (!isLast && msg.type !== 'final') return null;

                        switch (msg.type) {
                            case 'strategy_options': return renderEditor(msg);
                            case 'spec_options': return renderLinguist(msg);
                            case 'blueprint': return renderManuscript(msg);
                            case 'final': return renderPublication(msg);
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

            {/* RIGHT COLUMN */}
            <TextManifest
                manifest={manifest}
                currentPhase={currentPhase}
                onConfirm={handleSidebarConfirm}
                onAutoPilot={handleAutoPilot}
                isReady={checkIsReady()}
            />
        </div>
    );
};

export default TextFeed;
