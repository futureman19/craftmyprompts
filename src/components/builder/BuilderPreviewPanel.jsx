import React from 'react';
import { 
  FileText, Zap, RefreshCw, Check, Copy as CopyIcon, Braces, 
  Lock, Globe, Save, Bookmark, ArrowLeft 
} from 'lucide-react';
import TestRunnerPanel from '../test-runner/TestRunnerPanel'; // <--- IMPORT ADDED

const BuilderPreviewPanel = ({ 
    // State
    state, generatedPrompt, mobileTab, copied, copiedJson, 
    saveVisibility, isSaving, globalApiKey, globalOpenAIKey, // <--- New Props needed
    // Actions
    dispatch, setMobileTab, setSaveVisibility, handleCopy, 
    handleCopyJSON, handleUnifiedSave, handleSaveAsPreset, handleSaveSnippet 
}) => {

    const renderHighlightedPrompt = (text) => {
        if (!text) return <span className="text-slate-500 italic">Your prompt will appear here...</span>;
        
        const parts = text.split(/(\{.*?\})/g);
        
        return parts.map((part, index) => {
            if (part.match(/^\{.*\}$/)) {
                return (
                    <span key={index} className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5 mx-0.5 font-bold font-mono text-xs align-middle">
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className={`bg-slate-900 text-slate-100 flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex w-full'} md:w-[600px]`}>
             
             {/* --- TOP SECTION: PROMPT PREVIEW --- */}
             <div className="flex flex-col h-2/5 border-b-4 border-slate-950">
                 <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMobileTab('edit')} className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
                        <h2 className="font-bold text-sm flex items-center gap-2"><FileText size={16} className={state.mode === 'text' ? 'text-indigo-400' : 'text-pink-400'} /> Preview</h2>
                    </div>
                    <div className="flex gap-2">
                        {state.mode === 'art' && (
                            <button onClick={() => dispatch({ type: 'MAGIC_EXPAND' })} className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded hover:opacity-90 transition-opacity text-white" title="Magic Expand"><Zap size={14} /></button>
                        )}
                        <button onClick={() => dispatch({ type: 'RESET' })} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors" title="Reset"><RefreshCw size={14} /></button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 bg-slate-900">
                    <div className="whitespace-pre-wrap min-h-full">
                        {renderHighlightedPrompt(generatedPrompt)}
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="p-2 border-t border-slate-800 bg-slate-900 flex gap-2">
                     <button onClick={handleCopy} disabled={!generatedPrompt} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} disabled:opacity-50`}>
                        {copied ? <Check size={14} /> : <CopyIcon size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save to Library'}
                    </button>
                </div>
            </div>

            {/* --- BOTTOM SECTION: TEST RUNNER (The New Panel) --- */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                <TestRunnerPanel 
                    prompt={generatedPrompt} 
                    defaultApiKey={globalApiKey} 
                    defaultOpenAIKey={globalOpenAIKey}
                    onSaveSnippet={handleSaveSnippet}
                />
            </div>
        </div>
    );
};

export default BuilderPreviewPanel;