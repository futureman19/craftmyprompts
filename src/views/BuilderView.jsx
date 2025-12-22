import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBuilderView } from '../hooks/useBuilderView.js';
import BuilderHeader from '../components/builder/BuilderHeader.jsx';
import BuilderInputPanel from '../components/builder/BuilderInputPanel.jsx';
import BuilderPreviewPanel from '../components/builder/BuilderPreviewPanel.jsx';
import TestRunnerModal from '../components/TestRunnerModal.jsx';
import WizardMode from '../components/WizardMode.jsx';

const BuilderView = ({ user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest }) => {
    // 1. Initialize the "Builder Logic" (Prompt Engine)
    const builder = useBuilderView(user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest);
    const location = useLocation();

    // --- REFINEMENT LOOP HANDLER ---
    useEffect(() => {
        // Check if we returned from Hivemind (or elsewhere) with a prompt to refine
        if (location.state?.prompt) {
            // Pre-populate the Custom Topic / Input field
            builder.dispatch({ type: 'UPDATE_FIELD', field: 'customTopic', value: location.state.prompt });

            // Switch Category/Mode if requested
            if (location.state?.category) {
                builder.dispatch({ type: 'SET_MODE', payload: location.state.category });
            } else {
                // If no category specififed, maybe default to 'text' or keep current?
                // Best to keep current or default to text if unset.
            }

            showToast("Prompt loaded for refinement!");

            // Clear state to prevent overwriting on future refreshes
            window.history.replaceState({}, document.title);
        }
    }, [location, builder.dispatch, showToast]);

    return (
        <div className="flex flex-col md:flex-row h-full w-full relative">

            {/* --- LEFT PANEL: BUILDER --- */}
            <div className={`flex-1 min-w-0 flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors ${builder.mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>

                <BuilderHeader
                    state={builder.state}
                    mobileTab={builder.mobileTab}
                    searchTerm={builder.searchTerm}
                    user={user}
                    customPresets={builder.customPresets}
                    currentData={builder.currentData}
                    isSimpleMode={builder.isSimpleMode}

                    // Trend & Knowledge Data
                    showTrendWidget={builder.showTrendWidget}
                    setShowTrendWidget={builder.setShowTrendWidget}
                    customKnowledge={builder.customKnowledge}

                    dispatch={builder.dispatch}
                    setMobileTab={builder.setMobileTab}
                    setSearchTerm={builder.setSearchTerm}
                    setShowWizard={builder.setShowWizard}
                    applyPreset={builder.applyPreset}
                    applyKnowledge={builder.applyKnowledge}
                    showToast={showToast}
                    handleSaveAsPreset={builder.handleSaveAsPreset}
                    setIsSimpleMode={builder.setIsSimpleMode}
                />

                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                    <BuilderInputPanel
                        state={builder.state}
                        detectedVars={builder.detectedVars}
                        expandedCategories={builder.expandedCategories}
                        expandedSubcats={builder.expandedSubcats}
                        filteredData={builder.filteredData}
                        contextUrl={builder.contextUrl}
                        isFetchingContext={builder.isFetchingContext}
                        isSimpleMode={builder.isSimpleMode}

                        // Trend State
                        showTrendWidget={builder.showTrendWidget}
                        setShowTrendWidget={builder.setShowTrendWidget}

                        dispatch={builder.dispatch}
                        setContextUrl={builder.setContextUrl}
                        handleFetchContext={builder.handleFetchContext}
                        toggleCategory={builder.toggleCategory}
                        toggleSelection={builder.toggleSelection}
                        toggleSubcatExpansion={builder.toggleSubcatExpansion}
                    />
                </div>
            </div>

            {/* --- RIGHT PANEL: PREVIEW & TEST RUNNER --- */}
            <BuilderPreviewPanel
                state={builder.state}
                generatedPrompt={builder.generatedPrompt}
                mobileTab={builder.mobileTab}
                copied={builder.copied}
                copiedJson={builder.copiedJson}
                saveVisibility={builder.saveVisibility}
                isSaving={builder.isSaving}
                globalApiKey={builder.globalApiKey}
                globalOpenAIKey={builder.globalOpenAIKey}

                dispatch={builder.dispatch}
                setMobileTab={builder.setMobileTab}
                setSaveVisibility={builder.setSaveVisibility}
                handleCopy={builder.handleCopy}
                handleCopyJSON={builder.handleCopyJSON}
                handleUnifiedSave={builder.handleUnifiedSave}
                handleSaveAsPreset={builder.handleSaveAsPreset}
                handleSaveSnippet={builder.handleSaveSnippet}
                handleTestClick={builder.handleTestClick}
            />

            {/* --- MODALS --- */}
            <TestRunnerModal
                isOpen={builder.showTestModal}
                onClose={() => builder.setShowTestModal(false)}
                prompt={builder.generatedPrompt}
                defaultApiKey={builder.globalApiKey}
                defaultOpenAIKey={builder.globalOpenAIKey}
                onSaveSnippet={builder.handleSaveSnippet}
            />

            <WizardMode
                isOpen={builder.showWizard}
                onClose={() => builder.setShowWizard(false)}
                data={builder.currentData}
                selections={builder.state.selections}
                onToggle={builder.toggleSelection}
                mode={builder.state.mode}
            />
        </div>
    );
};

export default BuilderView;