import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Zap, RefreshCw, Check, Copy as CopyIcon, Braces,
    Lock, Globe, Save, Bookmark, ArrowLeft, BookmarkPlus, MessageSquare
} from 'lucide-react';
// Updated import path with explicit extension for reliability
import TestRunnerPanel from '../test-runner/TestRunnerPanel.jsx';

const BuilderPreviewPanel = ({
    // State
    state, generatedPrompt, mobileTab, copied, copiedJson,
    saveVisibility, isSaving, globalApiKey, globalOpenAIKey,
    // Actions
    dispatch, setMobileTab, setSaveVisibility, handleCopy,
    handleCopyJSON, handleUnifiedSave, handleSaveAsPreset, handleSaveSnippet
}) => {
    const navigate = useNavigate();

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

    // Calculate if we are in Social Mode to conditionally show the Virality Scorecard
    const isSocialMode = state.mode === 'text' && state.textSubMode === 'social';

    return (
        <div className={`bg-slate-900 text-slate-100 flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex w-full'} md:w-[600px]`}>

            {/* --- TOP SECTION: PROMPT PREVIEW --- */}
            <div className="flex flex-col h-2/5 border-b-4 border-slate-950">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMobileTab('edit')} className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
                        <h2 className="font-bold text-sm flex items-center gap-2"><FileText size={16} className={state.mode === 'text' ? 'text-indigo-400' : 'text-pink-400'} /> Preview</h2>
                    </div>
                    <div className="flex gap-2">
                        {/* CTO UPDATE: Added Save as Preset Button */}
                        <button
                            onClick={handleSaveAsPreset}
                            className="p-1.5 hover:bg-slate-800 rounded text-amber-500 hover:text-amber-400 transition-colors"
                            title="Save current setup as Preset"
                        >
                            <BookmarkPlus size={14} />
                        </button>

                        <div className="w-px h-4 bg-slate-800 my-auto mx-1"></div>

                        <button
                            onClick={() => navigate('/agent', { state: { prompt: generatedPrompt } })}
                            className="p-1.5 hover:bg-slate-800 rounded text-fuchsia-500 hover:text-fuchsia-400 transition-colors"
                            title="Ask Agent"
                        >
                            <MessageSquare size={14} />
                        </button>

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
                <div className="p-2 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                    <button onClick={handleCopy} disabled={!generatedPrompt} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} disabled:opacity-50`}>
                        {copied ? <Check size={14} /> : <CopyIcon size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>

                    {/* VISIBILITY TOGGLE */}
                    <button
                        onClick={() => setSaveVisibility(saveVisibility === 'public' ? 'private' : 'public')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${saveVisibility === 'public'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}
                        title={saveVisibility === 'public' ? "Public: Visible in Community Feed" : "Private: Only visible to you"}
                    >
                        {saveVisibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                        <span>{saveVisibility === 'public' ? 'Public' : 'Private'}</span>
                    </button>

                    <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* --- BOTTOM SECTION: TEST RUNNER --- */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                <TestRunnerPanel
                    prompt={generatedPrompt}
                    defaultApiKey={globalApiKey}
                    defaultOpenAIKey={globalOpenAIKey}
                    onSaveSnippet={handleSaveSnippet}
                    isSocialMode={isSocialMode} // <--- PASSING THE PROP
                />
            </div>
        </div>
    );
};

export default BuilderPreviewPanel;