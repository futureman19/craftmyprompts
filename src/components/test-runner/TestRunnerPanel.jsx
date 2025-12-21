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

    // CRITICAL: State Sanitization & Crash Prevention
    // 1. Force lowercase to handle 'Hivemind' vs 'hivemind'
    // 2. Map known invalid/legacy UI labels to internal IDs
    let safeProvider = (runner.provider || 'gemini').toLowerCase();
    if (safeProvider === 'hivemind') safeProvider = 'swarm';
    if (safeProvider === 'arena') safeProvider = 'battle';
    if (safeProvider === 'chain') safeProvider = 'smart_chain';

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt);
    };

    const containerClasses = isFullScreen
        ? 'fixed inset-0 z-[100] bg-slate-950 w-screen h-screen flex flex-col p-6 animate-in zoom-in-95 duration-200'
        : 'flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-all duration-300';

    return (
        <div className={containerClasses}>

            {/* --- HEADER --- */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 px-3">
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
                    provider={safeProvider}

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
                    provider={safeProvider}
                    battleResults={runner.battleResults}
                    battleConfig={runner.battleConfig}
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
                        (runner.viewMode === 'simple' && safeProvider === 'gemini' && !runner.geminiKey) ||
                        (runner.viewMode === 'simple' && safeProvider === 'openai' && !runner.openaiKey)
                    }
                    className={`w-full py-3 text-white rounded-lg text-sm font-bold shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${safeProvider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' :
                        (safeProvider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                            (safeProvider === 'swarm' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                                (safeProvider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    (safeProvider === 'groq' ? 'bg-orange-600 hover:bg-orange-700' :
                                        (safeProvider === 'anthropic' ? 'bg-rose-600 hover:bg-rose-700' :
                                            (safeProvider === 'auto' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-indigo-600 hover:bg-indigo-700'))))))
                        }`}
                >
                    {runner.loading ? 'Running...' : (
                        safeProvider === 'battle' ? 'Start Versus' :
                            (safeProvider === 'refine' ? 'Start Loop' :
                                (safeProvider === 'swarm' ? 'Start Collab' :
                                    (safeProvider === 'auto' ? 'Auto-Run' : 'Run Test')))
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