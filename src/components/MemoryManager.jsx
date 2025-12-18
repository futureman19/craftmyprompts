import React, { useState } from 'react';
import { Save, Trash2, Plus, Brain, Loader, X } from 'lucide-react';

const MemoryManager = ({ memories, onSave, onDelete, loading }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleSave = () => {
        if (newKey && newValue) {
            onSave(newKey, newValue);
            setNewKey('');
            setNewValue('');
            setIsAdding(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Brain size={18} className="text-pink-500" /> Long-Term Memory
                </h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                    <Plus size={14} /> Add Memory
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader size={24} className="animate-spin text-slate-400" />
                    </div>
                ) : Object.keys(memories).length === 0 && !isAdding ? (
                    <div className="text-center p-8 text-slate-400 text-sm">
                        No memories stored yet.<br/>The agent will learn about you over time, or you can add facts manually.
                    </div>
                ) : (
                    <>
                        {/* Add Form */}
                        {isAdding && (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-500/50 shadow-sm animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 gap-2 mb-2">
                                    <input 
                                        className="text-xs font-bold p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 dark:text-white"
                                        placeholder="Key (e.g. 'preferred_stack')"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                    />
                                    <textarea 
                                        className="text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 dark:text-slate-300 resize-none"
                                        placeholder="Value (e.g. 'React, Tailwind, and Supabase')"
                                        rows={2}
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={16}/></button>
                                    <button onClick={handleSave} className="p-1 text-indigo-500 hover:text-indigo-700"><Save size={16}/></button>
                                </div>
                            </div>
                        )}

                        {/* Memory Items */}
                        {Object.entries(memories).map(([key, value]) => (
                            <div key={key} className="group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{key}</div>
                                    <div className="text-sm text-slate-700 dark:text-slate-200">{value}</div>
                                </div>
                                <button 
                                    onClick={() => onDelete(key)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center flex-shrink-0">
                These facts are injected into the context of every agent interaction.
            </div>
        </div>
    );
};

export default MemoryManager;