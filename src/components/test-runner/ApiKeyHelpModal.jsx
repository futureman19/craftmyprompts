import React, { useState, useEffect } from 'react';
import { Key, Lock, Save, X } from 'lucide-react';

export default function ApiKeyHelpModal({ isOpen, onClose, onSave }) {
    // Initialize state directly from LocalStorage
    const [keys, setKeys] = useState({
        openai: '',
        anthropic: '',
        gemini: ''
    });

    // Load keys on mount
    useEffect(() => {
        const savedKeys = {
            openai: localStorage.getItem('openai_key') || '',
            anthropic: localStorage.getItem('anthropic_key') || '',
            gemini: localStorage.getItem('gemini_key') || ''
        };
        setKeys(savedKeys);
    }, [isOpen]);

    const handleSave = () => {
        // 1. Save to LocalStorage (Persistence)
        localStorage.setItem('openai_key', keys.openai);
        localStorage.setItem('anthropic_key', keys.anthropic);
        localStorage.setItem('gemini_key', keys.gemini);

        // 2. Pass to App State
        onSave(keys);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-400" /> Configure Model Keys
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">OpenAI API Key (GPT-4o)</label>
                        <input
                            type="password"
                            value={keys.openai}
                            onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                            placeholder="sk-proj-..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Anthropic API Key (Claude)</label>
                        <input
                            type="password"
                            value={keys.anthropic}
                            onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
                            placeholder="sk-ant-..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Gemini API Key (Google)</label>
                        <input
                            type="password"
                            value={keys.gemini}
                            onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                            placeholder="AIzaSy..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}