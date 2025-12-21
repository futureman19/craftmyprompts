import React, { useState, useEffect } from 'react';
import { Zap, Settings } from 'lucide-react';

const ApiWalletCard = ({ onConfigure }) => {
    const [status, setStatus] = useState({
        openai: false,
        anthropic: false,
        gemini: false
    });

    // Check LocalStorage for keys on mount
    useEffect(() => {
        const checkKeys = () => {
            setStatus({
                openai: !!localStorage.getItem('openai_key'),
                anthropic: !!localStorage.getItem('anthropic_key'),
                gemini: !!localStorage.getItem('gemini_key')
            });
        };

        checkKeys();

        // Optional: Listen for storage events if keys change in another tab
        window.addEventListener('storage', checkKeys);
        return () => window.removeEventListener('storage', checkKeys);
    }, []);

    const providers = [
        { id: 'openai', label: 'OpenAI (GPT-4)', connected: status.openai },
        { id: 'anthropic', label: 'Anthropic (Claude)', connected: status.anthropic },
        { id: 'gemini', label: 'Google Gemini', connected: status.gemini },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Zap className="text-indigo-500 fill-indigo-500/20" size={16} />
                    Neural Link Status
                </h3>
                <button
                    onClick={onConfigure}
                    className="text-xs text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <Settings size={12} /> Configure
                </button>
            </div>

            <div className="space-y-2">
                {providers.map(p => (
                    <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/60"
                    >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {p.label}
                        </span>

                        <div className="flex items-center gap-2">
                            <div className={`relative flex h-2 w-2`}>
                                {p.connected && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${p.connected ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${p.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'}`}>
                                {p.connected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Meta Info */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                Keys are stored securely in your browser's local storage.
            </div>
        </div>
    );
};

export default ApiWalletCard;
