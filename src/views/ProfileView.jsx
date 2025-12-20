import React, { useState, useEffect } from 'react';
import { UserCircle2, Sun, Moon, Key, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import ApiKeyHelpModal from '../components/test-runner/ApiKeyHelpModal.jsx';

const ProfileView = ({ user, darkMode, toggleDarkMode }) => {
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [keys, setKeys] = useState({});

    // Load keys for status display
    useEffect(() => {
        const loadKeys = () => {
            const newKeys = {
                gemini: localStorage.getItem('gemini_api_key'),
                openai: localStorage.getItem('openai_api_key'),
                groq: localStorage.getItem('groq_api_key'),
                anthropic: localStorage.getItem('anthropic_api_key'),
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

                    {/* CARD 1: IDENTITY */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <UserCircle2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Identity</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your personal profile</p>
                            </div>
                        </div>

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
                    </div>

                    {/* CARD 2: APPEARANCE */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                {darkMode ? <Moon size={28} /> : <Sun size={28} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Appearance</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Interface customization</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 block mb-3">Interface Theme</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => darkMode && toggleDarkMode()}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!darkMode ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    onClick={() => !darkMode && toggleDarkMode()}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-slate-700 shadow text-white' : 'text-slate-500'}`}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: API KEYS */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Key size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Model Configuration</h3>
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

                    {/* CARD 4: SUBSCRIPTION */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 lg:col-span-1">
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
