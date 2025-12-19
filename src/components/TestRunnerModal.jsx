import React from 'react';
import { X, Terminal } from 'lucide-react';
import { useTestRunner } from '../hooks/useTestRunner.js';
import TestRunnerControls from './test-runner/TestRunnerControls.jsx';
import TestRunnerResults from './test-runner/TestRunnerResults.jsx';
import GitHubModal from './GitHubModal.jsx';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet }) => {

    // 1. Initialize the "Brain" (Custom Hook)
    const runner = useTestRunner(defaultApiKey, defaultOpenAIKey);

    if (!isOpen) return null;

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 md:p-4 animate-in fade-in duration-200">
            {/* MOBILE OPTIMIZATION: Full screen on mobile, Card on desktop */}
            <div className={`bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300 ${runner.provider === 'battle' || runner.provider === 'refine' || runner.provider === 'swarm' ? 'md:max-w-6xl' : 'md:max-w-2xl'}`}>

                {/* --- HEADER --- */}
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Terminal size={18} className="text-indigo-500" /> Test Prompt
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* --- CONTENT SCROLL AREA --- */}
                <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6 bg-white dark:bg-slate-900">

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

                        // New Dynamic Agent Handlers
                        addSwarmAgent={runner.addSwarmAgent}
                        removeSwarmAgent={runner.removeSwarmAgent}
                        updateSwarmAgent={runner.updateSwarmAgent}

                        // Help Modal Wiring
                        setShowHelpModal={runner.setShowHelpModal}
                    />

                    {/* 2. PROMPT PREVIEW */}
                    {(!runner.battleResults && !runner.refineSteps && !runner.result && (!runner.swarmHistory || runner.swarmHistory.length === 0)) && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Current Prompt</label>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
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

                        onContinueSwarm={runner.continueSwarm}
                        onCompileSwarm={runner.compileSwarmCode}
                    />
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex-shrink-0 flex justify-end gap-3 safe-area-pb">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleRunClick}
                        disabled={
                            runner.loading ||
                            // Standard Mode Checks
                            (runner.viewMode === 'simple' && runner.provider === 'gemini' && !runner.geminiKey) ||
                            (runner.viewMode === 'simple' && runner.provider === 'openai' && !runner.openaiKey) ||
                            (runner.viewMode === 'simple' && runner.provider === 'groq' && !runner.groqKey) ||
                            (runner.viewMode === 'simple' && runner.provider === 'anthropic' && !runner.anthropicKey) ||
                            // Advanced Mode Checks
                            (runner.viewMode === 'advanced' && runner.provider === 'battle' && (!runner.geminiKey || !runner.openaiKey)) ||
                            // Smart Chain needs mostly everything, but let's at least enforce the main ones for now or rely on the hook to fail.
                            // Let's enforce Gemini + OpenAI as minimal set for the start of the chain.
                            (runner.viewMode === 'advanced' && runner.provider === 'smart_chain' && (!runner.geminiKey || !runner.openaiKey))
                        }
                        className={`flex-1 md:flex-none px-6 py-3 md:py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${runner.provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' :
                                (runner.provider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                                    (runner.provider === 'smart_chain' ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-90' :
                                        (runner.provider === 'swarm' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                                            (runner.provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                                (runner.provider === 'groq' ? 'bg-orange-600 hover:bg-orange-700' :
                                                    (runner.provider === 'anthropic' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'))))))
                            }`}
                    >
                        {runner.loading ? 'Running...' : (
                            runner.provider === 'battle' ? 'Start Versus' :
                                (runner.provider === 'refine' ? 'Start Loop' :
                                    (runner.provider === 'smart_chain' ? 'Start Chain' :
                                        (runner.provider === 'swarm' ? 'Start Collab' : 'Run Test'))
                                ))}
                    </button>
                </div>
            </div>

            {/* GitHub Modal */}
            <GitHubModal
                isOpen={runner.showGithub}
                onClose={() => runner.setShowGithub(false)}
                codeToPush={runner.codeToShip}
                onShip={runner.shipToGithub}
                initialToken={runner.githubToken}
            />

            {/* API Key Help Modal */}
            {runner.showHelpModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        {/* Placeholder for ApiKeyHelpModal if needed in this context, usually rendered in Controls or Panel */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestRunnerModal;