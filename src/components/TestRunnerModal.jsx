import React, { useState, useEffect } from 'react';
import { X, Play, Key, Loader, Check, AlertTriangle, Terminal, Cpu, RefreshCw, Zap, Bot, Sparkles, Swords, GitCompare, Layers, MonitorPlay, Copy, ArrowRight, Target, Split } from 'lucide-react';

// --- INTERNAL COMPONENT: CODE BLOCK RENDERER ---
const CodeBlock = ({ rawContent }) => {
    const [copied, setCopied] = useState(false);
    
    // Clean up: remove the opening ```lang line and closing ```
    // This regex looks for the first newline to strip the header, and removes the last line
    const cleanCode = rawContent.replace(/^```[a-z]*\n/i, '').replace(/```$/, '');
    
    // Extract language label if present (e.g. ```javascript)
    const match = rawContent.match(/^```([a-z]+)/i);
    const language = match ? match[1] : 'Code';

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-3 rounded-lg overflow-hidden bg-[#1e1e1e] border border-slate-700 shadow-sm relative group">
            <div className="flex justify-between items-center px-3 py-1.5 bg-[#252526] border-b border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{language}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-xs leading-5 text-[#d4d4d4]">
                <code>{cleanCode}</code>
            </pre>
        </div>
    );
};

const TestRunnerModal = ({ isOpen, onClose, prompt, defaultApiKey, defaultOpenAIKey }) => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState('simple'); // 'simple' (Single Model) | 'advanced' (Workflows)
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai' | 'battle' | 'refine'
  const [refineView, setRefineView] = useState('timeline'); // 'timeline' | 'diff'
  
  // CTO UPDATE: Configurable Refine Roles & Focus
  const [refineConfig, setRefineConfig] = useState({ 
      drafter: 'gemini', 
      critiquer: 'openai',
      focus: 'general' // 'general', 'security', 'performance', 'cleanliness', 'roast'
  });

  // Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  
  // Execution
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Single result (Gemini/OpenAI/Refine Final)
  const [battleResults, setBattleResults] = useState(null); // { gemini: '', openai: '' }
  const [refineSteps, setRefineSteps] = useState(null); // { draft: '', critique: '', final: '' }
  const [statusMessage, setStatusMessage] = useState(''); 
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState(null); 
  
  // Models
  const [selectedModel, setSelectedModel] = useState(''); 
  const [availableModels, setAvailableModels] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!isOpen) return;

    // Load Keys
    if (defaultApiKey) setGeminiKey(defaultApiKey);
    else setGeminiKey(localStorage.getItem('craft_my_prompt_gemini_key') || '');

    if (defaultOpenAIKey) setOpenaiKey(defaultOpenAIKey);
    else setOpenaiKey(localStorage.getItem('craft_my_prompt_openai_key') || '');
    
  }, [isOpen, defaultApiKey, defaultOpenAIKey]);

  // Auto-Fetch Gemini Models
  useEffect(() => {
      if (isOpen && geminiKey) fetchModels(geminiKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, geminiKey]);

  // --- HELPERS ---
  const saveKey = (key, providerName) => {
      const storageKey = `craft_my_prompt_${providerName}_key`;
      const defaultKey = providerName === 'gemini' ? defaultApiKey : defaultOpenAIKey;
      if (key.trim() && key !== defaultKey) localStorage.setItem(storageKey, key.trim());
  };

  const clearKey = (providerName) => {
      const storageKey = `craft_my_prompt_${providerName}_key`;
      localStorage.removeItem(storageKey);
      if (providerName === 'gemini') setGeminiKey('');
      else setOpenaiKey('');
  };

  const copyToClipboard = (text, label) => {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
  };

  // --- CTO UPDATE: Smart Format Parser ---
  const renderResultContent = (text) => {
      if (!text) return null;

      // Split text by code blocks (```...```)
      // The regex captures the delimiter so we can process it
      const parts = text.split(/(```[\s\S]*?```)/g);

      return (
          <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {parts.map((part, index) => {
                  if (part.startsWith('```')) {
                      // Render Code Block Component
                      return <CodeBlock key={index} rawContent={part} />;
                  }
                  // Render regular text (with line breaks preserved)
                  // Don't render empty strings resulting from split
                  if (!part.trim() && parts.length > 1) return null;
                  
                  return (
                      <div key={index} className="whitespace-pre-wrap mb-2">
                          {part}
                      </div>
                  );
              })}
          </div>
      );
  };

  const fetchModels = async (keyToUse = geminiKey) => {
      if (!keyToUse) return;
      try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
          const data = await response.json();
          if (data.models) {
              const validModels = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
              setAvailableModels(validModels);
              // Auto-Select Logic
              const currentExists = validModels.find(m => m.name === selectedModel);
              if (!selectedModel || !currentExists) {
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

  // --- GENERIC API HANDLER ---
  const callAIProvider = async (providerName, promptText, key) => {
      if (providerName === 'gemini') {
          return await callGemini(promptText, key, selectedModel);
      } else {
          return await callOpenAI(promptText, key);
      }
  };

  // --- API CALLS ---
  const callGemini = async (promptText, key, model) => {
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
          body: JSON.stringify({ apiKey: key, prompt: promptText, model: "gpt-4o" })
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
            // Check keys for selected providers
            if (refineConfig.drafter === 'gemini' && !geminiKey) throw new Error("Gemini API Key missing for Drafter.");
            if (refineConfig.drafter === 'openai' && !openaiKey) throw new Error("OpenAI API Key missing for Drafter.");
            if (refineConfig.critiquer === 'gemini' && !geminiKey) throw new Error("Gemini API Key missing for Critiquer.");
            if (refineConfig.critiquer === 'openai' && !openaiKey) throw new Error("OpenAI API Key missing for Critiquer.");

            // Save keys
            if (geminiKey) saveKey(geminiKey, 'gemini');
            if (openaiKey) saveKey(openaiKey, 'openai');

            // --- STEP 1: DRAFT ---
            const drafterName = refineConfig.drafter === 'gemini' ? 'Gemini' : 'ChatGPT';
            setStatusMessage(`Step 1/3: ${drafterName} is drafting...`);
            
            const drafterKey = refineConfig.drafter === 'gemini' ? geminiKey : openaiKey;
            const draft = await callAIProvider(refineConfig.drafter, prompt, drafterKey);
            
            setRefineSteps({ draft, critique: null, final: null });

            // --- STEP 2: CRITIQUE ---
            const critiquerName = refineConfig.critiquer === 'gemini' ? 'Gemini' : 'ChatGPT';
            setStatusMessage(`Step 2/3: ${critiquerName} is critiquing...`);
            
            const critiquerKey = refineConfig.critiquer === 'gemini' ? geminiKey : openaiKey;
            
            // Construct Critique Prompt based on Focus
            const focusMap = {
                'general': 'General Improvements & Clarity',
                'security': 'Security Vulnerabilities & Safety',
                'performance': 'Performance Optimization & Speed',
                'cleanliness': 'Code Cleanliness, DRY Principles & Best Practices',
                'roast': 'Roast this code (Humorous but harsh logic check)'
            };
            const focusText = focusMap[refineConfig.focus] || 'General Improvements';
            
            const critiquePrompt = `Act as a Senior Technical Lead specialized in ${focusText}. Review the following text/code. List 3 specific, actionable improvements strictly focusing on ${refineConfig.focus}.\n\nINPUT:\n${draft}`;
            
            const critique = await callAIProvider(refineConfig.critiquer, critiquePrompt, critiquerKey);
            
            setRefineSteps({ draft, critique, final: null });

            // --- STEP 3: POLISH (Back to Drafter) ---
            setStatusMessage(`Step 3/3: ${drafterName} is polishing...`);
            const polishPrompt = `Rewrite the original input below to address the critique points. Keep the tone professional but implement the fixes.\n\nORIGINAL:\n${draft}\n\nCRITIQUE:\n${critique}`;
            const final = await callAIProvider(refineConfig.drafter, polishPrompt, drafterKey);
            
            setRefineSteps({ draft, critique, final });
            setResult(final); // Final result to display if needed

        } else if (provider === 'battle') {
            if (!geminiKey || !openaiKey) throw new Error("Both API Keys are required.");
            saveKey(geminiKey, 'gemini'); saveKey(openaiKey, 'openai');
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
            if (!geminiKey) throw new Error("Gemini Key missing.");
            saveKey(geminiKey, 'gemini');
            setStatusMessage('Gemini is thinking...');
            const text = await callGemini(prompt, geminiKey, selectedModel);
            setResult(text);

        } else if (provider === 'openai') {
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

  // --- UI HANDLERS ---
  const handleViewChange = (mode) => {
      setViewMode(mode);
      if (mode === 'simple') setProvider('gemini');
      if (mode === 'advanced') setProvider('battle');
  };

  if (!isOpen) return null;

  const isUsingGlobalGemini = defaultApiKey && geminiKey === defaultApiKey;
  const isUsingGlobalOpenAI = defaultOpenAIKey && openaiKey === defaultOpenAIKey;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-900 w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${provider === 'battle' || provider === 'refine' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        
        {/* Header with Two-Tier Nav */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Terminal size={18} className="text-indigo-500" /> Test Prompt
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={20} /></button>
            </div>
            
            {/* TIER 1: MODE SELECTOR */}
            <div className="flex px-4 gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => handleViewChange('simple')} 
                    className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${viewMode === 'simple' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'border-transparent hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <MonitorPlay size={16} /> Individual Run
                </button>
                <button 
                    onClick={() => handleViewChange('advanced')} 
                    className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${viewMode === 'advanced' ? 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400' : 'border-transparent hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Layers size={16} /> Orchestrator
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* TIER 2: TOOL SELECTOR */}
            {viewMode === 'simple' ? (
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button onClick={() => setProvider('gemini')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'gemini' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><Sparkles size={16} /> Gemini</button>
                    <button onClick={() => setProvider('openai')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'openai' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><Bot size={16} /> OpenAI</button>
                </div>
            ) : (
                <div className="flex p-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                    <button onClick={() => setProvider('battle')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'battle' ? 'bg-white dark:bg-slate-800 shadow text-amber-600 dark:text-amber-400' : 'text-amber-700/50 dark:text-amber-500/50 hover:text-amber-700'}`}><Swords size={16} /> Battle (Compare)</button>
                    <button onClick={() => setProvider('refine')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${provider === 'refine' ? 'bg-white dark:bg-slate-800 shadow text-orange-600 dark:text-orange-400' : 'text-amber-700/50 dark:text-amber-500/50 hover:text-amber-700'}`}><GitCompare size={16} /> Refine (Loop)</button>
                </div>
            )}
            
            {/* Refine Configuration Panel */}
            {provider === 'refine' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 animate-in fade-in space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                         <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <Layers size={14} /> Workflow Pipeline
                         </h4>
                         {/* View Toggle */}
                         {refineSteps && (
                             <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-amber-200 dark:border-amber-800">
                                 <button onClick={() => setRefineView('timeline')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${refineView === 'timeline' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}><Layers size={12} /> Timeline</button>
                                 <button onClick={() => setRefineView('diff')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${refineView === 'diff' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}><Split size={12} /> Diff View</button>
                             </div>
                         )}
                         <div className="flex items-center gap-2">
                            <Target size={14} className="text-amber-500" />
                            <select 
                                value={refineConfig.focus}
                                onChange={(e) => setRefineConfig(prev => ({ ...prev, focus: e.target.value }))}
                                className="text-xs p-1 rounded border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="general">General Improvement</option>
                                <option value="security">Security Audit</option>
                                <option value="performance">Performance Optimization</option>
                                <option value="cleanliness">Code Cleanup</option>
                                <option value="roast">Roast My Code 🔥</option>
                            </select>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Drafter</label>
                            <select 
                                value={refineConfig.drafter}
                                onChange={(e) => setRefineConfig(prev => ({ ...prev, drafter: e.target.value }))}
                                className="w-full text-sm p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="gemini">Gemini</option>
                                <option value="openai">OpenAI (GPT-4)</option>
                            </select>
                        </div>
                        <ArrowRight size={20} className="text-amber-300 mt-5" />
                        <div className="flex-1">
                            <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Critiquer</label>
                            <select 
                                value={refineConfig.critiquer}
                                onChange={(e) => setRefineConfig(prev => ({ ...prev, critiquer: e.target.value }))}
                                className="w-full text-sm p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="openai">OpenAI (GPT-4)</option>
                                <option value="gemini">Gemini</option>
                            </select>
                        </div>
                        <ArrowRight size={20} className="text-amber-300 mt-5" />
                        <div className="flex-1 opacity-60">
                             <label className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Polisher</label>
                             <div className="text-sm p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-slate-100 dark:bg-slate-800 text-slate-500 italic">
                                 {refineConfig.drafter === 'gemini' ? 'Gemini' : 'OpenAI'}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys (Context Aware) */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                {/* Gemini Input */}
                {(provider === 'gemini' || provider === 'battle' || (provider === 'refine' && (refineConfig.drafter === 'gemini' || refineConfig.critiquer === 'gemini'))) && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1"><Key size={12} /> Gemini Key</label>
                            {provider === 'gemini' && <button onClick={() => fetchModels()} disabled={!geminiKey} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-indigo-500 hover:underline disabled:opacity-30"><RefreshCw size={10} /> Refresh Models</button>}
                        </div>
                        {isUsingGlobalGemini ? (
                             <div className="flex items-center gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-md text-indigo-700 dark:text-indigo-400 text-xs font-medium"><Zap size={14} fill="currentColor" /> <span>Connected via App Key (Free)</span></div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Paste Google API Key..." className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                {geminiKey && <button onClick={() => clearKey('gemini')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                            </div>
                        )}
                        {provider === 'gemini' && (
                             <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs outline-none">
                                {availableModels.length > 0 ? availableModels.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>) : <option value="">Fetching models...</option>}
                            </select>
                        )}
                    </div>
                )}
                
                {/* Separator for Advanced Mode */}
                {viewMode === 'advanced' && <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-1"></div>}

                {/* OpenAI Input */}
                {(provider === 'openai' || provider === 'battle' || (provider === 'refine' && (refineConfig.drafter === 'openai' || refineConfig.critiquer === 'openai'))) && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><Key size={12} /> OpenAI Key</label>
                        {isUsingGlobalOpenAI ? (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-md text-emerald-700 dark:text-emerald-400 text-xs font-medium"><Zap size={14} fill="currentColor" /> <span>Connected via App Key</span></div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none" />
                                {openaiKey && <button onClick={() => clearKey('openai')} className="text-xs text-red-400 hover:underline px-1">Clear</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Prompt Preview */}
            {(!battleResults && !refineSteps && !result) && (
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Current Prompt</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">{prompt}</div>
                </div>
            )}

            {/* --- RESULTS DISPLAY --- */}
            
            {/* Single Result */}
            {(result || error || (loading && viewMode === 'simple')) && (
                <div className={`rounded-xl border p-4 animate-in slide-in-from-bottom-2 fade-in ${error ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"><Loader size={16} className="animate-spin" /> {statusMessage || 'Generating...'}</div>
                    ) : error ? (
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm"><AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><div className="overflow-hidden"><strong className="block font-bold">Error</strong><span className="break-words">{error}</span></div></div>
                    ) : (
                        <div className="relative">
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 ${provider === 'openai' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                <Check size={14} /> Result
                                <button onClick={() => copyToClipboard(result, 'result')} className="ml-auto text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                    {copiedText === 'result' ? <Check size={10} /> : <Copy size={10} />} {copiedText === 'result' ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            {renderResultContent(result)}
                        </div>
                    )}
                </div>
            )}

            {/* Battle Results (Parallel Display) */}
            {provider === 'battle' && (loading || battleResults) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 fade-in">
                     <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 flex flex-col h-full relative">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-2">
                             <Sparkles size={18} /> Gemini
                             {battleResults?.gemini && <button onClick={() => copyToClipboard(battleResults.gemini, 'gemini')} className="ml-auto p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded">{copiedText === 'gemini' ? <Check size={14} /> : <Copy size={14} />}</button>}
                        </div>
                        {loading ? <div className="text-sm italic text-indigo-400">Thinking...</div> : renderResultContent(battleResults?.gemini)}
                    </div>
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 flex flex-col h-full relative">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                             <Bot size={18} /> GPT-4o
                             {battleResults?.openai && <button onClick={() => copyToClipboard(battleResults.openai, 'openai')} className="ml-auto p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">{copiedText === 'openai' ? <Check size={14} /> : <Copy size={14} />}</button>}
                        </div>
                        {loading ? <div className="text-sm italic text-emerald-400">Thinking...</div> : renderResultContent(battleResults?.openai)}
                    </div>
                </div>
            )}

            {/* Refine Results (Timeline OR Diff View) */}
            {provider === 'refine' && (loading || refineSteps) && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                    {loading && <div className="text-center text-sm font-bold text-amber-600 dark:text-amber-400 animate-pulse bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">{statusMessage}</div>}
                    
                    {refineView === 'timeline' ? (
                        <>
                            {/* TIMELINE MODE */}
                            {refineSteps?.draft && (
                                <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-500 mb-2">
                                        <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">Step 1</span> Draft ({refineConfig.drafter === 'gemini' ? 'Gemini' : 'ChatGPT'})
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer overflow-hidden" title="Click to expand">
                                        {renderResultContent(refineSteps.draft)}
                                    </div>
                                </div>
                            )}
                            
                            {refineSteps?.critique && (
                                <div className="flex flex-col items-center">
                                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 my-1"></div>
                                    <div className="p-4 w-full bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-500 mb-2">
                                            <span className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">Step 2</span> Critique ({refineConfig.critiquer === 'gemini' ? 'Gemini' : 'ChatGPT'})
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                                            {renderResultContent(refineSteps.critique)}
                                        </div>
                                    </div>
                                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 my-1"></div>
                                </div>
                            )}

                            {refineSteps?.final && (
                                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-lg relative">
                                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-600 dark:text-amber-500 mb-3 border-b border-amber-200 dark:border-slate-700 pb-2">
                                        <Sparkles size={16} /> Final Polish ({refineConfig.drafter === 'gemini' ? 'Gemini' : 'ChatGPT'})
                                        <button onClick={() => copyToClipboard(refineSteps.final, 'final')} className="ml-auto text-[10px] bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 px-2 py-1 rounded hover:bg-amber-50 transition-colors flex items-center gap-1">
                                            {copiedText === 'final' ? <Check size={12} /> : <Copy size={12} />} {copiedText === 'final' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    {renderResultContent(refineSteps.final)}
                                </div>
                            )}
                        </>
                    ) : (
                        /* DIFF VIEW (Side by Side) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                            {/* Before Panel */}
                             <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10 p-4 flex flex-col h-full overflow-hidden">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3 border-b border-red-200 dark:border-red-800 pb-2">
                                     <MonitorPlay size={18} /> Original Draft
                                </div>
                                <div className="overflow-y-auto flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                    {renderResultContent(refineSteps?.draft)}
                                </div>
                            </div>
                            
                            {/* After Panel */}
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 flex flex-col h-full overflow-hidden">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                                     <Sparkles size={18} /> Final Polish
                                     <button onClick={() => copyToClipboard(refineSteps?.final, 'final')} className="ml-auto p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">{copiedText === 'final' ? <Check size={14} /> : <Copy size={14} />}</button>
                                </div>
                                <div className="overflow-y-auto flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                    {renderResultContent(refineSteps?.final)}
                                </div>
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
                disabled={loading || (viewMode === 'advanced' && (!geminiKey || !openaiKey)) || (viewMode === 'simple' && provider === 'gemini' && !geminiKey) || (viewMode === 'simple' && provider === 'openai' && !openaiKey) || ((provider === 'battle' || provider === 'refine') && (!geminiKey || !openaiKey))}
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