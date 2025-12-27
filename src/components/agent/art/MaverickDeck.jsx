import React, { useState } from 'react';
import { Sparkles, Zap, Plus, ArrowRight, FastForward } from 'lucide-react';

const MaverickDeck = ({ data, onConfirm }) => {
    const [selected, setSelected] = useState([]);

    // Safety check
    if (!data || !data.wildcards) return null;

    const toggleSelection = (wildcard) => {
        if (selected.find(w => w.label === wildcard.label)) {
            setSelected(selected.filter(w => w.label !== wildcard.label));
        } else {
            setSelected([...selected, wildcard]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                <div className="p-2 bg-violet-500 text-white rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                    <Zap size={24} className="fill-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">The Maverick</h3>
                    <p className="text-sm text-slate-400">{data.suggestion_summary || "Adding some chaos to the mix..."}</p>
                </div>
            </div>

            {/* The Wildcards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {data.wildcards.map((card, idx) => {
                    const isSelected = selected.find(w => w.label === card.label);
                    return (
                        <button
                            key={idx}
                            onClick={() => toggleSelection(card)}
                            className={`relative group p-6 rounded-2xl border text-left transition-all duration-300 ${isSelected
                                    ? 'bg-violet-600 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-105 z-10'
                                    : 'bg-slate-900 border-slate-800 hover:border-violet-500/50 hover:bg-slate-800'
                                }`}
                        >
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">
                                {isSelected ? <span className="text-white">Selected</span> : <span className="text-violet-400">{card.category}</span>}
                            </div>

                            <h4 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                {card.label}
                            </h4>

                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-violet-100' : 'text-slate-500'}`}>
                                {card.description}
                            </p>

                            <div className={`absolute top-4 right-4 transition-transform duration-300 ${isSelected ? 'rotate-45' : 'rotate-0'}`}>
                                <Plus size={20} className={isSelected ? 'text-white' : 'text-slate-600'} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center border-t border-slate-800 pt-6">
                <button
                    onClick={() => onConfirm([])}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
                >
                    <FastForward size={16} /> Skip the Chaos
                </button>

                <button
                    onClick={() => onConfirm(selected)}
                    className="px-8 py-3 bg-white text-slate-950 hover:bg-violet-50 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                    {selected.length > 0 ? `Add ${selected.length} & Continue` : 'Continue'} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default MaverickDeck;
