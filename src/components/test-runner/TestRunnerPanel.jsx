import React from 'react';
import { Terminal } from 'lucide-react';
import { useTestRunner } from '../../hooks/useTestRunner';
import TestRunnerControls from './TestRunnerControls';
import TestRunnerResults from './TestRunnerResults';
import GitHubModal from '../GitHubModal';

const TestRunnerPanel = ({ prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet }) => {
    
    // 1. Initialize the "Brain" (Reusing the same hook!)
    const runner = useTestRunner(defaultApiKey, defaultOpenAIKey);

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700">
            
            {/* --- HEADER --- */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-500" /> Test Runner
                    </h3>
                    {/* No Close Button needed for Panel version */}
                </div>
            </div>

            {/* --- CONTENT SCROLL AREA --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
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

                {/* 2. RESULTS DISPLAY */}
                {/* We removed the "Prompt Preview" box here because the user can see the prompt in the main editor on the left! */}
                
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
                    onContinueSwarm={runner.continueSwarm}
                    onCompileSwarm={runner.compileSwarmCode}
                />
            </div>

            {/* --- FOOTER --- */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <button 
                    onClick={handleRunClick}
                    disabled={
                        runner.loading || 
                        (runner.viewMode === 'advanced' && (!runner.geminiKey || !runner.openaiKey)) || 
                        (runner.viewMode === 'simple' && runner.provider === 'gemini' && !runner.geminiKey) || 
                        (runner.viewMode === 'simple' && runner.provider === 'openai' && !runner.openaiKey)
                    }
                    className={`w-full py-3 text-white rounded-lg text-sm font-bold shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${
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

            {/* GitHub Modal (Triggered by the hook logic) */}
            <GitHubModal 
                isOpen={runner.showGithub} 
                onClose={() => runner.setShowGithub(false)} 
                codeToPush={runner.codeToShip} 
            />
        </div>
    );
};

export default TestRunnerPanel;