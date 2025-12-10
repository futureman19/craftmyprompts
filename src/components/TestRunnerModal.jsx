import React, { useState, useEffect } from 'react';
import { X, Play, Key, Loader, Check, AlertTriangle, Terminal, Cpu, RefreshCw, Zap, Bot, Sparkles, Swords } from 'lucide-react';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey }) => {
  // --- STATE ---
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai' | 'battle'
  
  // Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  
  // Execution
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Single result
  const [battleResults, setBattleResults] = useState(null); // { gemini: '', openai: '' }
  const [error, setError] = useState(null);
  
  // Models
  const [selectedModel, setSelectedModel] = useState('models/gemini-1.5-flash'); 
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
  // Automatically fetch valid models when a key is present to prevent "Model not found" errors
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

  // Helper to fetch models (Gemini only feature for now)
  // Accepts key as arg to use latest state or passed value
  const fetchModels = async (keyToUse = geminiKey) => {
      if (!keyToUse) return;
      try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
          const data = await response.json();
          if (data.models) {
              const validModels = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
              setAvailableModels(validModels);
              
              // CTO FIX: Auto-select a valid model if the current default is invalid
              if (validModels.length > 0) {
                  const currentExists = validModels.find(m => m.name === selectedModel);
                  if (!currentExists) {
                      // Prefer 1.5 Flash if available, otherwise take the first one
                      const bestModel = validModels.find(m => m.name.includes('flash')) || validModels[0];
                      setSelectedModel(bestModel.name);
                  }
              }
          }
      } catch (err) {
          console.error("Failed to fetch models", err);
      }
  };

  // --- API CALLS (Refactored for reuse) ---
  const callGemini = async (promptText, key, model) => {
      const modelPath = model.startsWith('models/') ? model : `models/${model}`;
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

    try {
        if (provider === 'battle') {
            // --- BATTLE MODE ---
            if (!geminiKey || !openaiKey) throw new Error("Both API Keys are required for Battle Mode.");
            saveKey(geminiKey, 'gemini');
            saveKey(openaiKey, 'openai');

            // Run both in parallel
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
            if (!geminiKey) throw new Error("Gemini API Key is missing.");
            saveKey(geminiKey, 'gemini');
            const text = await callGemini(prompt, geminiKey, selectedModel);
            setResult(text);

        } else if (provider === 'openai') {
            // --- OPENAI ONLY ---
            if (!openaiKey) throw new Error("OpenAI API Key is missing.");
            saveKey(openaiKey, 'openai');
            const text = await callOpenAI(prompt, openaiKey);
            setResult(text);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUsingGlobalGemini = defaultApiKey && geminiKey === defaultApiKey;
  const isUsingGlobalOpenAI = defaultOpenAIKey && openaiKey === defaultOpenAIKey;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-900 w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden transition-all ${provider === 'battle' && battleResults ? 'max-w-5xl' : 'max-w-2xl'}`}>
        
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
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
                <button onClick={() => setProvider('gemini')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'gemini' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Sparkles size={16} /> Gemini
                </button>
                <button onClick={() => setProvider('openai')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Bot size={16} /> OpenAI
                </button>
                <button onClick={() => setProvider('battle')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    <Swords size={16} /> Battle Mode
                </button>
            </div>

            {/* API Key Input Section */}
            <div className="space-y-4">
                {/* Gemini Key Input */}
                {(provider === 'gemini' || provider === 'battle') && (
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
                                <Zap size={16} fill="currentColor" /> <span>Connected via App Key (Free)</span>
                             </div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Paste Google API Key..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono" />
                                {geminiKey && <button onClick={() => clearKey('gemini')} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear</button>}
                            </div>
                        )}
                         {provider === 'gemini' && (
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm mt-2">
                                <option value="models/gemini-1.5-flash">Gemini 1.5 Flash</option>
                                {availableModels.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>)}
                            </select>
                        )}
                    </div>
                )}

                {/* OpenAI Key Input */}
                {(provider === 'openai' || provider === 'battle') && (
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

            {/* Prompt Preview (Hide if showing battle results to save space) */}
            {(!battleResults && !result) && (
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Prompt</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                        {prompt}
                    </div>
                </div>
            )}

            {/* SINGLE RESULT AREA */}
            {(result || error || (loading && provider !== 'battle')) && (
                <div className={`rounded-xl border p-4 ${error ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : (provider === 'openai' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800')}`}>
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"><Loader size={16} className="animate-spin" /> Generating response...</div>
                    ) : error ? (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><strong className="block font-bold">Error:</strong> {error}
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{result}</div>
                        </div>
                    )}
                </div>
            )}

            {/* BATTLE RESULTS AREA */}
            {provider === 'battle' && (loading || battleResults) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gemini Column */}
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-2">
                             <Sparkles size={18} /> Gemini 1.5
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-indigo-400 italic"><Loader size={14} className="animate-spin" /> Thinking...</div>
                        ) : (
                            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{battleResults?.gemini}</div>
                        )}
                    </div>
                    {/* OpenAI Column */}
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 flex flex-col h-full">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                             <Bot size={18} /> GPT-4o
                        </div>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-400 italic"><Loader size={14} className="animate-spin" /> Thinking...</div>
                        ) : (
                            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{battleResults?.openai}</div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleRun}
                disabled={loading || (provider === 'gemini' && !geminiKey) || (provider === 'openai' && !openaiKey) || (provider === 'battle' && (!geminiKey || !openaiKey))}
                className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${provider === 'battle' ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-90' : (provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700')}`}
            >
                {loading ? <Loader size={16} className="animate-spin" /> : (provider === 'battle' ? <Swords size={16} /> : <Play size={16} fill="currentColor" />)}
                {provider === 'battle' ? 'Start Battle' : 'Run Test'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TestRunnerModal;