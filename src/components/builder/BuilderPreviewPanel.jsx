import React from 'react';
import { 
  FileText, Zap, RefreshCw, Check, Copy as CopyIcon, Braces, 
  Lock, Globe, Save, Bookmark, Play, ArrowLeft 
} from 'lucide-react';

const BuilderPreviewPanel = ({ 
    // State
    state, generatedPrompt, mobileTab, copied, copiedJson, 
    saveVisibility, isSaving,
    // Actions
    dispatch, setMobileTab, setSaveVisibility, handleCopy, 
    handleCopyJSON, handleUnifiedSave, handleSaveAsPreset, handleTestClick
}) => {

    // Helper to render the colored pills for variables
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
        <div className={`bg-slate-900 text-slate-100 flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex w-full'} md:w-96`}>
             
             {/* Header */}
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <div className="flex items-center gap-2">
                    {/* Back Button for Mobile */}
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

            {/* Preview Area */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300">
                <div className="whitespace-pre-wrap min-h-full">
                    {renderHighlightedPrompt(generatedPrompt)}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-4">
                
                {/* Copy Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleCopy} disabled={!generatedPrompt} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : (state.mode === 'text' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500')} text-white disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {copied ? <Check size={16} /> : <CopyIcon size={16} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleCopyJSON} disabled={!generatedPrompt} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {copiedJson ? <Check size={16} /> : <Braces size={16} />} {copiedJson ? 'JSON' : 'JSON'}
                    </button>
                </div>

                {/* Save Options */}
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                        <span className="font-bold uppercase tracking-wider">Save Options</span>
                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            <button onClick={() => setSaveVisibility('private')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'private' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Lock size={12} /> Private</button>
                            <button onClick={() => setSaveVisibility('public')} className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all ${saveVisibility === 'public' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={12} /> Public</button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="col-span-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                            <Save size={14} /> {isSaving ? 'Saving...' : (saveVisibility === 'public' ? 'Publish' : 'Save')}
                        </button>
                        <button onClick={handleSaveAsPreset} disabled={!generatedPrompt} className="col-span-1 py-2 bg-indigo-900/50 hover:bg-indigo-900 rounded-lg text-xs font-medium text-indigo-300 border border-indigo-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                            <Bookmark size={14} /> Save Preset
                        </button>
                    </div>
                </div>
                
                {/* Test Button */}
                <button 
                    onClick={handleTestClick} 
                    disabled={!generatedPrompt}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play size={14} fill="currentColor" /> Test with Gemini
                </button>
            </div>
        </div>
    );
};

export default BuilderPreviewPanel;