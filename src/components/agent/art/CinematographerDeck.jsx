import React, { useState } from 'react';
import { Camera, CheckSquare, Square, FastForward, MessageSquareQuote, ArrowRight, Star } from 'lucide-react';

const CinematographerDeck = ({ data, onConfirm }) => {
    // State stores ARRAYS of selections per category
    const [selections, setSelections] = useState({});

    if (!data || !data.spec_options) return null;

    const toggleSelection = (category, value, allowMulti) => {
        setSelections(prev => {
            const currentList = prev[category] || [];

            // If Multi-Select is DISABLED for this category, replace the selection
            if (allowMulti === false) {
                return { ...prev, [category]: [value] };
            }

            // Standard Multi-Select Logic
            if (currentList.includes(value)) {
                return { ...prev, [category]: currentList.filter(item => item !== value) };
            } else {
                return { ...prev, [category]: [...currentList, value] };
            }
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                        <Camera size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Cinematographer</h3>
                        <p className="text-sm text-slate-400">{data.spec_summary}</p>
                    </div>
                </div>

                {/* AGENT BLURB */}
                {data.agent_commentary && (
                    <div className="bg-amber-950/30 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-amber-400 shrink-0 mt-1" size={20} />
                        <p className="text-amber-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* OPTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {data.spec_options.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{cat.category}</span>
                            {!cat.allow_multiselect && <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">Single Select</span>}
                        </div>

                        <h4 className="text-white font-medium text-lg mb-4">{cat.question}</h4>

                        {/* SCROLLABLE LIST AREA */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {cat.options.map((opt) => {
                                const isSelected = (selections[cat.category] || []).includes(opt.label);
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => toggleSelection(cat.category, opt.label, cat.allow_multiselect)}
                                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between group ${isSelected
                                                ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* CHECKBOX / RADIO ICON */}
                                            {cat.allow_multiselect !== false ? (
                                                isSelected
                                                    ? <CheckSquare size={20} className="text-white" />
                                                    : <Square size={20} className="text-slate-600 group-hover:text-amber-400" />
                                            ) : (
                                                // Radio circle for single select
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-white bg-amber-500' : 'border-slate-600'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            )}

                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{opt.label}</span>
                                                <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                                                    {opt.description}
                                                </span>
                                            </div>
                                        </div>

                                        {opt.recommended && (
                                            <Star size={12} className={isSelected ? "text-amber-200" : "text-purple-400"} /> // Use purple for suggested contrast? Or just amber.
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
                    className="px-8 py-3 bg-white hover:bg-amber-50 text-slate-900 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default CinematographerDeck;
