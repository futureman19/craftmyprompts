import React, { useState } from 'react';
import { Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { useTestRunner } from '../../hooks/useTestRunner.js';
import TestRunnerControls from './TestRunnerControls.jsx';
import TestRunnerResults from './TestRunnerResults.jsx';
import GitHubModal from '../GitHubModal.jsx';
import ApiKeyHelpModal from './ApiKeyHelpModal.jsx';

const TestRunnerPanel = ({ prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet, isSocialMode }) => {
    // 0. UI State
    const [isFullScreen, setIsFullScreen] = useState(false);

    // 1. Initialize the "Brain"
    const runner = useTestRunner(defaultApiKey, defaultOpenAIKey);

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt);
    };

    const containerClasses = isFullScreen
        ? "fixed inset-0 z-[9999] bg-white dark:bg-slate-900 w-screen h-screen flex flex-col"
        : "flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700";

    return (
        <div className={containerClasses}>

            {/* --- HEADER --- */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-500" /> Test your prompt
                    </h3>

                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen (Zen Mode)"}
                    >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
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

                    // New Dynamic Agent Handlers
                    addSwarmAgent={runner.addSwarmAgent}
                    removeSwarmAgent={runner.removeSwarmAgent}
                    updateSwarmAgent={runner.updateSwarmAgent}

                    // Help Modal Wiring
                    setShowHelpModal={runner.setShowHelpModal}

                    // CTO UPDATE: Passing the Router Reasoning to UI
                    routerReasoning={runner.routerReasoning}

                    // Key Management - Audited and Verified
                    keys={{
                        gemini: runner.geminiKey,
                        openai: runner.openaiKey,
                        groq: runner.groqKey,
                        anthropic: runner.anthropicKey
                    }}
                    setters={{
                        gemini: runner.setGeminiKey,
                        openai: runner.setOpenaiKey,
                        groq: runner.setGroqKey,
                        anthropic: runner.setAnthropicKey
                    }}
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

                    // Social Mode Flag
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
                    className={`w-full py-3 text-white rounded-lg text-sm font-bold shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${runner.provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' :
                        (runner.provider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                            (runner.provider === 'swarm' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                                (runner.provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    (runner.provider === 'groq' ? 'bg-orange-600 hover:bg-orange-700' :
                                        (runner.provider === 'anthropic' ? 'bg-rose-600 hover:bg-rose-700' :
                                            (runner.provider === 'auto' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-indigo-600 hover:bg-indigo-700'))))))
                        }`}
                >
                    {runner.loading ? 'Running...' : (
                        runner.provider === 'battle' ? 'Start Versus' :
                            (runner.provider === 'refine' ? 'Start Loop' :
                                (runner.provider === 'swarm' ? 'Start Collab' :
                                    (runner.provider === 'auto' ? 'Auto-Run' : 'Run Test')))
                    )}
                </button>
            </div>

            {/* GitHub Modal */}
            <GitHubModal
                isOpen={runner.showGithub}
                onClose={() => runner.setShowGithub(false)}
                codeToPush={runner.codeToShip}
                onShip={runner.shipToGithub}
                initialToken={runner.githubToken}
            />

            {/* Render the Help Modal */}
            {/* Render the Help Modal - FIXED SIGNATURE */}
            <ApiKeyHelpModal
                isOpen={runner.showHelpModal}
                onClose={() => runner.setShowHelpModal(false)}
                onSave={(newKeys) => {
                    if (newKeys.openai) runner.setOpenaiKey(newKeys.openai);
                    if (newKeys.anthropic) runner.setAnthropicKey(newKeys.anthropic);
                    if (newKeys.gemini) runner.setGeminiKey(newKeys.gemini);
                }}
            />
        </div>
    );
};

export default TestRunnerPanel;