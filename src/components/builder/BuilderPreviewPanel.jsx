import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Zap, RefreshCw, Check, Copy as CopyIcon, Braces,
    Lock, Globe, Save, Bookmark, ArrowLeft, BookmarkPlus, MessageSquare,
    Layers, FileCode, Loader, Users, Sparkles
} from 'lucide-react';
import TestRunnerPanel from '../test-runner/TestRunnerPanel.jsx';
import ProjectBlueprint from '../agent/ProjectBlueprint.jsx';
import { useTestRunner } from '../../hooks/useTestRunner.js';

const BuilderPreviewPanel = ({
    // State
    state, generatedPrompt, mobileTab, copied, copiedJson,
    saveVisibility, isSaving, globalApiKey, globalOpenAIKey,
    // Actions
    dispatch, setMobileTab, setSaveVisibility, handleCopy,
    handleCopyJSON, handleUnifiedSave, handleSaveAsPreset, handleSaveSnippet
}) => {
    const navigate = useNavigate();
    const [showBlueprint, setShowBlueprint] = useState(false);
    const [blueprintStructure, setBlueprintStructure] = useState([]);
    const [blueprintError, setBlueprintError] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showOptimizeMenu, setShowOptimizeMenu] = useState(false);

    // Initialize a dedicated "Architect" runner
    const architect = useTestRunner(globalApiKey, globalOpenAIKey);

    // Auto-detect the correct Hivemind Squad based on current mode
    const activeCategory = useMemo(() => {
        if (state.mode === 'text' && state.textSubMode === 'coding') return 'code';
        if (state.mode === 'text' && state.textSubMode === 'data') return 'data';
        return 'text';
    }, [state.mode, state.textSubMode]);

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

    // --- BLUEPRINT HANDLER ---
    const handleBlueprintToggle = () => {
        const isOpening = !showBlueprint;
        setShowBlueprint(isOpening);

        // If opening and no structure exists, trigger AI generation
        if (isOpening && blueprintStructure.length === 0 && generatedPrompt) {
            const architectPrompt = `
                Analyze this request: "${generatedPrompt}"
                Generate a RECOMMENDED FILE STRUCTURE (File Tree) for this project.
                Return ONLY a valid JSON object with this exact format:
                {
                  "structure": [
                    { "path": "src/App.jsx", "type": "file" },
                    { "path": "src/components", "type": "directory" }
                  ]
                }
                DO NOT return markdown code fences. Return RAW JSON only.
            `;
            // Call the runner specifically for the Architect agent logic
            architect.runTest(architectPrompt, 'code');
        }
    };

    // Watch for Architect Results & Parse JSON
    useEffect(() => {
        if (architect.result && !architect.loading) {
            setBlueprintError(null);
            try {
                // 1. Attempt to find the first valid JSON object start/end
                // This regex looks for the outer braces { ... } of the JSON response
                const jsonMatch = architect.result.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const cleanJson = jsonMatch[0];
                    const parsed = JSON.parse(cleanJson);

                    if (parsed.structure && Array.isArray(parsed.structure)) {
                        setBlueprintStructure(parsed.structure);
                    } else {
                        throw new Error("Missing 'structure' array in JSON response.");
                    }
                } else {
                    throw new Error("No valid JSON found in Architect response.");
                }
            } catch (e) {
                console.error("Blueprint Parse Error:", e);
                setBlueprintError(e.message);
            }
        }
    }, [architect.result, architect.loading]);

    const handleHivemindBlueprint = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.structure) {
                setBlueprintStructure(parsed.structure);
                setShowBlueprint(true); // AUTO-OPEN VISUALIZER
            }
        } catch (e) {
            console.error("Auto-Blueprint Failed:", e);
        }
    };

    // --- OPTIMIZE HANDLER ---
    const handleOptimize = async (provider) => {
        setIsOptimizing(true);
        setShowOptimizeMenu(false);
        try {
            // Use the Architect runner to call the Translator
            const result = await architect.runSingleAgent(
                'translator',
                `Task: Optimize this prompt for ${provider}.\nOriginal Prompt: "${generatedPrompt}"`,
                [],
                { targetProvider: provider }
            );

            // If we get a result, check if it's JSON as expected or just text
            // The Translator is instructed to return JSON, but runSingleAgent returns the raw message object
            // The message text (content) should be the JSON.
            if (result && result.text) {
                try {
                    // Try to parse the JSON to get the optimized prompt
                    // The agent prompt guidelines say: { "optimized_prompt": "..." }
                    // But LLMs might wrap it in markdown block.
                    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.optimized_prompt) {
                            // Update the prompt via the dispatch action matching the current structure
                            // NOTE: generatingPrompt is usually derived from state. 
                            // To update it, we might need to dispatch an action to update the 'generatedPrompt' 
                            // or update the source inputs. 
                            // Since 'generatedPrompt' is a prop here, we can't mutate it directly.
                            // However, the builder usually updates via dispatch. 
                            // We need a 'SET_PROMPT' action or similar. 
                            // Current Builder logic suggests 'generatedPrompt' is an output.
                            // If we want to replace it, maybe we just copy it to clipboard or show it?
                            // Let's assume we want to update the PREVIEW.
                            // The prompt is likely read-only in this view unless we have a setter.
                            // Checking props... dispatch is available.
                            // If state.mode is 'text', maybe we can define a custom setter?
                            // For now, let's just log it or maybe assume we can't easily overwrite the source inputs 
                            // without complex reverse-engineering. 
                            // So we will trigger a "paste" or just show it in the results for now?
                            // BETTER: Let's assume there is a 'SET_GENERATED_PROMPT_OVERRIDE' or just Copy it.
                            // Actually, I'll update the 'state' by dispatching a special action if it existed.
                            // Given constraints, I'll Copy it to clipboard and show a toast/alert.
                            await navigator.clipboard.writeText(parsed.optimized_prompt);
                            alert(`Optimized Prompt for ${provider} copied to clipboard!`);
                        }
                    } else {
                        // Fallback: just text
                        alert("Optimization complete (Raw): Check console or clipboard.");
                        console.log("Optimized:", result.text);
                    }
                } catch (e) {
                    console.error("JSON Parse Error on Optimization:", e);
                }
            }
        } catch (err) {
            console.error("Optimization Failed:", err);
        } finally {
            setIsOptimizing(false);
        }
    };

    // Calculate if we are in Social Mode
    const isSocialMode = state.mode === 'text' && state.textSubMode === 'social';

    return (
        <div className={`bg-slate-900 text-slate-100 flex-col h-full border-l border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex w-full'} md:w-[600px]`}>

            {/* --- TOP SECTION: PROMPT PREVIEW --- */}
            <div className="flex flex-col h-2/5 border-b-4 border-slate-950">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMobileTab('edit')} className="md:hidden text-slate-400 hover:text-white"><ArrowLeft size={20} /></button>
                        <h2 className="font-bold text-sm flex items-center gap-2">
                            <FileText size={16} className={state.mode === 'text' ? 'text-indigo-400' : 'text-pink-400'} />
                            Preview
                        </h2>

                        {/* BLUEPRINT TOGGLE (Visible only in Coding Mode) */}
                        {state.textSubMode === 'coding' && (
                            <div className="flex bg-slate-800 p-0.5 rounded-lg ml-4">
                                <button
                                    onClick={() => handleBlueprintToggle()}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!showBlueprint ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Prompt
                                </button>
                                <button
                                    onClick={() => handleBlueprintToggle()}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${showBlueprint ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {architect.loading && showBlueprint ? <Loader size={10} className="animate-spin" /> : <Layers size={10} />} Blueprint
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveAsPreset}
                            className="p-1.5 hover:bg-slate-800 rounded text-amber-500 hover:text-amber-400 transition-colors"
                            title="Save current setup as Preset"
                        >
                            <BookmarkPlus size={14} />
                        </button>

                        <div className="w-px h-4 bg-slate-800 my-auto mx-1"></div>

                        {/* OPTIMIZE DROPDOWN */}
                        <div className="relative">
                            <button
                                onClick={() => setShowOptimizeMenu(!showOptimizeMenu)}
                                className={`p-1.5 hover:bg-slate-800 rounded transition-colors ${isOptimizing ? 'text-yellow-400 animate-pulse' : 'text-slate-400 hover:text-yellow-400'}`}
                                title="Optimize Prompt with Polyglot Agent"
                                disabled={isOptimizing}
                            >
                                {isOptimizing ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>

                            {/* Dropdown Menu */}
                            {showOptimizeMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col p-1 animate-in fade-in zoom-in-95">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Optimize For:</div>
                                    <button onClick={() => handleOptimize('openai')} className="text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> OpenAI (GPT-4)
                                    </button>
                                    <button onClick={() => handleOptimize('anthropic')} className="text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> Anthropic (Claude)
                                    </button>
                                    <button onClick={() => handleOptimize('google')} className="text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-700 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Google (Gemini)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-800 my-auto mx-1"></div>

                        <button
                            onClick={() => navigate('/agent', { state: { prompt: generatedPrompt } })}
                            className="p-1.5 hover:bg-slate-800 rounded text-fuchsia-500 hover:text-fuchsia-400 transition-colors"
                            title="Ask Agent"
                        >
                            <MessageSquare size={14} />
                        </button>



                        {state.mode === 'art' && (
                            <button onClick={() => dispatch({ type: 'MAGIC_EXPAND' })} className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded hover:opacity-90 transition-opacity text-white" title="Magic Expand"><Zap size={14} /></button>
                        )}
                        <button onClick={() => dispatch({ type: 'RESET' })} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors" title="Reset"><RefreshCw size={14} /></button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-slate-900 relative scrollbar-thin scrollbar-thumb-slate-700">
                    {/* BLUEPRINT VIEW */}
                    {showBlueprint ? (
                        <div className="h-full flex flex-col animate-in fade-in pb-20">
                            {architect.loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                                    <Loader size={32} className="animate-spin text-cyan-500" />
                                    <p className="text-xs font-mono">Architecting Project Structure...</p>
                                </div>
                            ) : blueprintError ? (
                                <div className="p-6 text-center">
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs mb-4">
                                        <strong>Architecture Error:</strong> {blueprintError}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">Raw Output:</p>
                                    <pre className="text-[10px] text-left bg-black p-2 rounded text-slate-300 overflow-auto max-h-64">
                                        {architect.result || "No response received."}
                                    </pre>
                                    <button onClick={() => handleBlueprintToggle()} className="mt-4 text-cyan-500 text-xs hover:underline">Try Again</button>
                                </div>
                            ) : blueprintStructure.length > 0 ? (
                                <>
                                    <ProjectBlueprint
                                        structure={blueprintStructure}
                                        onApprove={() => console.log("Approved for Build")}
                                        onRefine={() => architect.runTest(generatedPrompt + " Refine structure", 'code')}
                                    />
                                    <p className="text-center text-[10px] text-slate-500 mt-4 font-mono">
                                        // This manifest guides the Hivemind's generation process.
                                    </p>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <Layers size={32} className="opacity-20 mb-2" />
                                    <p className="text-xs">Ready to Architect.</p>
                                    <button onClick={() => handleBlueprintToggle()} className="mt-2 text-cyan-500 text-xs hover:underline">Generate Blueprint</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap min-h-full font-mono text-sm leading-relaxed text-slate-300">
                            {renderHighlightedPrompt(generatedPrompt)}
                        </div>
                    )}
                </div>

                {/* Quick Actions Bar */}
                <div className="p-2 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                    <button onClick={handleCopy} disabled={!generatedPrompt} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} disabled:opacity-50`}>
                        {copied ? <Check size={14} /> : <CopyIcon size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>

                    {/* VISIBILITY TOGGLE */}
                    <button
                        onClick={() => setSaveVisibility(saveVisibility === 'public' ? 'private' : 'public')}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${saveVisibility === 'public'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}
                        title={saveVisibility === 'public' ? "Public: Visible in Community Feed" : "Private: Only visible to you"}
                    >
                        {saveVisibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                        <span>{saveVisibility === 'public' ? 'Public' : 'Private'}</span>
                    </button>

                    <button onClick={handleUnifiedSave} disabled={!generatedPrompt || isSaving} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* --- BOTTOM SECTION: TEST RUNNER --- */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                <TestRunnerPanel
                    prompt={generatedPrompt}
                    defaultApiKey={globalApiKey}
                    defaultOpenAIKey={globalOpenAIKey}
                    onSaveSnippet={handleSaveSnippet}
                    isSocialMode={isSocialMode}
                    activeCategory={activeCategory}
                    onBlueprintDetected={handleHivemindBlueprint}
                />
            </div>
        </div >
    );
};

export default BuilderPreviewPanel;