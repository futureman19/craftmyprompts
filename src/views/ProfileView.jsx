import React, { useState, useEffect } from 'react';
import { UserCircle2, Sun, Moon, Key, CreditCard, ShieldCheck, Zap, Github, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import ApiKeyHelpModal from '../components/test-runner/ApiKeyHelpModal.jsx';

const ProfileView = ({ user, darkMode, toggleDarkMode }) => {
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [keys, setKeys] = useState({});

    // --- GITHUB INTEGRATION STATE ---
    const [githubToken, setGithubToken] = useState('');
    const [showTokenHelp, setShowTokenHelp] = useState(false);

    useEffect(() => {
        // Sync with local storage on load
        const stored = localStorage.getItem('github_token');
        if (stored) setGithubToken(stored);
    }, []);

    const handleSaveToken = (token) => {
        if (!token) return;
        localStorage.setItem('github_token', token);
        setGithubToken(token);
        // Optional: Add a toast notification here
    };

    const handleDisconnect = () => {
        localStorage.removeItem('github_token');
        setGithubToken('');
    };

    // Load keys for status display - ROBUST CHECK
    useEffect(() => {
        const loadKeys = () => {
            const newKeys = {
                // Check both formats to be safe
                gemini: localStorage.getItem('gemini_key') || localStorage.getItem('gemini_api_key'),
                openai: localStorage.getItem('openai_key') || localStorage.getItem('openai_api_key'),
                groq: localStorage.getItem('groq_key') || localStorage.getItem('groq_api_key'),
                anthropic: localStorage.getItem('anthropic_key') || localStorage.getItem('anthropic_api_key'),
            };
            setKeys(newKeys);
        };

        loadKeys();
        // Listen for storage events (if keys change in modal)
        window.addEventListener('storage', loadKeys);
        return () => window.removeEventListener('storage', loadKeys);
    }, [showKeyModal]); // Reload when modal closes

    return (
        <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* HEADLINE */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Account Settings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your identity, preferences, and AI configurations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* CARD 1: IDENTITY & SOCIALS */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm row-span-2">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <UserCircle2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Identity</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your digital profile</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Display Name</label>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {user?.displayName || 'Guest User'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Email Address</label>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {user?.email || 'Not signed in'}
                                    </div>
                                </div>
                            </div>

                            {/* Social Uplink */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-bold uppercase text-slate-400 block mb-3">Social Uplink</label>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center group cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                                <span className="text-xs font-bold">X</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Twitter / X</span>
                                        </div>
                                        <button className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                                            Connect
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center group cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#0077b5] text-white flex items-center justify-center">
                                                <span className="text-xs font-bold">in</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn</span>
                                        </div>
                                        <button className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: API KEYS */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Key size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Neural Keys</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your private API keys</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(keys).map(([provider, key]) => (
                                    <span key={provider} className={`text-[10px] px-2 py-1 rounded border ${key ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        {provider.charAt(0).toUpperCase() + provider.slice(1)}: {key ? 'Active' : 'Missing'}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowKeyModal(true)}
                                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <ShieldCheck size={18} /> Manage API Keys
                            </button>
                            <p className="text-[10px] text-center text-slate-400">
                                Keys are stored locally on your device. We never see them.
                            </p>
                        </div>
                    </div>

                    {/* CARD 3: SUBSCRIPTION */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600 dark:text-violet-400">
                                <CreditCard size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Plan & Usage</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your subscription status</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Current Plan</span>
                                <span className="text-xs font-bold px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 rounded uppercase tracking-wider">
                                    Free Beta
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Credits</span>
                                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                    <Zap size={14} /> Unlimited
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- GITHUB INTEGRATION CARD --- */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-800 rounded-xl text-white">
                                    <Github size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">GitHub</h3>
                                    <p className="text-sm text-slate-400">Deploy apps directly to repositories and Gists.</p>
                                </div>
                            </div>
                            {githubToken && (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-500/20">
                                    <CheckCircle size={12} /> Connected
                                </span>
                            )}
                        </div>

                        {!githubToken ? (
                            // DISCONNECTED STATE (Input Form)
                            <div className="mt-4 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                    Personal Access Token (PAT)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="password"
                                        placeholder="ghp_..."
                                        className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        id="github-token-input"
                                    />
                                    <button
                                        onClick={() => {
                                            const val = document.getElementById('github-token-input').value;
                                            handleSaveToken(val);
                                        }}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-900/20"
                                    >
                                        Connect
                                    </button>
                                </div>

                                {/* HELPER SECTION */}
                                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                    <button
                                        onClick={() => setShowTokenHelp(!showTokenHelp)}
                                        className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <AlertTriangle size={12} /> How do I get a token?
                                    </button>

                                    {showTokenHelp && (
                                        <div className="mt-3 text-xs text-slate-400 space-y-2 animate-in slide-in-from-top-1">
                                            <p>1. Log in to GitHub.</p>
                                            <p>2. Create a <b>Classic Token</b> with <code>repo</code> and <code>gist</code> scopes.</p>
                                            <a
                                                href="https://github.com/settings/tokens/new?scopes=repo,gist&description=CraftMyPrompt+App"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block text-center mt-2 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition-colors font-bold border border-slate-600"
                                            >
                                                Generate Token Automatically <ExternalLink size={12} className="inline ml-1" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // CONNECTED STATE
                            <div className="mt-4 flex items-center gap-4 animate-in fade-in">
                                <div className="flex-1 p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-mono truncate">
                                    {githubToken.substring(0, 8)}...{githubToken.substring(githubToken.length - 4)}
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="px-4 py-3 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 font-bold rounded-xl transition-colors text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Injection */}
            <ApiKeyHelpModal
                isOpen={showKeyModal}
                onClose={() => setShowKeyModal(false)}
            />
        </div>
    );
};

export default ProfileView;
