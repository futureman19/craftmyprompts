import React, { useState, useMemo, useEffect } from 'react';
import {
    Loader, AlertTriangle, Check, Copy, Sparkles, Bot,
    MonitorPlay, Bookmark, Eye, Code, X,
    Gauge, Maximize2, Brain, ChevronDown, ChevronRight, PlayCircle, FileCode, Zap, Layers, Package, Download
} from 'lucide-react';
import CodeBlock from './CodeBlock.jsx';
import SwarmResultGrid from './SwarmResultGrid.jsx';
import ArenaResultGrid from './ArenaResultGrid.jsx';
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx';
import FileDeck from '../agent/FileDeck.jsx';
import VisionaryDeck from '../agent/VisionaryDeck.jsx';
import { validateVirality } from '../../utils/viralityValidator.js';

// --- HELPER 1: LIVE PREVIEW IFRAME ---
const LivePreview = ({ content, onClose }) => {
    const extractCode = (typeRegex) => {
        const regex = new RegExp(`\`\`\`(${typeRegex})([\\s\\S]*?)\`\`\``, 'i');
        const match = content.match(regex);
        return match ? match[2] : null;
    };

    let html = extractCode('html');
    let css = extractCode('css');
    let js = extractCode('js|javascript');
    let jsx = extractCode('jsx|react|tsx');

    let scriptType = 'text/javascript';
    let processedScript = js || '';
    let isReact = false;

    // Detect React/JSX content and wrap in mounting logic
    if (!html && (jsx || (js && (js.includes('import React') || js.includes('export default') || js.includes('return <'))))) {
        isReact = true;
        scriptType = 'text/babel';
        let reactCode = jsx || js;

        // Sanitize imports for browser
        reactCode = reactCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

        let componentName = 'App';
        // Try to find the component name
        const exportMatch = reactCode.match(/export\s+default\s+(?:function\s+)?(\w+)/);
        if (exportMatch) {
            componentName = exportMatch[1];
            reactCode = reactCode.replace(/export\s+default\s+(?:function\s+)?/, 'function ');
        } else {
            const firstComp = reactCode.match(/function\s+([A-Z]\w+)/);
            if (firstComp) componentName = firstComp[1];
        }

        processedScript = `
            ${reactCode}
            try {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                if (typeof ${componentName} !== 'undefined') {
                    root.render(React.createElement(${componentName}));
                } else {
                    document.body.innerHTML = '<div style="color:red;padding:20px;">Component "${componentName}" not found.</div>';
                }
            } catch (e) {
                document.body.innerHTML = '<div style="color:red;padding:20px;">Runtime Error: ' + e.message + '</div>';
            }
        `;
    }

    const rawHtml = (!html && !isReact && content.trim().startsWith('<')) ? content : html;

    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://cdn.tailwindcss.com"></script>
                <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <style>body { font-family: sans-serif; margin: 0; background: #fff; min-height: 100vh; } ${css || ''}</style>
            </head>
            <body>
                <div id="root">${rawHtml || (isReact ? '' : '<div style="display:flex;height:100vh;align-items:center;justify-content:center;color:#ccc;">Loading...</div>')}</div>
                <script type="${scriptType}" data-presets="react">${processedScript}</script>
            </body>
        </html>
    `;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full max-w-6xl rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
                <div className="flex justify-between items-center p-3 border-b bg-slate-50">
                    <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><Eye size={16} /> Live Preview</span>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <iframe srcDoc={srcDoc} title="Preview" className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-modals allow-same-origin" />
            </div>
        </div>
    );
};

// --- HELPER 2: MAXIMIZED VIEW ---
const MaximizedResult = ({ content, onClose, renderContent }) => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full h-full max-w-5xl rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Check size={20} className="text-emerald-500" /> Full Result</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-900"><div className="max-w-4xl mx-auto">{renderContent(content)}</div></div>
        </div>
    </div>
);

// --- HELPER 3: AoT PARSER (New Logic) ---
// Extracts <Thinking> tags and renders them in a collapsible accordion
const AoTResult = ({ text, renderContent }) => {
    const [showThinking, setShowThinking] = useState(false);
    if (!text) return null;

    const thinkingMatch = text.match(/<Thinking>([\s\S]*?)<\/Thinking>/i);
    const outputMatch = text.match(/<Output>([\s\S]*?)<\/Output>/i);

    const reasoning = thinkingMatch ? thinkingMatch[1].trim() : null;
    const finalOutput = outputMatch ? outputMatch[1].trim() : (reasoning ? text.replace(/<Thinking>[\s\S]*?<\/Thinking>/i, '').trim() : text);

    return (
        <div className="space-y-4">
            {reasoning && (
                <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 overflow-hidden">
                    <button onClick={() => setShowThinking(!showThinking)} className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors">
                        <div className="flex items-center gap-2"><Brain size={14} className="animate-pulse" /> Reasoning Trace</div>
                        {showThinking ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {showThinking && <div className="p-4 border-t border-indigo-100 dark:border-indigo-900/50 text-sm font-mono text-indigo-800 dark:text-indigo-200 leading-relaxed bg-indigo-50 dark:bg-indigo-950/30">{renderContent(reasoning)}</div>}
                </div>
            )}
            <div>{renderContent(finalOutput)}</div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const TestRunnerResults = ({
    loading, result, error, statusMessage,
    provider, battleResults, battleConfig, refineSteps, refineView, swarmHistory,
    prompt, onSaveSnippet, onShipCode, setRefineView,
    onContinueSwarm, onCompileSwarm, isSocialMode, onBlueprintDetected,
    onLoopBack, onSynthesize
}) => {
    // Local Feedback State
    const [feedback, setFeedback] = useState('');

    // Placeholder Handler for Deployment
    const handleDownloadPlaceholder = () => {
        alert("Artifact Engine is coming soon! (Development Placeholder)");
    };

    // --- BLUEPRINT DETECTION ---
    useEffect(() => {
        if (result && !loading) {
            // Check for File Tree JSON structure specific to Architect output
            const match = result.match(/\{[\s\S]*"structure"[\s\S]*\[[\s\S]*"path"[\s\S]*\}/);
            if (match && onBlueprintDetected) {
                try {
                    // Try to parse just to be safe before broadcasting
                    const clean = match[0].trim();
                    JSON.parse(clean);
                    // It's valid! Broadcast it up.
                    onBlueprintDetected(clean);
                } catch (e) {
                    // Ignore invalid JSON
                }
            }
        }
    }, [result, loading, onBlueprintDetected]);


    // 2. BATTLE MODE (Arena)
    if (provider === 'battle' && (loading || battleResults)) {
        // Adapt Object {fighterA, fighterB} -> Array [fighterA, fighterB] for Grid
        const arenaData = battleResults ? [
            { ...battleResults.fighterA, content: battleResults.fighterA.text, role: battleResults.fighterA.name, id: 'fighterA' },
            { ...battleResults.fighterB, content: battleResults.fighterB.text, role: battleResults.fighterB.name, id: 'fighterB' }
        ] : [];

        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 h-full">
                <ArenaResultGrid
                    results={arenaData}
                    loading={loading}
                // config prop removed as new component doesn't use it
                />
            </div>
        );
    }
    const [previewMode, setPreviewMode] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [copiedText, setCopiedText] = useState(null);
    const [savedText, setSavedText] = useState(null);

    const { score, checks } = useMemo(() => validateVirality(result, prompt), [result, prompt]);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const handleSave = (text, label) => {
        if (onSaveSnippet) {
            onSaveSnippet(text, label);
            setSavedText(label);
            setTimeout(() => setSavedText(null), 2000);
        }
    };

    const renderResultContent = (text) => {
        if (!text) return null;
        const parts = text.split(/(```[\s\S]*?```)/g);
        return (
            <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {parts.map((part, index) => {
                    if (part.startsWith('```')) return <CodeBlock key={index} rawContent={part} onShip={onShipCode} />;
                    if (!part.trim() && parts.length > 1) return null;
                    return <div key={index} className="whitespace-pre-wrap mb-2">{part}</div>;
                })}
            </div>
        );
    };

    if (loading && !['battle', 'refine', 'swarm'].includes(provider)) {
        return <div className="rounded-xl border p-4 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"><Loader size={16} className="animate-spin" /> {statusMessage || 'Generating...'}</div>;
    }

    if (error) {
        return <div className="rounded-xl border p-4 bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm"><AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><div className="overflow-hidden"><strong className="block font-bold">Error</strong><span className="break-words">{error}</span></div></div>;
    }

    // 1. STANDARD RESULT (Gemini/OpenAI/Auto)
    if (result && !['battle', 'refine', 'swarm'].includes(provider)) {
        return (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                {isSocialMode && checks.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
                            <div className="flex items-center gap-2"><Gauge size={16} className={score >= 80 ? 'text-emerald-500' : 'text-amber-500'} /><span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Virality Scorecard</span></div>
                            <span className={`text-xs font-black px-2 py-0.5 rounded ${score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : (score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}`}>{score}/100</span>
                        </div>
                        <div className="p-4 grid gap-2">{checks.map((c, i) => <div key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">{c.status === 'pass' ? <Check size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />} {c.message}</div>)}</div>
                    </div>
                )}
                <div className="rounded-xl border p-4 bg-slate-50 border-slate-200 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between text-xs font-bold uppercase mb-2 text-indigo-600">
                        <div className="flex items-center gap-2"><Check size={14} /> Result</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMaximized(true)} className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-400"><Maximize2 size={14} /></button>
                            <div className="flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border">
                                <button onClick={() => setPreviewMode(false)} className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${!previewMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`}><Code size={12} /> Code</button>
                                <button onClick={() => setPreviewMode(true)} className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${previewMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`}><Eye size={12} /> Preview</button>
                            </div>
                            <button onClick={() => handleSave(result, 'Result')} className="p-1.5 border rounded hover:bg-white dark:hover:bg-slate-800"><Bookmark size={12} /></button>
                            <button onClick={() => copyToClipboard(result, 'res')} className="p-1.5 border rounded hover:bg-white dark:hover:bg-slate-800"><Copy size={12} /></button>
                        </div>
                    </div>
                    {/* UPDATED: Uses AoTResult wrapper */}
                    {previewMode ? <LivePreview content={result} onClose={() => setPreviewMode(false)} /> : <AoTResult text={result} renderContent={renderResultContent} />}
                </div>
                {maximized && <MaximizedResult content={result} onClose={() => setMaximized(false)} renderContent={(t) => <AoTResult text={t} renderContent={renderResultContent} />} />}
            </div>
        );
    }

    // 2. BATTLE MODE (Arena)
    if (provider === 'battle' && (loading || battleResults)) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 h-full">
                <ArenaResultGrid
                    results={battleResults}
                    loading={loading}
                    renderContent={renderResultContent} // Pass the smart renderer (with code blocks)
                />
            </div>
        );
    }

    // 3. REFINE MODE (Restored with AoT)
    if (provider === 'refine' && (loading || refineSteps)) {
        return (
            <div className="space-y-4 animate-in fade-in">
                {loading && <div className="text-center text-sm font-bold text-amber-600 dark:text-amber-400 animate-pulse bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">{statusMessage}</div>}

                {refineView === 'timeline' ? (
                    <>
                        {refineSteps?.draft && (
                            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-500 mb-2">
                                    <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">Step 1</span> Draft
                                    <button onClick={() => handleSave(refineSteps.draft, 'Draft')} className="ml-auto p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded"><Bookmark size={12} /></button>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <AoTResult text={refineSteps.draft} renderContent={renderResultContent} />
                                </div>
                            </div>
                        )}
                        {refineSteps?.critique && (
                            <div className="p-4 w-full bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-500 mb-2">
                                    <span className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">Step 2</span> Critique
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                                    <AoTResult text={refineSteps.critique} renderContent={renderResultContent} />
                                </div>
                            </div>
                        )}
                        {refineSteps?.final && (
                            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-lg">
                                <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-600 dark:text-amber-500 mb-3 border-b border-amber-200 dark:border-slate-700 pb-2">
                                    <Sparkles size={16} /> Final Polish
                                    <button onClick={() => handleSave(refineSteps.final, 'Refine Final')} className="ml-auto p-1.5 hover:bg-amber-100 rounded"><Bookmark size={14} /></button>
                                </div>
                                <AoTResult text={refineSteps.final} renderContent={renderResultContent} />
                            </div>
                        )}
                    </>
                ) : (
                    /* DIFF VIEW PLACEHOLDER */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10 p-4 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 border-b border-red-200 dark:border-red-800 pb-2">
                                <MonitorPlay size={18} /> Original Draft
                            </div>
                            <div className="overflow-y-auto flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                {renderResultContent(refineSteps?.draft)}
                            </div>
                        </div>
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                                <Sparkles size={18} /> Final Polish
                            </div>
                            <div className="overflow-y-auto flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                {renderResultContent(refineSteps?.final)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 4. SWARM MODE (Storyline / Narrative)
    if (provider === 'swarm' && (loading || swarmHistory?.length > 0)) {
        return (
            <div className="h-full flex flex-col">
                {/* Timeline Container */}
                <div className="flex-1 flex gap-6 overflow-x-auto p-4 snap-x scrollbar-thin scrollbar-thumb-slate-700">

                    {/* Render History Cards */}
                    {swarmHistory.map((msg, idx) => {
                        const isLast = idx === swarmHistory.length - 1;

                        // --- VISIONARY OPTIONS RENDER ---
                        if (msg.type === 'vision_options') {
                            let deckData = null;
                            try {
                                // 1. If it's already an object, use it.
                                if (typeof msg.text === 'object' && msg.text !== null) {
                                    deckData = msg.text;
                                } else {
                                    // 2. If string, try to extract the JSON block { ... }
                                    const jsonMatch = msg.text.match(/\{[\s\S]*\}/);
                                    if (jsonMatch) {
                                        deckData = JSON.parse(jsonMatch[0]);
                                    } else {
                                        // Fallback: Try cleaning markdown code blocks explicitly
                                        const clean = msg.text.replace(/```json|```/g, '').trim();
                                        deckData = JSON.parse(clean);
                                    }
                                }
                            } catch (e) {
                                console.error("Deck JSON Parse Error", e);
                                // Keep deckData null to trigger the error UI in the component
                            }

                            return (
                                <VisionaryDeck
                                    key={idx}
                                    data={deckData}
                                    onConfirm={(choices) => {
                                        // Safety check: ensure onLoopBack is valid
                                        if (onLoopBack) onLoopBack(choices);
                                    }}
                                />
                            );
                        }

                        // --- ARCHITECT SPECIAL RENDER (Visual Blueprint) ---
                        if (msg.role?.includes('Architect')) {
                            let blueprintData = null;
                            let modulesData = [];
                            try {
                                const jsonMatch = msg.text.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    if (parsed.structure) blueprintData = parsed.structure;
                                    if (parsed.modules) modulesData = parsed.modules;
                                }
                            } catch (e) {
                                console.log("Blueprint parse error", e);
                            }

                            return (
                                <div key={idx} className="min-w-[300px] w-[85%] md:w-[500px] snap-center flex flex-col h-full bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
                                    {/* Header */}
                                    <div className="p-4 border-b border-cyan-500/20 bg-slate-950/50 flex items-center gap-3">
                                        <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-cyan-500 tracking-wider">Phase {idx + 1}</div>
                                            <div className="font-bold text-slate-100">The Architect</div>
                                        </div>
                                    </div>

                                    {/* Content: Visual Tree or Text */}
                                    <div className="flex-1 overflow-y-auto bg-slate-950/30">
                                        {blueprintData ? (
                                            <div className="p-2">
                                                <ProjectBlueprint structure={blueprintData} />
                                                <FileDeck modules={modulesData} />
                                            </div>
                                        ) : (
                                            <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                                                {msg.text}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    {isLast && !loading && (
                                        <div className="p-4 border-t border-cyan-500/20 bg-slate-950/50 flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {blueprintData ? "Structure Generated" : "Awaiting Structure..."}
                                            </span>
                                            {/* Note: In the new flow, this might be handled by auto-transition or explicit confirmation elsewhere, 
                                                but for now we keep the button if it's the strict 'Architect' role without 'vision_options' type. */}
                                            <button onClick={() => onContinueSwarm("Approve Blueprint")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20">
                                                <AlertTriangle size={14} /> Send to Critic
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // --- EXECUTIVE SPECIAL RENDER (Deployment Card) ---
                        if (msg.role?.includes('Executive') || msg.role?.includes('Build Master')) {
                            // Attempt to parse JSON name/desc if available, otherwise use defaults
                            let projectData = { project_name: "Project Alpha", description: "Build complete." };
                            try {
                                const cleanJson = msg.text.replace(/```json\n|\n```/g, '');
                                const parsed = JSON.parse(cleanJson);
                                if (parsed.project_name) projectData = parsed;
                            } catch (e) { }

                            return (
                                <div key={idx} className="min-w-[300px] w-[85%] md:w-[400px] snap-center flex flex-col h-full bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
                                    {/* Header Glow */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />

                                    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center gap-4 mt-2">
                                        {/* Icon */}
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                                            <Package size={32} className="text-emerald-500" />
                                        </div>

                                        {/* Text */}
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {projectData.project_name}
                                            </h3>
                                            <p className="text-xs text-slate-400 max-w-[250px] mx-auto">
                                                {projectData.description || "System synthesis complete. Ready for deployment."}
                                            </p>
                                        </div>

                                        {/* Disabled Action Button */}
                                        <button
                                            onClick={handleDownloadPlaceholder}
                                            className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700 mt-4"
                                        >
                                            <Download size={18} /> Download .ZIP (Soon)
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // --- SPECIAL RENDER: CRITIC (Decision Card) ---
                        if (msg.role?.includes('Critic')) {
                            let data = { critique: msg.text, options: [] };
                            try {
                                const jsonMatch = msg.text.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    if (parsed) data = { ...data, ...parsed };
                                }
                            } catch (e) { }

                            return (
                                <div key={idx} className="min-w-[300px] w-[85%] md:w-[400px] snap-center flex flex-col h-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
                                    {/* Header */}
                                    <div className="p-4 border-b border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 flex items-center gap-3">
                                        <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Audit Phase</div>
                                            <div className="font-bold text-slate-800 dark:text-slate-100">The Critic</div>
                                        </div>
                                    </div>

                                    {/* Critique Content */}
                                    <div className="flex-1 p-5 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 space-y-4">
                                        <div className="whitespace-pre-wrap">{data.critique || msg.text}</div>

                                        {/* The Question */}
                                        {data.question && (
                                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/40">
                                                <div className="text-[10px] font-bold uppercase text-rose-500 mb-1">Question</div>
                                                <div className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                                    {data.question}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions (Only for latest step) */}
                                    {isLast && !loading && (
                                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col gap-3">

                                            {/* DECISION CHIPS (The New Feature) */}
                                            {data.options && data.options.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-2">Choose your path:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.options.map((opt, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    onLoopBack(opt);
                                                                    setFeedback(''); // Clear manual input if any
                                                                }}
                                                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 rounded-full text-xs font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fallback Manual Input */}
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:text-slate-200"
                                                    placeholder="Or type manual instructions..."
                                                    rows={2}
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (!feedback.trim()) return;
                                                            onLoopBack(feedback);
                                                            setFeedback('');
                                                        }}
                                                        disabled={!feedback.trim()}
                                                        className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Refine Plan
                                                    </button>
                                                    <button
                                                        onClick={onSynthesize}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                                    >
                                                        <Zap size={14} /> Ship It
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // --- STANDARD RENDER (Visionary, CEO, etc.) ---
                        // Map Role to Icon/Color
                        let RoleIcon = Bot;
                        let roleColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

                        if (msg.role?.includes('Visionary') || msg.role?.includes('CEO')) { RoleIcon = Sparkles; roleColor = 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'; }
                        else if (msg.role?.includes('Executive')) { RoleIcon = Check; roleColor = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'; }

                        return (
                            <div key={idx} className="min-w-[300px] w-[85%] md:w-[400px] snap-center flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-right-4 duration-500">
                                {/* Card Header */}
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${roleColor}`}>
                                            <RoleIcon size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phase {idx + 1}</div>
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{msg.role}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => copyToClipboard(msg.text, idx)} className="text-slate-400 hover:text-white p-1"><Copy size={14} /></button>
                                </div>

                                {/* Card Content */}
                                <div className="flex-1 p-5 overflow-y-auto font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <AoTResult text={msg.text} renderContent={renderResultContent} />
                                </div>

                                {/* Interactive Footer (Only for the latest step) */}
                                {isLast && !loading && (
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
                                        {/* SIMPLE VISIONARY APPROVAL */}
                                        {msg.role?.includes('Visionary') ? (
                                            <button onClick={() => onContinueSwarm("Approve Vision")} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
                                                <Layers size={16} /> Approve & Architect
                                            </button>
                                        ) : (
                                            <button onClick={() => onContinueSwarm("Continue")} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold">
                                                Continue
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Loading Card (Ghost) */}
                    {loading && (
                        <div className="min-w-[300px] w-[85%] md:w-[400px] snap-center flex flex-col h-full bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 items-center justify-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                <Loader size={24} className="animate-spin text-slate-400" />
                            </div>
                            <div className="text-sm font-medium text-slate-400">{statusMessage}</div>
                        </div>
                    )}

                    {/* Spencer for scrolling */}
                    <div className="min-w-[20px]"></div>
                </div>

                {/* HIVEMIND ACTIONS (Persistent Command Deck) */}
                {provider === 'swarm' && !loading && swarmHistory.length > 0 && (
                    <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700 backdrop-blur-sm animate-in slide-in-from-bottom-4 shadow-2xl z-20">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-slate-700"></div>
                            <span className="text-[10px] uppercase font-bold text-slate-500">Command Deck</span>
                            <div className="h-px flex-1 bg-slate-700"></div>
                        </div>

                        <div className="flex gap-3">
                            {/* INPUT FOR REFINEMENT */}
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Feedback (e.g., 'Add sound features')"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            onLoopBack(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    id="loop-input"
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('loop-input');
                                        if (input.value.trim()) {
                                            onLoopBack(input.value);
                                            input.value = '';
                                        }
                                    }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all border border-slate-600"
                                >
                                    Refine Loop
                                </button>
                            </div>

                            {/* COMPILE BUTTON */}
                            <button
                                onClick={onCompileSwarm}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                            >
                                <Zap size={14} /> Compile Build
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default TestRunnerResults;