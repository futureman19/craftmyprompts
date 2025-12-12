import React from 'react';
import { X, Terminal } from 'lucide-react';
import { useTestRunner } from '../hooks/useTestRunner';
import TestRunnerControls from './test-runner/TestRunnerControls';
import TestRunnerResults from './test-runner/TestRunnerResults';
import GitHubModal from './GitHubModal';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet }) => {
    
    // 1. Initialize the "Brain" (Custom Hook)
    const runner = useTestRunner(defaultApiKey, defaultOpenAIKey);

    if (!isOpen) return null;

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            {/* Dynamic Width based on mode */}
            <div className={`bg-white dark:bg-slate-900 w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${runner.provider === 'battle' || runner.provider === 'refine' || runner.provider === 'swarm' ? 'max-w-6xl' : 'max-w-2xl'}`}>
                
                {/* --- HEADER --- */}
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Terminal size={18} className="text-indigo-500" /> Test Prompt
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* --- CONTENT SCROLL AREA --- */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    
                    {/* 1. CONTROLS DASHBOARD */}
                    <TestRunnerControls 
                        viewMode={runner.viewMode}
                        provider={runner.provider}
                        geminiKey={runner.geminiKey}
                        openaiKey={runner.openaiKey}
                        refineConfig={runner.refineConfig}
                        swarmConfig={runner.swarmConfig}
                        selectedModel={runner.selectedModel}
                        availableModels={runner.availableModels}
                        isUsingGlobalGemini={!!defaultApiKey && runner.geminiKey === defaultApiKey}
                        isUsingGlobalOpenAI={!!defaultOpenAIKey && runner.openaiKey === defaultOpenAIKey}
                        
                        onViewChange={runner.handleViewChange}
                        onProviderChange={runner.setProvider}
                        onGeminiKeyChange={runner.setGeminiKey}
                        onOpenaiKeyChange={runner.setOpenaiKey}
                        onClearKey={runner.clearKey}
                        onFetchModels={runner.fetchModels}
                        onModelChange={runner.setSelectedModel}
                        onRefineConfigChange={(key, val) => runner.setRefineConfig(prev => ({ ...prev, [key]: val }))}
                        onSwarmConfigChange={(key, val) => runner.setSwarmConfig(prev => ({ ...prev, [key]: val }))}
                    />

                    {/* 2. PROMPT PREVIEW (Only show if no results yet) */}
                    {(!runner.battleResults && !runner.refineSteps && !runner.result && (!runner.swarmHistory || runner.swarmHistory.length === 0)) && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Current Prompt</label>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                                {prompt}
                            </div>
                        </div>
                    )}

                    {/* 3. RESULTS DISPLAY */}
                    <TestRunnerResults 
                        loading={runner.loading}
                        result={runner.result}
                        error={runner.error}
                        statusMessage={runner.statusMessage}
                        provider={runner.provider}
                        battleResults={runner.battleResults}
                        refineSteps={runner.refineSteps}
                        refineView={runner.refineView}
                        swarmHistory={runner.swarmHistory}
                        prompt={prompt}
                        
                        onSaveSnippet={onSaveSnippet}
                        onShipCode={runner.handleShipCode}
                        setRefineView={runner.setRefineView}
                        
                        // --- CTO FIX: Passing the missing functions ---
                        onContinueSwarm={runner.continueSwarm}
                        onCompileSwarm={runner.compileSwarmCode}
                    />
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleRunClick}
                        disabled={
                            runner.loading || 
                            (runner.viewMode === 'advanced' && (!runner.geminiKey || !runner.openaiKey)) || 
                            (runner.viewMode === 'simple' && runner.provider === 'gemini' && !runner.geminiKey) || 
                            (runner.viewMode === 'simple' && runner.provider === 'openai' && !runner.openaiKey)
                        }
                        className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${
                            runner.provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' : 
                            (runner.provider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 
                            (runner.provider === 'swarm' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                            (runner.provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700')))
                        }`}
                    >
                        {runner.loading ? 'Running...' : (
                            runner.provider === 'battle' ? 'Start Battle' : 
                            (runner.provider === 'refine' ? 'Start Loop' : 
                            (runner.provider === 'swarm' ? 'Start Meeting' : 'Run Test'))
                        )}
                    </button>
                </div>
            </div>

            {/* GitHub Modal */}
            <GitHubModal 
                isOpen={runner.showGithub} 
                onClose={() => runner.setShowGithub(false)} 
                codeToPush={runner.codeToShip} 
            />
        </div>
    );
};

export default TestRunnerModal;