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

    // --- FIND MESSAGES (FUZZY MATCHING) ---
    // Uses .includes() to be robust against "The Editor" vs "The Editor-In-Chief"
    const editorMsg = history.findLast(m => m.role && (m.role.includes('Editor') || m.role.includes('Chief')));
    const linguistMsg = history.findLast(m => m.role && m.role.includes('Linguist'));
    const scribeMsg = history.findLast(m => m.role && (m.role.includes('Scribe') || m.role.includes('Writer')));
    const publisherMsg = history.findLast(m => m.role && m.role.includes('Publisher'));

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

                // Vision Phase Keys
                if (data.format && Array.isArray(data.format)) data.format_options = data.format;
                if (data.formatOptions) data.format_options = data.formatOptions;

                if (data.angle && Array.isArray(data.angle)) data.angle_options = data.angle;
                if (data.angleOptions) data.angle_options = data.angleOptions;

                if (data.tone && Array.isArray(data.tone)) data.tone_options = data.tone;
                if (data.toneOptions) data.tone_options = data.toneOptions;

                // Specs Phase Keys
                if (data.vocab && Array.isArray(data.vocab)) data.vocab_options = data.vocab;
                if (data.vocabOptions) data.vocab_options = data.vocabOptions;

                if (data.structure && Array.isArray(data.structure)) data.structure_options = data.structure;
                if (data.structureOptions) data.structure_options = data.structureOptions;

                if (data.rhetoric && Array.isArray(data.rhetoric)) data.rhetoric_options = data.rhetoric;
                if (data.rhetoricOptions) data.rhetoric_options = data.rhetoricOptions;

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
            const data = parseAgentJson(editorMsg, 'AutoPilot-Editor');
            const auto = {
                format: data?.format_options?.[0]?.label || data?.format_options?.[0] || "Default",
                angle: data?.angle_options?.[0]?.label || data?.angle_options?.[0] || "Default",
                tone: data?.tone_options?.[0]?.label || data?.tone_options?.[0] || "Default"
            };
            setManifest(prev => ({ ...prev, vision: auto }));
            actions.submitChoices(`Format: ${auto.format}, Angle: ${auto.angle}, Tone: ${auto.tone}`);
        } else if (currentPhase === 'specs') {
            const data = parseAgentJson(linguistMsg, 'AutoPilot-Linguist');
            const auto = {
                vocab: data?.vocab_options?.[0]?.label || data?.vocab_options?.[0] || "Default",
                structure: data?.structure_options?.[0]?.label || data?.structure_options?.[0] || "Default",
                rhetoric: data?.rhetoric_options?.[0]?.label || data?.rhetoric_options?.[0] || "Default"
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
                    <div className="flex-1 p-4">
                        {currentPhase === 'vision' && editorMsg && <EditorDeck data={parseAgentJson(editorMsg, 'Editor')} selections={draftSelections} onSelect={handleDraftSelect} />}
                        {currentPhase === 'specs' && linguistMsg && <LinguistDeck data={parseAgentJson(linguistMsg, 'Linguist')} selections={draftSelections} onSelect={handleDraftSelect} />}

                        {/* Reuse Manuscript for both blueprint and final for now, or use custom renders if available */}
                        {currentPhase === 'blueprint' && scribeMsg && <Manuscript data={parseAgentJson(scribeMsg, 'Scribe')} />}

                        {/* Publishers might just output text or a refined manuscript. For now, showing raw text or specialized deck if we had one. */}
                        {currentPhase === 'done' && publisherMsg && (
                            <div className="p-8 max-w-4xl mx-auto animate-in fade-in">
                                <h2 className="text-2xl font-bold text-indigo-400 mb-4 font-serif">Final Publication</h2>
                                <div className="prose prose-invert prose-lg">
                                    <div className="whitespace-pre-wrap text-slate-300">
                                        {parseAgentJson(publisherMsg, 'Publisher')?.content || publisherMsg.text}
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
