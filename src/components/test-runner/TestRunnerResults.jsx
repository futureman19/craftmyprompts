import React, { useState, useMemo } from 'react';
import {
    Loader, AlertTriangle, Check, Copy, Sparkles, Bot,
    MonitorPlay, Bookmark, Eye, Code, X,
    Gauge, Maximize2, Brain, ChevronDown, ChevronRight, PlayCircle, FileCode
} from 'lucide-react';
import CodeBlock from './CodeBlock.jsx';
import SwarmResultGrid from './SwarmResultGrid.jsx';
import ArenaResultGrid from './ArenaResultGrid.jsx';
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
    provider, battleResults, refineSteps, refineView, swarmHistory,
    prompt, onSaveSnippet, onShipCode, setRefineView,
    onContinueSwarm, onCompileSwarm, isSocialMode
}) => {
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

    // 4. SWARM MODE
    if (provider === 'swarm' && (loading || swarmHistory?.length > 0)) {
        return (
            <div className="space-y-4 animate-in fade-in pb-4">
                {swarmHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.provider === 'openai' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 border ${msg.provider === 'openai' ? 'bg-emerald-50' : 'bg-indigo-50'} dark:bg-slate-800`}>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2 border-b pb-1">
                                {msg.role} <button onClick={() => copyToClipboard(msg.text, idx)} className="ml-auto p-1"><Copy size={12} /></button>
                            </div>
                            <div className="text-sm">
                                <AoTResult text={msg.text} renderContent={renderResultContent} />
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-center text-sm font-bold text-violet-500 animate-pulse">{statusMessage}</div>}
                {!loading && swarmHistory.length > 0 && (
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => onContinueSwarm(prompt)} className="flex-1 py-2 bg-violet-100 text-violet-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2"><PlayCircle size={16} /> Continue</button>
                        <button onClick={onCompileSwarm} className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"><FileCode size={16} /> Compile</button>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default TestRunnerResults;