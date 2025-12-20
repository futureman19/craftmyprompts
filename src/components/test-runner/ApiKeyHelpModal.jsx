import React, { useState } from 'react';
import { X, Key, ExternalLink, HelpCircle, ChevronRight, Zap } from 'lucide-react';

const ApiKeyHelpModal = ({ isOpen, onClose, keys = {}, setters = {} }) => {
    const [activeTab, setActiveTab] = useState('gemini');
    // Local state for the input before saving/committing (optional, or bind directly)
    // Binding directly to the setter feels instant, but let's use local state for the "Save" feel if wanted.
    // Actually, since these are just local storage keys, direct binding is fine, but
    // let's use a local temp state to allow "Saving" action to feel distinct?
    // User requested "Save Key" button. So let's use local state.
    const [tempKey, setTempKey] = useState('');

    // Sync tempKey when tab changes
    React.useEffect(() => {
        if (keys && keys[activeTab]) {
            setTempKey(keys[activeTab]);
        } else {
            setTempKey('');
        }
    }, [activeTab, keys]);

    const handleSave = () => {
        if (setters && setters[activeTab]) {
            setters[activeTab](tempKey);
        }
    };

    if (!isOpen) return null;

    const providers = [
        {
            id: 'gemini',
            name: 'Google Gemini',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            link: 'https://aistudio.google.com/app/apikey',
            steps: [
                "Go to Google AI Studio.",
                "Click 'Create API key'.",
                "Select a project (or create new).",
                "Copy the key starting with 'AIza'."
            ]
        },
        {
            id: 'openai',
            name: 'OpenAI (GPT-4)',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            link: 'https://platform.openai.com/api-keys',
            steps: [
                "Log in to OpenAI Platform.",
                "Verify your phone number (required).",
                "Click 'Create new secret key'.",
                "Name it 'CraftMyPrompt' and copy it immediately."
            ]
        },
        {
            id: 'groq',
            name: 'Groq (Llama 3)',
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            link: 'https://console.groq.com/keys',
            steps: [
                "Sign up for Groq Cloud.",
                "Navigate to 'API Keys' in the sidebar.",
                "Click 'Create API Key'.",
                "Copy the key starting with 'gsk_'."
            ]
        },
        {
            id: 'anthropic',
            name: 'Anthropic (Claude)',
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            link: 'https://console.anthropic.com/settings/keys',
            steps: [
                "Go to the Anthropic Console.",
                "Click 'Get API Keys'.",
                "Click 'Create Key'.",
                "Copy the key starting with 'sk-ant'."
            ]
        }
    ];

    const currentProvider = providers.find(p => p.id === activeTab);
    const isSaved = keys && keys[activeTab] && keys[activeTab] === tempKey && tempKey.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden h-[600px]">

                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Key size={14} /> Providers
                    </h3>
                    {providers.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveTab(p.id)}
                            className={`flex items-center justify-between w-full p-3 rounded-lg text-sm font-medium transition-all ${activeTab === p.id
                                ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${p.color.replace('text-', 'bg-')}`}></span>
                                {p.name}
                            </span>
                            {keys && keys[p.id] && <span className="text-emerald-500 text-[10px]">●</span>}
                        </button>
                    ))}

                    <div className="mt-auto p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
                            <Zap size={14} /> Pro Tip
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            Keys are stored securely in your browser's local storage. They are never saved to our servers.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col relative overflow-y-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 flex-1 flex flex-col">
                        <div className={`w-12 h-12 ${currentProvider.bg} ${currentProvider.color} rounded-xl flex items-center justify-center mb-6`}>
                            <Key size={24} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {currentProvider.name}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            Follow these steps to generate a new secret key.
                        </p>

                        <div className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            {currentProvider.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{step}</span>
                                </div>
                            ))}
                            <a
                                href={currentProvider.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline mt-2 ml-10"
                            >
                                Open Developer Console <ExternalLink size={12} />
                            </a>
                        </div>

                        {/* INPUT SECTION */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-auto">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                Enter your API Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder={`e.g. ${currentProvider.id === 'gemini' ? 'AIza...' : 'sk-...'}`}
                                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={!tempKey || isSaved}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isSaved
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                        }`}
                                >
                                    {isSaved ? 'Saved' : 'Save Key'}
                                </button>
                            </div>
                            {isSaved && (
                                <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1 animate-in slide-in-from-left-2">
                                    <Zap size={12} /> Key is active and ready to use.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyHelpModal;