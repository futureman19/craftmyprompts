import React, { useState, useEffect } from 'react';
import { X, Play, Key, Loader, Check, AlertTriangle, Terminal, Cpu, RefreshCw, Zap, Bot, Sparkles } from 'lucide-react';

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey }) => {
  // --- STATE ---
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai'
  
  // Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  
  // Execution
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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

  // --- API LOGIC ---
  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
        let textResult = '';

        if (provider === 'gemini') {
            if (!geminiKey) throw new Error("Gemini API Key is missing.");
            saveKey(geminiKey, 'gemini');

            const modelPath = selectedModel.startsWith('models/') ? selectedModel : `models/${selectedModel}`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || `Gemini Error (${response.status})`);
            textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

        } else if (provider === 'openai') {
            if (!openaiKey) throw new Error("OpenAI API Key is missing.");
            saveKey(openaiKey, 'openai');

            // --- CTO UPDATE: Use Vercel Proxy to avoid CORS ---
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: openaiKey,
                    prompt: prompt,
                    model: "gpt-4o"
                })
            });

            const data = await response.json();
            
            // Check for proxy errors
            if (!response.ok) throw new Error(data.error || `OpenAI Error (${response.status})`);
            
            // OpenAI structure: choices[0].message.content
            textResult = data.choices?.[0]?.message?.content;
        }

        setResult(textResult || "No text returned.");

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determine if using global keys
  const isUsingGlobalGemini = defaultApiKey && geminiKey === defaultApiKey;
  const isUsingGlobalOpenAI = defaultOpenAIKey && openaiKey === defaultOpenAIKey;

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
            
            {/* PROVIDER SWITCHER */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button 
                    onClick={() => setProvider('gemini')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'gemini' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <Sparkles size={16} /> Google Gemini
                </button>
                <button 
                    onClick={() => setProvider('openai')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <Bot size={16} /> OpenAI (GPT-4)
                </button>
            </div>

            {/* API Key Input Section */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Key size={14} /> {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                </label>
                
                {/* GEMINI KEY UI */}
                {provider === 'gemini' && (
                    isUsingGlobalGemini ? (
                        <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400 text-sm font-medium">
                            <Zap size={16} fill="currentColor" /> 
                            <span>Connected via App Key (Free Mode)</span>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="Paste Google API Key..."
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                            />
                            {geminiKey && <button onClick={() => clearKey('gemini')} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear</button>}
                        </div>
                    )
                )}

                {/* OPENAI KEY UI */}
                {provider === 'openai' && (
                    isUsingGlobalOpenAI ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                            <Zap size={16} fill="currentColor" /> 
                            <span>Connected via App Key</span>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-..."
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                            />
                            {openaiKey && <button onClick={() => clearKey('openai')} className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Clear</button>}
                        </div>
                    )
                )}
                
                {provider === 'openai' && !isUsingGlobalOpenAI && (
                    <p className="text-[10px] text-slate-400">
                        Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">platform.openai.com</a>
                    </p>
                )}
            </div>

            {/* Prompt Preview */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Prompt</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                    {prompt}
                </div>
            </div>

            {/* Result Area */}
            {(result || error || loading) && (
                <div className={`rounded-xl border p-4 ${error ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : (provider === 'openai' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800')}`}>
                    {loading ? (
                        <div className={`flex items-center gap-2 text-sm font-medium ${provider === 'openai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            <Loader size={16} className="animate-spin" /> Waiting for {provider === 'openai' ? 'ChatGPT' : 'Gemini'}...
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
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 ${provider === 'openai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                <Check size={14} /> {provider === 'openai' ? 'GPT Response' : 'Gemini Response'}
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
                disabled={loading || (provider === 'gemini' ? !geminiKey : !openaiKey)}
                className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
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