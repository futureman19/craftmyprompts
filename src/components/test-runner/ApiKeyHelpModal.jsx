import React, { useState, useEffect } from 'react';
import { Key, Lock, Save, X, ExternalLink, ShieldCheck } from 'lucide-react';

const PROVIDERS = [
    { id: 'openai', label: 'OpenAI', link: 'https://platform.openai.com/api-keys', placeholder: 'sk-proj-...' },
    { id: 'anthropic', label: 'Claude', link: 'https://console.anthropic.com/settings/keys', placeholder: 'sk-ant-...' },
    { id: 'gemini', label: 'Gemini', link: 'https://aistudio.google.com/app/apikey', placeholder: 'AIzaSy...' },
    { id: 'groq', label: 'Groq', link: 'https://console.groq.com/keys', placeholder: 'gsk_...' }
];

export default function ApiKeyHelpModal({ isOpen, onClose, onSave }) {
    const [activeTab, setActiveTab] = useState('openai');
    const [keys, setKeys] = useState({
        openai: '',
        anthropic: '',
        gemini: '',
        groq: ''
    });

    // Load keys on mount or open
    useEffect(() => {
        if (!isOpen) return;
        const savedKeys = {
            openai: localStorage.getItem('openai_key') || '',
            anthropic: localStorage.getItem('anthropic_key') || '',
            gemini: localStorage.getItem('gemini_key') || '',
            groq: localStorage.getItem('groq_key') || ''
        };
        setKeys(savedKeys);
    }, [isOpen]);

    const handleSave = () => {
        // 1. Save to LocalStorage (Persistence)
        localStorage.setItem('openai_key', keys.openai ? keys.openai.trim() : '');
        localStorage.setItem('anthropic_key', keys.anthropic ? keys.anthropic.trim() : '');
        localStorage.setItem('gemini_key', keys.gemini ? keys.gemini.trim() : '');
        localStorage.setItem('groq_key', keys.groq ? keys.groq.trim() : '');

        // 2. Safe Pass to App State
        if (typeof onSave === 'function') {
            onSave(keys);
        }

        // 3. Close
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    if (!isOpen) return null;

    const currentProvider = PROVIDERS.find(p => p.id === activeTab);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-emerald-500" /> API Connections
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Securely stored in your browser's LocalStorage.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/50">
                    {PROVIDERS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveTab(p.id)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === p.id
                                    ? 'text-white border-emerald-500 bg-slate-800'
                                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 bg-slate-900">

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {currentProvider.label} API Key
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={keys[activeTab]}
                                onChange={(e) => setKeys({ ...keys, [activeTab]: e.target.value })}
                                placeholder={currentProvider.placeholder}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-sm transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Help Link */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-800 flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <ExternalLink size={16} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-200">Need a key?</h4>
                            <p className="text-xs text-slate-400 mt-1 mb-2">
                                Get your API key directly from the {currentProvider.label} dashboard.
                            </p>
                            <a
                                href={currentProvider.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                            >
                                Open {currentProvider.label} Dashboard <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>Keys are never sent to our servers, only to the AI providers.</span>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all flex items-center gap-2"
                    >
                        <Save size={16} /> Save & Connect
                    </button>
                </div>

            </div>
        </div>
    );
}