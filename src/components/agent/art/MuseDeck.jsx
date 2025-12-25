import React, { useState } from 'react';
import { Lightbulb, CheckCircle, Circle, FastForward, ArrowRight, Star } from 'lucide-react';

const MuseDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    if (!data || !data.strategy_options) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-4 animate-in slide-in-from-bottom-2">

            {/* COMPACT HEADER */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-t-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">The Muse</h3>
                        <p className="text-xs text-slate-400 mt-1">{data.strategy_summary}</p>
                    </div>
                </div>
                {/* Agent Commentary - Now Subtle & Inline */}
                {data.agent_commentary && (
                    <div className="text-xs text-purple-300/80 italic max-w-md text-right border-l-2 border-purple-500/20 pl-3 hidden md:block">
                        "{data.agent_commentary}"
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="bg-slate-950/50 border-x border-b border-purple-500/30 rounded-b-2xl p-4">

                {/* HORIZONTAL SCROLL CONTAINER */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                    {data.strategy_options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(option.label)}
                            className={`snap-start shrink-0 w-72 group relative p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${selectedOption === option.label
                                    ? 'bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-900/20'
                                    : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800'
                                }`}
                        >
                            {option.recommended && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                    <Star size={8} fill="currentColor" /> Pick
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 transition-colors ${selectedOption === option.label ? 'text-purple-400' : 'text-slate-600 group-hover:text-purple-500/50'}`}>
                                    {selectedOption === option.label ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${selectedOption === option.label ? 'text-white' : 'text-slate-200'}`}>
                                        {option.label}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ACTION BAR (Pinned to bottom of card area) */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                    <button
                        onClick={() => onConfirm(null)}
                        className="text-slate-500 hover:text-white text-xs font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <FastForward size={14} />
                        Auto-Pilot
                    </button>

                    <button
                        disabled={!selectedOption}
                        onClick={() => onConfirm(selectedOption)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${selectedOption
                            ? 'bg-white hover:bg-purple-50 text-purple-950 shadow-purple-900/20 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Continue <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MuseDeck;
