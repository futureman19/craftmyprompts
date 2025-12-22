import React, { useState } from 'react';
import { Check, ArrowRight, Lightbulb } from 'lucide-react';

const VisionaryDeck = ({ data, onConfirm }) => {
    // State to track selected option per category
    // Default to first option if available
    const [selections, setSelections] = useState({});

    if (!data || !data.strategy_options) {
        return (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-xs font-mono">
                Visionary Output Error: Invalid JSON Format.
                <pre className="mt-2 text-[10px] opacity-50">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    const isSelected = (category, value) => {
        // If nothing selected yet, default to first option logic? 
        // Or strictly check state. Let's strictly check state.
        return selections[category] === value;
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 animate-in slide-in-from-bottom-4">
            {/* Analysis Card */}
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />

                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Strategic Analysis</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mt-2">
                            {data.analysis || "Analyzing request..."}
                        </p>
                    </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {data.strategy_options.map((opt, idx) => (
                        <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                {opt.category}
                            </div>
                            <div className="text-sm font-medium text-white mb-3 min-h-[40px]">
                                {opt.question}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {opt.options.map((choice) => {
                                    const active = selections[opt.category] === choice;
                                    return (
                                        <button
                                            key={choice}
                                            onClick={() => handleSelect(opt.category, choice)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${active
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                                }`}
                                        >
                                            {active && <Check size={12} />}
                                            {choice}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirm Action */}
                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                        onClick={() => onConfirm(selections)}
                        disabled={Object.keys(selections).length < data.strategy_options.length}
                        className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Strategy <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisionaryDeck;
