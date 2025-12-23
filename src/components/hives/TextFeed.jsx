import React from 'react';
import { Loader, Copy, CheckCircle } from 'lucide-react';

// --- IMPORT AGENT DECKS (Text Specific) ---
import VisionaryDeck from '../../agent/VisionaryDeck.jsx'; // Will render "Editorial Board"
import SpecsDeck from '../../agent/SpecsDeck.jsx';         // Will render "Tone Calibration"
import StylistDeck from '../../agent/StylistDeck.jsx';     // Will render "Content Outline"
import CriticDeck from '../../agent/CriticDeck.jsx';

import { generateFinalOutput } from '../../utils/formatters.js';

const TextFeed = ({ history, loading, statusMessage, actions, currentPhase }) => {

    const mode = 'text'; // Always text

    // --- 1. FIND LATEST AGENT OUTPUTS ---
    const strategyRole = 'The Editor-in-Chief';
    const specsRole = 'The Linguist';
    const buildRole = 'The Scribe';

    const strategyMsg = history.findLast(m => m.role === strategyRole);
    const specsMsg = history.findLast(m => m.role === specsRole);
    const buildMsg = history.findLast(m => m.role === buildRole);

    const criticMsg = history.findLast(m => m.role === 'The Critic');

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
        } catch (e) {
            console.error(`${contextName} Parse Error:`, e);
        }
        return null;
    };

    // --- 2. RENDERERS ---

    // PHASE 1: VISION (The Editor)
    const renderVision = () => {
        const data = parseAgentJson(strategyMsg, strategyRole);
        if (!data) {
            if (strategyMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {strategyRole} FAILED</div>{strategyMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {strategyRole}...</div>;
        }
        return <VisionaryDeck data={data} mode="text" onConfirm={actions.submitChoices} />;
    };

    // PHASE 2: SPECS (The Linguist)
    const renderSpecs = () => {
        const data = parseAgentJson(specsMsg, specsRole);
        if (!data) {
            if (specsMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {specsRole} FAILED</div>{specsMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {specsRole}...</div>;
        }
        return <SpecsDeck data={data} mode="text" onConfirm={actions.submitSpecs} />;
    };

    // PHASE 3: BLUEPRINT (The Scribe)
    const renderBlueprint = () => {
        const data = parseAgentJson(buildMsg, buildRole);

        if (!data) {
            if (buildMsg) return <div className="text-red-100 p-6 border-2 border-red-500 rounded-lg bg-red-900/30 font-mono text-sm whitespace-pre-wrap shadow-lg"><div className="text-red-400 font-bold mb-2">🚨 {buildRole} FAILED</div>{buildMsg.text}</div>;
            return <div className="text-red-400 p-4 font-mono text-sm border border-red-900/50 rounded bg-red-900/10">Waiting for {buildRole}...</div>;
        }

        // Use StylistDeck for "Content Outline"
        return <StylistDeck data={data} mode="text" onConfirm={actions.sendToAudit} />;
    };

    // PHASE 4: CRITIQUE (Critic)
    const renderCritique = () => {
        const data = parseAgentJson(criticMsg, 'Critic');
        return (
            <>
                {renderBlueprint()} {/* Show the work being critiqued */}
                {data ? (
                    <CriticDeck data={data} onConfirm={(selections) => actions.compileBuild(selections)} />
                ) : (
                    <div className="text-red-400 p-4 border border-red-500 mt-4 rounded">
                        Critic Output Invalid. <button onClick={actions.compileBuild} className="underline">Force Compile</button>
                    </div>
                )}
            </>
        );
    };

    // PHASE 5: FINAL (Instant Publish)
    const renderFinal = () => {
        // Generate Text Output
        const finalOutput = generateFinalOutput('text', history);

        return (
            <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-4">

                <div className="p-6 bg-slate-900 border border-emerald-500 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                        Content Draft Ready
                    </h2>
                    <p className="text-slate-400">Your content has been audited and finalized.</p>
                </div>

                {/* OUTPUT CARD */}
                <div className="bg-black/40 border border-slate-800 rounded-xl p-6 relative group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold text-slate-500 uppercase">Final Output Manifest</div>
                        <button
                            onClick={() => navigator.clipboard.writeText(finalOutput)}
                            className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <Copy size={12} /> Copy All
                        </button>
                    </div>

                    <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                        {finalOutput}
                    </pre>
                </div>
            </div>
        );
    };

    // --- 3. MAIN SWITCH ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader size={48} className="animate-spin text-emerald-500" />
                <p className="text-slate-400 animate-pulse font-mono text-sm">{statusMessage}</p>
            </div>
        );
    }

    return (
        <div className="pb-32 px-4">
            {currentPhase === 'vision' && renderVision()}
            {currentPhase === 'specs' && renderSpecs()}
            {currentPhase === 'blueprint' && renderBlueprint()}
            {currentPhase === 'critique' && renderCritique()}
            {currentPhase === 'done' && renderFinal()}

            {currentPhase === 'idle' && (
                <div className="text-center text-slate-500 mt-20 font-mono text-sm">
                    Initialize Hivemind to begin...
                </div>
            )}
        </div>
    );
};

export default TextFeed;
