import React from 'react';
import { useBuilderView } from '../hooks/useBuilderView.js';
import BuilderHeader from '../components/builder/BuilderHeader.jsx';
import BuilderInputPanel from '../components/builder/BuilderInputPanel.jsx';
import BuilderPreviewPanel from '../components/builder/BuilderPreviewPanel.jsx';
import TestRunnerModal from '../components/TestRunnerModal.jsx';
import WizardMode from '../components/WizardMode.jsx'; 

const BuilderView = ({ user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest }) => {
  // 1. Initialize the "Brain"
  // This hook handles all state, Firebase logic, and event handlers
  const builder = useBuilderView(user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest);

  // 2. Render the View
  return (
      <div className="flex flex-col md:flex-row h-full w-full relative">
        
        {/* --- LEFT PANEL: BUILDER --- */}
        {/* Visible on Mobile (if tab is 'edit') and Desktop */}
        <div className={`flex-1 min-w-0 flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors ${builder.mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            
            <BuilderHeader 
                state={builder.state}
                mobileTab={builder.mobileTab}
                searchTerm={builder.searchTerm}
                user={user}
                customPresets={builder.customPresets}
                currentData={builder.currentData}
                dispatch={builder.dispatch}
                setMobileTab={builder.setMobileTab}
                setSearchTerm={builder.setSearchTerm}
                setShowWizard={builder.setShowWizard}
                applyPreset={builder.applyPreset}
                showToast={showToast}
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
        {/* Visible on Mobile (if tab is 'preview') and Desktop */}
        <BuilderPreviewPanel 
            state={builder.state}
            generatedPrompt={builder.generatedPrompt}
            mobileTab={builder.mobileTab}
            copied={builder.copied}
            copiedJson={builder.copiedJson}
            saveVisibility={builder.saveVisibility}
            isSaving={builder.isSaving}
            // CTO UPDATE: Passing Global Keys down for the embedded TestRunner
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
        {/* Kept for mobile fallback or specific triggers if needed */}
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