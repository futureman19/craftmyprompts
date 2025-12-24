import React, { useState } from 'react';
import { Palette, CheckSquare, Square, FastForward, MessageSquareQuote, ArrowRight, Star } from 'lucide-react';

const MuseDeck = ({ data, onConfirm }) => {
    // State stores ARRAYS of selections per category
    // { "Artistic Style": ["Cyberpunk", "Noir"], "Atmosphere": ["Foggy"] }
    const [selections, setSelections] = useState({});

    if (!data || !data.strategy_options) return null;

    const toggleSelection = (category, value) => {
        setSelections(prev => {
            const currentList = prev[category] || [];
            if (currentList.includes(value)) {
                // Remove it
                return { ...prev, [category]: currentList.filter(item => item !== value) };
            } else {
                // Add it
                return { ...prev, [category]: [...currentList, value] };
            }
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Palette size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Muse</h3>
                        <p className="text-sm text-slate-400">{data.strategy_summary}</p>
                    </div>
                </div>

                {/* BLURB */}
                {data.agent_commentary && (
                    <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-purple-400 shrink-0 mt-1" size={20} />
                        <p className="text-purple-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* OPTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {data.strategy_options.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex flex-col h-[500px]">
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                            {cat.category}
                        </div>
                        <h4 className="text-white font-medium text-lg mb-4">{cat.question}</h4>

                        {/* SCROLLABLE LIST AREA */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {cat.options.map((opt) => {
                                const isSelected = (selections[cat.category] || []).includes(opt.label);
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => toggleSelection(cat.category, opt.label)}
                                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between group ${isSelected
                                                ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-purple-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* CHECKBOX ICON */}
                                            {isSelected
                                                ? <CheckSquare size={20} className="text-white" />
                                                : <Square size={20} className="text-slate-600 group-hover:text-purple-400" />
                                            }

                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{opt.label}</span>
                                                <span className={`text-[10px] ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                                                    {opt.description}
                                                </span>
                                            </div>
                                        </div>

                                        {opt.recommended && (
                                            <Star size={12} className={isSelected ? "text-purple-200" : "text-amber-400"} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button
                    onClick={() => onConfirm({})}
                    className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <FastForward size={16} />
                    Decide for me (Auto-Pilot)
                </button>

                <button
                    onClick={() => onConfirm(selections)}
                    className="px-8 py-3 bg-white hover:bg-purple-50 text-slate-900 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default MuseDeck;
