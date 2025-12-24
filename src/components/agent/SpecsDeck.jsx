import React, { useState } from 'react';
import { Cpu, CheckCircle, ArrowRight, Star, FastForward, MessageSquareQuote } from 'lucide-react';

const SpecsDeck = ({ data, onConfirm, mode }) => {
    const [selections, setSelections] = useState({});

    const getHeader = () => {
        if (mode === 'text') return "Tone & Voice Calibration";
        return "Technical Specifications";
    };

    if (!data || !data.spec_options) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                        <Cpu size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{getHeader()}</h3>
                        <p className="text-sm text-slate-400">{data.spec_summary}</p>
                    </div>
                </div>

                {/* AGENT BLURB */}
                {data.agent_commentary && (
                    <div className="bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-cyan-400 shrink-0 mt-1" size={20} />
                        <p className="text-cyan-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* OPTIONS GRID */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {data.spec_options.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl">
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                            {cat.category}
                        </div>
                        <h4 className="text-white font-medium text-lg mb-4">{cat.question}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {cat.options.map((opt) => {
                                const isSelected = selections[cat.category] === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(cat.category, opt.label)}
                                        className={`p-3 rounded-xl text-left border transition-all relative min-h-[80px] flex flex-col justify-between ${isSelected
                                                ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500/50'
                                            }`}
                                    >
                                        <div className="flex justify-between w-full mb-1">
                                            {isSelected ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                                            {opt.recommended && !isSelected && <Star size={12} className="text-cyan-300 fill-cyan-300/20" />}
                                        </div>
                                        <div className="font-bold text-xs leading-tight">{opt.label}</div>

                                        {/* Tooltip */}
                                        <div className="absolute opacity-0 hover:opacity-100 bottom-full left-0 w-full bg-black/90 text-white text-[10px] p-2 rounded mb-2 z-10 pointer-events-none transition-opacity">
                                            {opt.description}
                                        </div>
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
                    className="px-8 py-3 bg-white hover:bg-cyan-50 text-slate-900 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default SpecsDeck;
