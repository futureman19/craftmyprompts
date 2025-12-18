import React, { useState, useEffect } from 'react';
import { X, Github, Copy, Check, Loader, ExternalLink, Lock, Globe, AlertCircle } from 'lucide-react';

const GitHubModal = ({ isOpen, onClose, codeToPush, onShip, initialToken }) => {
    const [step, setStep] = useState('config'); // 'config' | 'shipping' | 'success'
    const [token, setToken] = useState('');
    const [filename, setFilename] = useState('snippet.js');
    const [description, setDescription] = useState('Created with CraftMyPrompt');
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState(null);
    const [gistUrl, setGistUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('config');
            setError(null);
            setGistUrl('');
            if (initialToken) setToken(initialToken);
        }
    }, [isOpen, initialToken]);

    if (!isOpen) return null;

    const handleShipClick = async () => {
        if (!token) {
            setError("GitHub Personal Access Token is required.");
            return;
        }
        
        setStep('shipping');
        setError(null);

        try {
            // Reuse the logic from useTestRunner directly here for standalone usage
            const payload = {
                description: description || "Snippet from CraftMyPrompt",
                public: isPublic,
                files: {
                    [filename || 'snippet.txt']: {
                        content: codeToPush
                    }
                }
            };

            // Usually onShip is passed from the parent hook which handles the fetch
            if (onShip) {
                const url = await onShip(token, filename, description, isPublic);
                setGistUrl(url);
                setStep('success');
            } else {
                // Fallback direct call if onShip prop isn't available
                const response = await fetch('/api/github', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        token: token, 
                        action: 'create_gist', 
                        payload: payload 
                    })
                });
        
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to ship to GitHub.");
                setGistUrl(data.html_url);
                setStep('success');
            }
            
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create Gist.");
            setStep('config');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToPush);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150] p-0 md:p-4 animate-in fade-in duration-200">
            {/* Responsive Container: Full screen on mobile, modal card on desktop */}
            <div className="bg-white dark:bg-slate-900 w-full md:max-w-lg h-full md:h-auto rounded-none md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Github size={20} className="text-slate-900 dark:text-white" /> Ship to GitHub
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {step === 'config' && (
                        <div className="space-y-4">
                            {/* Token Input */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                    GitHub Token (PAT)
                                    <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1">Get Token <ExternalLink size={10}/></a>
                                </label>
                                <input 
                                    type="password" 
                                    value={token} 
                                    onChange={(e) => setToken(e.target.value)} 
                                    placeholder="ghp_..."
                                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                />
                                <p className="text-[10px] text-slate-400">Requires 'gist' scope.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Filename</label>
                                    <input 
                                        type="text" 
                                        value={filename} 
                                        onChange={(e) => setFilename(e.target.value)}
                                        className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Visibility</label>
                                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <button 
                                            onClick={() => setIsPublic(true)} 
                                            className={`flex-1 text-xs flex items-center justify-center gap-1 py-1 rounded transition-colors ${isPublic ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-400'}`}
                                        >
                                            <Globe size={12} /> Public
                                        </button>
                                        <button 
                                            onClick={() => setIsPublic(false)} 
                                            className={`flex-1 text-xs flex items-center justify-center gap-1 py-1 rounded transition-colors ${!isPublic ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-400'}`}
                                        >
                                            <Lock size={12} /> Secret
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <input 
                                    type="text" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                />
                            </div>

                            {/* Code Preview (Mini) */}
                            <div className="relative group">
                                <pre className="p-3 bg-slate-900 text-slate-400 rounded-lg text-[10px] font-mono overflow-hidden h-24 border border-slate-700 opacity-80">
                                    <code>{codeToPush}</code>
                                </pre>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <button onClick={handleCopy} className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1">
                                        {copied ? <Check size={12}/> : <Copy size={12}/>} Copy Raw
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 text-xs flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'shipping' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Loader size={48} className="animate-spin text-indigo-500" />
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Shipping to GitHub...</h4>
                                <p className="text-sm text-slate-500">Creating your Gist securely.</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Check size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white">Deployed Successfully!</h4>
                                <p className="text-sm text-slate-500">Your snippet is live on GitHub.</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setStep('config')} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors">
                                    Create Another
                                </button>
                                <a href={gistUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                    View Gist <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {step === 'config' && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleShipClick} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                            <Github size={16} /> Ship It
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitHubModal;