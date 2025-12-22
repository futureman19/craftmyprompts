import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Maximize2, Minimize2 } from 'lucide-react';
import { useTestRunner } from '../../hooks/useTestRunner.js';
import TestRunnerControls from './TestRunnerControls.jsx';
import TestRunnerResults from './TestRunnerResults.jsx';
import GitHubModal from '../GitHubModal.jsx';
import ApiKeyHelpModal from './ApiKeyHelpModal.jsx';

const TestRunnerPanel = ({ prompt, defaultApiKey, defaultOpenAIKey, onSaveSnippet, isSocialMode, activeCategory = 'code', onBlueprintDetected, autoRun = false }) => {
    // 0. UI State
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Auto-Run Ref to prevent double-firing
    const hasAutoRun = useRef(false);

    // 1. Initialize the "Brain"
    const navigate = useNavigate();

    // --- REWRITE: LOCAL API KEY STATE MANAGEMENT (Source of Truth) ---
    // We lazy load from localStorage to ensure keys persist across refreshes
    const [localOpenAIKey, setLocalOpenAIKey] = useState(() => localStorage.getItem('openai_key') || defaultOpenAIKey || '');
    const [localGeminiKey, setLocalGeminiKey] = useState(() => localStorage.getItem('gemini_key') || defaultApiKey || ''); // defaultApiKey usually gemini
    const [localAnthropicKey, setLocalAnthropicKey] = useState(() => localStorage.getItem('anthropic_key') || '');
    const [localGroqKey, setLocalGroqKey] = useState(() => localStorage.getItem('groq_key') || '');

    // Persist changes
    useEffect(() => { if (localOpenAIKey) localStorage.setItem('openai_key', localOpenAIKey); }, [localOpenAIKey]);
    useEffect(() => { if (localGeminiKey) localStorage.setItem('gemini_key', localGeminiKey); }, [localGeminiKey]);
    useEffect(() => { if (localAnthropicKey) localStorage.setItem('anthropic_key', localAnthropicKey); }, [localAnthropicKey]);
    useEffect(() => { if (localGroqKey) localStorage.setItem('groq_key', localGroqKey); }, [localGroqKey]);

    // Initialize Runner with the PERSISTED keys
    const runner = useTestRunner(localGeminiKey, localOpenAIKey);

    // Sync Runner state if local keys change (Optional, but ensures runner has latest)
    useEffect(() => {
        if (localGeminiKey !== runner.geminiKey) runner.setGeminiKey(localGeminiKey);
        if (localOpenAIKey !== runner.openaiKey) runner.setOpenaiKey(localOpenAIKey);
        if (localAnthropicKey !== runner.anthropicKey) runner.setAnthropicKey(localAnthropicKey);
        if (localGroqKey !== runner.groqKey) runner.setGroqKey(localGroqKey);
    }, [localGeminiKey, localOpenAIKey, localAnthropicKey, localGroqKey]);

    // CRITICAL: State Sanitization & Crash Prevention
    // 1. Force lowercase to handle 'Hivemind' vs 'hivemind'
    // 2. Map known invalid/legacy UI labels to internal IDs
    let safeProvider = (runner.provider || 'gemini').toLowerCase();
    if (safeProvider === 'hivemind') safeProvider = 'swarm';
    if (safeProvider === 'arena') safeProvider = 'battle';
    if (safeProvider === 'chain') safeProvider = 'smart_chain';

    // 2. Main Run Handler
    const handleRunClick = () => {
        runner.runTest(prompt, activeCategory);
    };

    // 3. Tab Handler (Standard Logic Only)
    const handleTabChange = (val) => {
        // Standard Tab Switch Logic
        runner.setProvider(val);
        // Only maximize if appropriate (not simple gemini/standard)
        if (val !== 'gemini' && val !== 'standard') {
            setIsFullScreen(false);
        }
    };

    // 4. Explicit Hivemind Launcher (Decoupled & Safe)
    const launchHivemind = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("🚀 Launching Hivemind...", { prompt });

        // Force Navigation (Clean State)
        navigate('/hivemind', {
            state: {
                prompt: prompt,
                timestamp: Date.now()
            }
        });
    };

    // --- AUTO-RUN LOGIC ---
    useEffect(() => {
        if (autoRun && prompt && !runner.loading && !runner.result && !hasAutoRun.current) {
            console.log("Auto-Running Test via Prop...");
            hasAutoRun.current = true;
            handleRunClick();
        }
    }, [autoRun, prompt, runner.loading, runner.result]);

    const containerClasses = isFullScreen
        ? 'fixed top-0 right-0 bottom-0 left-0 md:left-20 z-[100] bg-slate-950 flex flex-col p-6 animate-in zoom-in-95 duration-200 shadow-2xl'
        : 'flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-all duration-300';

    return (
        <div className={containerClasses}>

            {/* --- HEADER --- */}
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 px-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-500" /> Test your prompt
                    </h3>

                    {/* Minimize Button (Only visible when maximized) */}
                    {isFullScreen && (
                        <button
                            onClick={() => setIsFullScreen(false)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-xs font-bold text-slate-500 transition-colors"
                        >
                            <Minimize2 size={14} /> Minimize
                        </button>
                    )}
                </div>
            </div>

            {/* --- CONTENT SCROLL AREA --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* 1. CONTROLS DASHBOARD */}
                <TestRunnerControls
                    viewMode={runner.viewMode}
                    provider={safeProvider}

                    // Keys & Auth
                    geminiKey={localGeminiKey}
                    openaiKey={localOpenAIKey}
                    groqKey={localGroqKey}
                    anthropicKey={localAnthropicKey}
                    isLoggedIn={runner.isLoggedIn}

                    // Configs
                    refineConfig={runner.refineConfig}
                    swarmConfig={runner.swarmConfig}
                    battleConfig={runner.battleConfig}
                    selectedModel={runner.selectedModel}
                    availableModels={runner.availableModels}
                    isUsingGlobalGemini={!!defaultApiKey && localGeminiKey === defaultApiKey}
                    isUsingGlobalOpenAI={!!defaultOpenAIKey && localOpenAIKey === defaultOpenAIKey}

                    // Handlers
                    onViewChange={runner.handleViewChange}
                    onProviderChange={handleTabChange}
                    onLaunchHivemind={launchHivemind}
                    onGeminiKeyChange={setLocalGeminiKey}
                    onOpenaiKeyChange={setLocalOpenAIKey}
                    onGroqKeyChange={setLocalGroqKey}
                    onAnthropicKeyChange={setLocalAnthropicKey}
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
                    swarmCategory={runner.swarmCategory}
                    onSwarmCategoryChange={runner.setSwarmCategory}

                    // Help Modal Wiring
                    setShowHelpModal={runner.setShowHelpModal}

                    // CTO UPDATE: Passing the Router Reasoning to UI
                    routerReasoning={runner.routerReasoning}

                    // Key Management - Audited and Verified
                    keys={{
                        gemini: localGeminiKey,
                        openai: localOpenAIKey,
                        groq: localGroqKey,
                        anthropic: localAnthropicKey
                    }}
                    setters={{
                        gemini: setLocalGeminiKey,
                        openai: setLocalOpenAIKey,
                        groq: setLocalGroqKey,
                        anthropic: setLocalAnthropicKey
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

                    // Blueprint Handler
                    onBlueprintDetected={onBlueprintDetected}

                    // Narrative Handlers
                    onLoopBack={runner.loopBack}
                    onSynthesize={runner.synthesizeProject}
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
                    if (newKeys.openai) setLocalOpenAIKey(newKeys.openai);
                    if (newKeys.anthropic) setLocalAnthropicKey(newKeys.anthropic);
                    if (newKeys.gemini) setLocalGeminiKey(newKeys.gemini);
                    if (newKeys.groq) setLocalGroqKey(newKeys.groq);
                }}
            />
        </div>
    );
};

export default TestRunnerPanel;