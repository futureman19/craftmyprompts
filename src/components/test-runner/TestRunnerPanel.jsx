import React from 'react';
import { Terminal } from 'lucide-react';
import { useTestRunner } from '../../hooks/useTestRunner.js';
import TestRunnerControls from './TestRunnerControls.jsx';
import TestRunnerResults from './TestRunnerResults.jsx';
import GitHubModal from '../GitHubModal.jsx'; 

const TestRunnerPanel = ({ prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet, isSocialMode }) => {
    
    // 1. Initialize the "Brain"
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
                        <Terminal size={18} className="text-indigo-500" /> Test your prompt
                    </h3>
                </div>
            </div>

            {/* --- CONTENT SCROLL AREA --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* 1. CONTROLS DASHBOARD */}
                <TestRunnerControls 
                    viewMode={runner.viewMode}
                    provider={runner.provider}
                    
                    // Keys & Auth
                    geminiKey={runner.geminiKey}
                    openaiKey={runner.openaiKey}
                    groqKey={runner.groqKey}
                    anthropicKey={runner.anthropicKey}
                    isLoggedIn={runner.isLoggedIn}
                    
                    // Configs
                    refineConfig={runner.refineConfig}
                    swarmConfig={runner.swarmConfig}
                    battleConfig={runner.battleConfig} 
                    selectedModel={runner.selectedModel}
                    availableModels={runner.availableModels}
                    isUsingGlobalGemini={!!defaultApiKey && runner.geminiKey === defaultApiKey}
                    isUsingGlobalOpenAI={!!defaultOpenAIKey && runner.openaiKey === defaultOpenAIKey}
                    
                    // Handlers
                    onViewChange={runner.handleViewChange}
                    onProviderChange={runner.setProvider}
                    onGeminiKeyChange={runner.setGeminiKey}
                    onOpenaiKeyChange={runner.setOpenaiKey}
                    onGroqKeyChange={runner.setGroqKey}
                    onAnthropicKeyChange={runner.setAnthropicKey}
                    onClearKey={runner.clearKey}
                    onFetchModels={runner.fetchModels}
                    onModelChange={runner.setSelectedModel}
                    onRefineConfigChange={(key, val) => runner.setRefineConfig(prev => ({ ...prev, [key]: val }))}
                    onSwarmConfigChange={(key, val) => runner.setSwarmConfig(prev => ({ ...prev, [key]: val }))}
                    onBattleConfigChange={runner.setBattleConfig} 
                    
                    // New Agent Handlers
                    addSwarmAgent={runner.addSwarmAgent}
                    removeSwarmAgent={runner.removeSwarmAgent}
                    updateSwarmAgent={runner.updateSwarmAgent}
                />

                {/* 2. RESULTS DISPLAY */}
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
                    
                    // CTO UPDATE: Passing the Social Mode Flag
                    isSocialMode={isSocialMode}
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
                        runner.provider === 'battle' ? 'Start Versus' : 
                        (runner.provider === 'refine' ? 'Start Loop' : 
                        (runner.provider === 'swarm' ? 'Start Collab' : 'Run Test'))
                    )}
                </button>
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

export default TestRunnerPanel;