import React, { useState } from 'react';
import { 
    Loader, AlertTriangle, Check, Copy, Sparkles, Bot, 
    MonitorPlay, Bookmark, Split, Layers, Users, PlayCircle, FileCode 
} from 'lucide-react';
import CodeBlock from './CodeBlock';

const TestRunnerResults = ({ 
    loading, result, error, statusMessage, 
    provider, battleResults, refineSteps, refineView, swarmHistory, 
    // Actions
    onSaveSnippet, onShipCode, setRefineView,
    // CTO UPDATE: New Actions for Swarm Persistence
    onContinueSwarm, onCompileSwarm
}) => {
    const [copiedText, setCopiedText] = useState(null);
    const [savedText, setSavedText] = useState(null);

    // --- HELPERS ---
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

    // --- PARSER ---
    const renderResultContent = (text) => {
        if (!text) return null;
        const parts = text.split(/(```[\s\S]*?```)/g);

        return (
            <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {parts.map((part, index) => {
                    if (part.startsWith('```')) {
                        return <CodeBlock key={index} rawContent={part} onShip={onShipCode} />;
                    }
                    if (!part.trim() && parts.length > 1) return null;
                    return <div key={index} className="whitespace-pre-wrap mb-2">{part}</div>;
                })}
            </div>
        );
    };

    // --- RENDER ---
    
    // 1. Loading / Error States
    // Note: Swarm handles its own loading state inside the chat flow
    if (loading && provider !== 'battle' && provider !== 'refine' && provider !== 'swarm') {
        return (
            <div className="rounded-xl border p-4 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                 <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Loader size={16} className="animate-spin" /> {statusMessage || 'Generating...'}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border p-4 bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800">
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="overflow-hidden">
                        <strong className="block font-bold">Error</strong>
                        <span className="break-words">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Single Result (Gemini/OpenAI)
    if (result && provider !== 'battle' && provider !== 'refine' && provider !== 'swarm') {
        return (
            <div className={`rounded-xl border p-4 animate-in slide-in-from-bottom-2 fade-in ${provider === 'openai' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                <div className="relative">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 ${provider === 'openai' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        <Check size={14} /> Result
                        <div className="ml-auto flex items-center gap-2">
                             <button onClick={() => handleSave(result, 'Single Result')} className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                {savedText === 'Single Result' ? <Check size={10} className="text-emerald-500" /> : <Bookmark size={10} />} {savedText === 'Single Result' ? 'Saved' : 'Save'}
                            </button>
                            <button onClick={() => copyToClipboard(result, 'result')} className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                {copiedText === 'result' ? <Check size={10} /> : <Copy size={10} />} {copiedText === 'result' ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    {renderResultContent(result)}
                </div>
            </div>
        );
    }

    // 3. Battle Mode
    if (provider === 'battle' && (loading || battleResults)) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 fade-in">
                 <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 flex flex-col h-full relative">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-2">
                         <Sparkles size={18} /> Gemini
                         {battleResults?.gemini && (
                             <div className="ml-auto flex items-center gap-1">
                                 <button onClick={() => handleSave(battleResults.gemini, 'Gemini Battle')} className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded">{savedText === 'Gemini Battle' ? <Bookmark size={14} fill="currentColor"/> : <Bookmark size={14} />}</button>
                                 <button onClick={() => copyToClipboard(battleResults.gemini, 'gemini')} className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded">{copiedText === 'gemini' ? <Check size={14} /> : <Copy size={14} />}</button>
                             </div>
                         )}
                    </div>
                    {loading ? <div className="text-sm italic text-indigo-400">Thinking...</div> : renderResultContent(battleResults?.gemini)}
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 flex flex-col h-full relative">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                         <Bot size={18} /> GPT-4o
                         {battleResults?.openai && (
                             <div className="ml-auto flex items-center gap-1">
                                 <button onClick={() => handleSave(battleResults.openai, 'OpenAI Battle')} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">{savedText === 'OpenAI Battle' ? <Bookmark size={14} fill="currentColor"/> : <Bookmark size={14} />}</button>
                                 <button onClick={() => copyToClipboard(battleResults.openai, 'openai')} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">{copiedText === 'openai' ? <Check size={14} /> : <Copy size={14} />}</button>
                             </div>
                         )}
                    </div>
                    {loading ? <div className="text-sm italic text-emerald-400">Thinking...</div> : renderResultContent(battleResults?.openai)}
                </div>
            </div>
        );
    }

    // 4. Refine Mode
    if (provider === 'refine' && (loading || refineSteps)) {
        return (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                {loading && <div className="text-center text-sm font-bold text-amber-600 dark:text-amber-400 animate-pulse bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">{statusMessage}</div>}
                
                {refineView === 'timeline' ? (
                    <>
                        {refineSteps?.draft && (
                            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-500 mb-2">
                                    <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">Step 1</span> Draft
                                    <button onClick={() => handleSave(refineSteps.draft, 'Draft')} className="ml-auto p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded"><Bookmark size={12}/></button>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer overflow-hidden" title="Click to expand">
                                    {renderResultContent(refineSteps.draft)}
                                </div>
                            </div>
                        )}
                        
                        {refineSteps?.critique && (
                            <div className="flex flex-col items-center">
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 my-1"></div>
                                <div className="p-4 w-full bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-500 mb-2">
                                        <span className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">Step 2</span> Critique
                                        <button onClick={() => handleSave(refineSteps.critique, 'Critique')} className="ml-auto p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded"><Bookmark size={12}/></button>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                                        {renderResultContent(refineSteps.critique)}
                                    </div>
                                </div>
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 my-1"></div>
                            </div>
                        )}

                        {refineSteps?.final && (
                            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-lg relative">
                                <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-600 dark:text-amber-500 mb-3 border-b border-amber-200 dark:border-slate-700 pb-2">
                                    <Sparkles size={16} /> Final Polish
                                    <div className="ml-auto flex gap-1">
                                        <button onClick={() => handleSave(refineSteps.final, 'Refine Final')} className="text-[10px] bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 px-2 py-1 rounded hover:bg-amber-50 transition-colors flex items-center gap-1">
                                            {savedText === 'Refine Final' ? <Check size={12} /> : <Bookmark size={12} />} {savedText === 'Refine Final' ? 'Saved' : 'Save'}
                                        </button>
                                        <button onClick={() => copyToClipboard(refineSteps.final, 'final')} className="text-[10px] bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 px-2 py-1 rounded hover:bg-amber-50 transition-colors flex items-center gap-1">
                                            {copiedText === 'final' ? <Check size={12} /> : <Copy size={12} />} {copiedText === 'final' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                {renderResultContent(refineSteps.final)}
                            </div>
                        )}
                    </>
                ) : (
                    /* DIFF VIEW (Side by Side) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                         <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10 p-4 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 border-b border-red-200 dark:border-red-800 pb-2">
                                 <MonitorPlay size={18} /> Original Draft
                                 <button onClick={() => handleSave(refineSteps?.draft, 'Refine Draft')} className="ml-auto p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded"><Bookmark size={14} /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                {renderResultContent(refineSteps?.draft)}
                            </div>
                        </div>
                        
                        {/* After Panel */}
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                                 <Sparkles size={18} /> Final Polish
                                 <div className="ml-auto flex gap-1">
                                    <button onClick={() => handleSave(refineSteps?.final, 'Refine Final')} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded"><Bookmark size={14} /></button>
                                    <button onClick={() => copyToClipboard(refineSteps?.final, 'final')} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">{copiedText === 'final' ? <Check size={14} /> : <Copy size={14} />}</button>
                                 </div>
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
    
    // --- SWARM MODE RENDERER ---
    if (provider === 'swarm' && (loading || (swarmHistory && swarmHistory.length > 0))) {
        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in pb-4">
                 {/* Loading Indicator */}
                 {loading && <div className="text-center text-sm font-bold text-violet-600 dark:text-violet-400 animate-pulse bg-violet-50 dark:bg-violet-900/20 py-2 rounded-lg">{statusMessage}</div>}

                 {/* Chat History */}
                 <div className="space-y-4">
                    {swarmHistory && swarmHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.provider === 'openai' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 border shadow-sm ${msg.provider === 'openai' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50'}`}>
                                {/* Header */}
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 border-b pb-2 ${msg.provider === 'openai' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'}`}>
                                    {msg.provider === 'openai' ? <Bot size={14} /> : <Sparkles size={14} />}
                                    <span>{msg.role}</span>
                                    
                                    {/* Actions */}
                                    <div className="ml-auto flex items-center gap-1">
                                        <button onClick={() => handleSave(msg.text, `Swarm: ${msg.role}`)} className={`p-1 rounded transition-colors ${msg.provider === 'openai' ? 'hover:bg-emerald-200 dark:hover:bg-emerald-800' : 'hover:bg-indigo-200 dark:hover:bg-indigo-800'}`} title="Save Snippet">
                                            {savedText === `Swarm: ${msg.role}` ? <Check size={12} /> : <Bookmark size={12} />}
                                        </button>
                                        <button onClick={() => copyToClipboard(msg.text, `swarm-${idx}`)} className={`p-1 rounded transition-colors ${msg.provider === 'openai' ? 'hover:bg-emerald-200 dark:hover:bg-emerald-800' : 'hover:bg-indigo-200 dark:hover:bg-indigo-800'}`} title="Copy Text">
                                            {copiedText === `swarm-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Body */}
                                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {renderResultContent(msg.text)}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>

                 {/* CTO UPDATE: Swarm Action Bar (Continue / Compile) */}
                 {swarmHistory.length > 0 && !loading && (
                     <div className="flex gap-2 pt-2 animate-in slide-in-from-bottom-2">
                         <button 
                            onClick={() => onContinueSwarm(prompt)} 
                            className="flex-1 py-2 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                         >
                             <PlayCircle size={16} /> Continue Discussion
                         </button>
                         <button 
                            onClick={onCompileSwarm} 
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                         >
                             <FileCode size={16} /> Compile Code
                         </button>
                     </div>
                 )}
            </div>
        );
    }

    return null;
};
export default TestRunnerResults;