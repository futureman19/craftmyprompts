import React, { useState, useEffect } from 'react';
import { X, Play, Key, Loader, Check, AlertTriangle, Terminal, Cpu, RefreshCw, Zap, Bot, Sparkles, Swords, GitCompare } from 'lucide-react';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey }) => {
  // --- STATE ---
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai' | 'battle' | 'refine'
  
  // Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  
  // Execution
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Single result (Gemini/OpenAI/Refine Final)
  const [battleResults, setBattleResults] = useState(null); // { gemini: '', openai: '' }
  const [refineSteps, setRefineSteps] = useState(null); // { draft: '', critique: '', final: '' }
  const [statusMessage, setStatusMessage] = useState(''); // "Generating draft...", "Critiquing..."
  const [error, setError] = useState(null);
  
  // Models
  // CTO FIX: Default to empty so we force an auto-select of the best available model
  const [selectedModel, setSelectedModel] = useState(''); 
  const [availableModels, setAvailableModels] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!isOpen) return;

    // Load Gemini Key
    if (defaultApiKey) {
        setGeminiKey(defaultApiKey);
    } else {
        const saved = localStorage.getItem('craft_my_prompt_gemini_key');
        if (saved) setGeminiKey(saved);
    }

    // Load OpenAI Key
    if (defaultOpenAIKey) {
        setOpenaiKey(defaultOpenAIKey);
    } else {
        const saved = localStorage.getItem('craft_my_prompt_openai_key');
        if (saved) setOpenaiKey(saved);
    }
  }, [isOpen, defaultApiKey, defaultOpenAIKey]);

  // --- AUTO-FETCH MODELS (CTO FIX) ---
  useEffect(() => {
      if (isOpen && geminiKey) {
          fetchModels(geminiKey);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, geminiKey]);

  // --- HELPERS ---
  const saveKey = (key, providerName) => {
      const storageKey = `craft_my_prompt_${providerName}_key`;
      const defaultKey = providerName === 'gemini' ? defaultApiKey : defaultOpenAIKey;
      
      if (key.trim() && key !== defaultKey) {
          localStorage.setItem(storageKey, key.trim());
      }
  };

  const clearKey = (providerName) => {
      const storageKey = `craft_my_prompt_${providerName}_key`;
      localStorage.removeItem(storageKey);
      if (providerName === 'gemini') setGeminiKey('');
      else setOpenaiKey('');
  };

  const fetchModels = async (keyToUse = geminiKey) => {
      if (!keyToUse) return;
      try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
          const data = await response.json();
          if (data.models) {
              const validModels = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
              setAvailableModels(validModels);
              
              // CTO FIX: Auto-Select Logic
              // If no model is selected, OR the current selection isn't in the list...
              const currentExists = validModels.find(m => m.name === selectedModel);
              if (!selectedModel || !currentExists) {
                  // Priority: Look for '2.0-flash' or '2.5', then '1.5-flash', then whatever is first
                  const bestModel = validModels.find(m => m.name.includes('2.0-flash')) 
                                 || validModels.find(m => m.name.includes('flash')) 
                                 || validModels[0];
                  
                  if (bestModel) setSelectedModel(bestModel.name);
              }
          }
      } catch (err) {
          console.error("Failed to fetch models", err);
      }
  };

  // --- API CALLS ---
  const callGemini = async (promptText, key, model) => {
      // Use the auto-selected model, or fallback to 1.5 if absolutely everything failed
      const targetModel = model || 'models/gemini-1.5-flash';
      const modelPath = targetModel.startsWith('models/') ? targetModel : `models/${targetModel}`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Gemini Error (${response.status})`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned.";
  };

  const callOpenAI = async (promptText, key) => {
      const response = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              apiKey: key,
              prompt: promptText,
              model: "gpt-4o"
          })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `OpenAI Error (${response.status})`);
      return data.choices?.[0]?.message?.content || "No text returned.";
  };

  // --- MAIN RUN HANDLER ---
  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBattleResults(null);
    setRefineSteps(null);
    setStatusMessage('');

    try {
        if (provider === 'refine') {
            // --- REFINE MODE (The Orchestrator Loop) ---
            if (!geminiKey || !openaiKey) throw new Error("Both keys required for Refine Mode.");
            saveKey(geminiKey, 'gemini');
            saveKey(openaiKey, 'openai');

            // Step 1: Draft (Gemini)
            setStatusMessage('Step 1/3: Gemini is drafting...');
            const draft = await callGemini(prompt, geminiKey, selectedModel);
            setRefineSteps({ draft, critique: null, final: null });

            // Step 2: Critique (OpenAI)
            setStatusMessage('Step 2/3: ChatGPT is critiquing...');
            const critiquePrompt = `Act as a Senior Editor. Critique the following text. List 3 specific, actionable improvements to make it better, clearer, or more impactful.\n\nTEXT TO CRITIQUE:\n${draft}`;
            const critique = await callOpenAI(critiquePrompt, openaiKey);
            setRefineSteps({ draft, critique, final: null });

            // Step 3: Polish (Gemini)
            setStatusMessage('Step 3/3: Gemini is polishing...');
            const polishPrompt = `You are an expert writer. Rewrite the original text below to address the editor's critique. Make it perfect.\n\nORIGINAL TEXT:\n${draft}\n\nEDITOR'S CRITIQUE:\n${critique}`;
            const final = await callGemini(polishPrompt, geminiKey, selectedModel);
            setRefineSteps({ draft, critique, final });
            setResult(final); // Show final in main box too

        } else if (provider === 'battle') {
            // --- BATTLE MODE ---
            if (!geminiKey || !openaiKey) throw new Error("Both API Keys are required.");
            saveKey(geminiKey, 'gemini');
            saveKey(openaiKey, 'openai');

            setStatusMessage('Fighting...');
            const [geminiRes, openaiRes] = await Promise.allSettled([
                callGemini(prompt, geminiKey, selectedModel),
                callOpenAI(prompt, openaiKey)
            ]);

            setBattleResults({
                gemini: geminiRes.status === 'fulfilled' ? geminiRes.value : `Error: ${geminiRes.reason.message}`,
                openai: openaiRes.status === 'fulfilled' ? openaiRes.value : `Error: ${openaiRes.reason.message}`
            });

        } else if (provider === 'gemini') {
            // --- GEMINI ONLY ---
            if (!geminiKey) throw new Error("Gemini Key missing.");
            saveKey(geminiKey, 'gemini');
            setStatusMessage('Gemini is thinking...');
            const text = await callGemini(prompt, geminiKey, selectedModel);
            setResult(text);

        } else if (provider === 'openai') {
            // --- OPENAI ONLY ---
            if (!openaiKey) throw new Error("OpenAI Key missing.");
            saveKey(openaiKey, 'openai');
            setStatusMessage('ChatGPT is thinking...');
            const text = await callOpenAI(prompt, openaiKey);
            setResult(text);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
        setStatusMessage('');
    }
  };

  if (!isOpen) return null;

  const isUsingGlobalGemini = defaultApiKey && geminiKey === defaultApiKey;
  const isUsingGlobalOpenAI = defaultOpenAIKey && openaiKey === defaultOpenAIKey;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-900 w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden transition-all ${provider === 'battle' || provider === 'refine' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Terminal size={18} className="text-indigo-500" /> Test Prompt
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* PROVIDER SWITCHER */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto hide-scrollbar">
                <button onClick={() => setProvider('gemini')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'gemini' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Sparkles size={16} /> Gemini
                </button>
                <button onClick={() => setProvider('openai')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Bot size={16} /> OpenAI
                </button>
                <button onClick={() => setProvider('battle')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Swords size={16} /> Battle
                </button>
                {/* Refine Mode Button */}
                <button onClick={() => setProvider('refine')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <GitCompare size={16} /> Refine Loop
                </button>
            </div>

            {/* API Key Input Section */}
            <div className="space-y-4">
                {/* Gemini Key Input */}
                {(provider === 'gemini' || provider === 'battle' || provider === 'refine') && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2"><Key size={14} /> Gemini Key</label>
                            {provider === 'gemini' && (
                                <button onClick={() => fetchModels()} disabled={!geminiKey} className="text-[10px] flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50">
                                    <RefreshCw size={10} /> Refresh Models
                                </button>
                            )}
                        </div>
                        {isUsingGlobalGemini ? (
                             <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400 text-sm font-medium">
                                <Zap size={16} fill="currentColor" /> <span>Connected via App Key</span>
                             </div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Paste Google API Key..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono" />
                                {geminiKey && <button onClick={() => clearKey('gemini')} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear</button>}
                            </div>
                        )}
                         {provider === 'gemini' && (
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm mt-2">
                                {availableModels.length > 0 ? (
                                    availableModels.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>)
                                ) : (
                                    <option value="">Fetching models...</option>
                                )}
                            </select>
                        )}
                    </div>
                )}

                {/* OpenAI Key Input */}
                {(provider === 'openai' || provider === 'battle' || provider === 'refine') && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2"><Key size={14} /> OpenAI Key</label>
                        {isUsingGlobalOpenAI ? (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                <Zap size={16} fill="currentColor" /> <span>Connected via App Key</span>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono" />
                                {openaiKey && <button onClick={() => clearKey('openai')} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Prompt Preview */}
            {(!battleResults && !refineSteps && !result) && (
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Prompt</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                        {prompt}
                    </div>
                </div>
            )}

            {/* SINGLE RESULT (Gemini, OpenAI, or Refine Final) */}
            {(result || error || (loading && provider !== 'battle' && provider !== 'refine')) && (
                <div className={`rounded-xl border p-4 ${error ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"><Loader size={16} className="animate-spin" /> {statusMessage || 'Generating...'}</div>
                    ) : error ? (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><strong className="block font-bold">Error:</strong> {error}
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2 text-indigo-600 dark:text-indigo-400">
                                <Check size={14} /> Final Result
                            </div>
                            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{result}</div>
                        </div>
                    )}
                </div>
            )}

            {/* BATTLE RESULTS */}
            {provider === 'battle' && (loading || battleResults) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-2"><Sparkles size={18} /> Gemini</div>
                        {loading ? <div className="text-sm italic text-indigo-400">Thinking...</div> : <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{battleResults?.gemini}</div>}
                    </div>
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2"><Bot size={18} /> GPT-4o</div>
                        {loading ? <div className="text-sm italic text-emerald-400">Thinking...</div> : <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{battleResults?.openai}</div>}
                    </div>
                </div>
            )}

            {/* REFINE LOOP RESULTS */}
            {provider === 'refine' && refineSteps && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                             <div className="text-[10px] font-bold uppercase text-indigo-500 mb-1">Step 1: Draft (Gemini)</div>
                             <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-6">{refineSteps.draft}</div>
                        </div>
                        {refineSteps.critique && (
                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <div className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Step 2: Critique (GPT-4)</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-6">{refineSteps.critique}</div>
                            </div>
                        )}
                    </div>
                    {/* Final result is shown in the main "Result Area" block above when complete */}
                    {loading && <div className="text-center text-sm font-bold text-amber-500 animate-pulse">{statusMessage}</div>}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">Cancel</button>
            <button 
                onClick={handleRun}
                disabled={loading || (provider !== 'gemini' && !openaiKey) || (provider !== 'openai' && !geminiKey)}
                className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' : (provider === 'refine' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : (provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'))}`}
            >
                {loading ? <Loader size={16} className="animate-spin" /> : (provider === 'battle' ? <Swords size={16} /> : (provider === 'refine' ? <GitCompare size={16} /> : <Play size={16} fill="currentColor" />))}
                {provider === 'battle' ? 'Start Battle' : (provider === 'refine' ? 'Start Loop' : 'Run Test')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TestRunnerModal;