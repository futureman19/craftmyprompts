import React, { useState, useEffect } from 'react';
import { X, Play, Key, Loader, Check, AlertTriangle, Terminal, Cpu, RefreshCw, Zap } from 'lucide-react';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Default fallback models if fetching fails
  const [availableModels, setAvailableModels] = useState([
      { displayName: 'Gemini 1.5 Flash', name: 'models/gemini-1.5-flash' },
      { displayName: 'Gemini 1.5 Pro', name: 'models/gemini-1.5-pro' },
  ]);
  const [selectedModel, setSelectedModel] = useState('models/gemini-1.5-flash'); 

  // --- CTO UPDATE: Smart Key Initialization ---
  useEffect(() => {
    if (defaultApiKey) {
        // If the app provided a shared key, use it!
        setApiKey(defaultApiKey);
    } else {
        // Otherwise, check for a user-saved key
        const savedKey = localStorage.getItem('craft_my_prompt_gemini_key');
        if (savedKey) setApiKey(savedKey);
    }
  }, [defaultApiKey, isOpen]);

  // Only save to local storage if it's the USER'S key, not the global one
  const saveKey = () => {
    if (apiKey.trim() && apiKey !== defaultApiKey) {
        localStorage.setItem('craft_my_prompt_gemini_key', apiKey.trim());
    }
  };

  const clearKey = () => {
      localStorage.removeItem('craft_my_prompt_gemini_key');
      setApiKey('');
      setResult(null);
  };

  const fetchModels = async () => {
      if (!apiKey) return;
      setLoading(true);
      setError(null);
      try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error?.message || "Failed to list models");
          }

          if (data.models) {
              const validModels = data.models.filter(m => 
                  m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
              );
              setAvailableModels(validModels);
              if (validModels.length > 0) {
                  // Keep selection if valid, otherwise pick first
                  const exists = validModels.find(m => m.name === selectedModel);
                  if (!exists) setSelectedModel(validModels[0].name);
              }
          }
      } catch (err) {
          setError(`Could not list models: ${err.message}`);
      } finally {
          setLoading(false);
      }
  };

  // Fetch models automatically if we have a key and haven't fetched yet
  useEffect(() => {
      if (isOpen && apiKey && availableModels.length <= 2) {
          fetchModels();
      }
  // eslint-disable-next-line
  }, [isOpen, apiKey]);


  const handleRun = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);
    saveKey(); 

    try {
        const modelPath = selectedModel.startsWith('models/') ? selectedModel : `models/${selectedModel}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `Failed to fetch response (${response.status})`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setResult(text || "No text returned.");

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUsingGlobalKey = defaultApiKey && apiKey === defaultApiKey;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
        
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
            
            {/* API Key & Model Section */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Key size={14} /> Gemini API Key
                    </label>
                    
                    {/* --- CTO UPDATE: Smart UI for Keys --- */}
                    {isUsingGlobalKey ? (
                         <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                            <Zap size={16} fill="currentColor" /> 
                            <span>Connected via App Key (Free Mode)</span>
                         </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste API Key..."
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                            />
                            {apiKey && (
                                <button onClick={clearKey} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Cpu size={14} /> Model
                        </label>
                        <button 
                            onClick={fetchModels} 
                            disabled={!apiKey || loading}
                            className="text-[10px] flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                        >
                            <RefreshCw size={10} className={loading ? "animate-spin" : ""} /> Refresh Models
                        </button>
                    </div>
                    <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    >
                        {availableModels.map(m => (
                            <option key={m.name} value={m.name}>
                                {m.displayName || m.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {!isUsingGlobalKey && (
                <p className="text-[10px] text-slate-400">
                    Key is stored locally. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Google AI Studio</a>.
                </p>
            )}

            {/* Prompt Preview (Read Only) */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Prompt</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                    {prompt}
                </div>
            </div>

            {/* Result Area */}
            {(result || error || loading) && (
                <div className={`rounded-xl border p-4 ${error ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800'}`}>
                    {loading ? (
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                            <Loader size={16} className="animate-spin" /> Generating response...
                        </div>
                    ) : error ? (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <strong className="block font-bold">Error</strong>
                                <span className="break-words">{error}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2">
                                <Check size={14} /> Result
                            </div>
                            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                                {result}
                            </div>
                        </div>
                    )}
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
                disabled={!apiKey || loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
                {loading ? <Loader size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                Run Test
            </button>
        </div>
      </div>
    </div>
  );
};

export default TestRunnerModal;