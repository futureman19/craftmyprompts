import React, { useState, useEffect, useRef } from 'react';
import { Loader, Layers, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

import TextManifest from '../agent/text/TextManifest';
import EditorDeck from '../agent/text/EditorDeck';
import LinguistDeck from '../agent/text/LinguistDeck';
import Manuscript from '../agent/text/Manuscript'; // Used for Blueprint (Scribe)
// import TextCriticDeck from '../agent/text/TextCriticDeck'; // Placeholder if needed

import ManagerDrawer from '../hivemind/ManagerDrawer';
import AgentLoader from '../ui/AgentLoader';

const TextFeed = ({
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
    // Update roles based on actual Agent outputs
    const editorRole = 'The Editor-In-Chief';
    const linguistRole = 'The Linguist';
    const scribeRole = 'The Scribe';
    const publisherRole = 'The Publisher';

    const editorMsg = history.findLast(m => m.role === editorRole);
    const linguistMsg = history.findLast(m => m.role === linguistRole);
    const scribeMsg = history.findLast(m => m.role === scribeRole);
    const publisherMsg = history.findLast(m => m.role === publisherRole);

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
        if (scribeMsg) setManifest(prev => ({ ...prev, blueprint: "Outline Locked" }));
        if (publisherMsg) setManifest(prev => ({ ...prev, final: "Manuscript Polished" }));
    }, [scribeMsg, publisherMsg]);

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
        if (currentPhase === 'vision') return draftSelections.format && draftSelections.angle && draftSelections.tone;
        if (currentPhase === 'specs') return draftSelections.vocab && draftSelections.structure && draftSelections.rhetoric;
        return false;
    };

    // --- SIDEBAR ACTIONS ---
    const handleSidebarConfirm = () => {
        const c = draftSelections;
        if (currentPhase === 'vision') {
            setManifest(prev => ({ ...prev, vision: c }));
            const formatted = `Format: ${c.format}, Angle: ${c.angle}, Tone: ${c.tone}`;
            actions.submitChoices(formatted);
        } else if (currentPhase === 'specs') {
            setManifest(prev => ({ ...prev, specs: c }));
            const formatted = `Vocab: ${c.vocab}, Structure: ${c.structure}, Rhetoric: ${c.rhetoric}`;
            actions.submitSpecs(formatted);
        }
    };

    const handleAutoPilot = () => {
        if (currentPhase === 'vision') {
            const data = parseAgentJson(editorMsg, editorRole);
            const auto = {
                format: data?.format_options?.[0]?.label || "Default",
                angle: data?.angle_options?.[0]?.label || "Default",
                tone: data?.tone_options?.[0]?.label || "Default"
            };
            setManifest(prev => ({ ...prev, vision: auto }));
            actions.submitChoices(`Format: ${auto.format}, Angle: ${auto.angle}, Tone: ${auto.tone}`);
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(linguistMsg, linguistRole);
            const auto = {
                vocab: data?.vocab_options?.[0]?.label || "Default",
                structure: data?.structure_options?.[0]?.label || "Default",
                rhetoric: data?.rhetoric_options?.[0]?.label || "Default"
            };
            setManifest(prev => ({ ...prev, specs: auto }));
            actions.submitSpecs(`Vocab: ${auto.vocab}, Structure: ${auto.structure}, Rhetoric: ${auto.rhetoric}`);
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950">
            {/* LEFT: MAIN FEED */}
            <div className="flex-1 flex flex-col min-w-0 relative border-r border-slate-800">
                <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
                    <div className="flex-1">
                        {currentPhase === 'vision' && editorMsg && <EditorDeck data={parseAgentJson(editorMsg, editorRole)} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'specs' && linguistMsg && <LinguistDeck data={parseAgentJson(linguistMsg, linguistRole)} selections={draftSelections} onSelect={handleDraftSelect} />}

                        {/* Reuse Manuscript for both blueprint and final for now, or use custom renders if available */}
                        {currentPhase === 'blueprint' && scribeMsg && <Manuscript data={parseAgentJson(scribeMsg, scribeRole)} />}

                        {/* Publishers might just output text or a refined manuscript. For now, showing raw text or specialized deck if we had one. */}
                        {currentPhase === 'done' && publisherMsg && (
                            <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
                                <h2 className="text-2xl font-bold text-indigo-400 mb-4 font-serif">Final Publication</h2>
                                <div className="prose prose-invert prose-lg">
                                    <div className="whitespace-pre-wrap text-slate-300">
                                        {parseAgentJson(publisherMsg, publisherRole)?.content || publisherMsg.text}
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
