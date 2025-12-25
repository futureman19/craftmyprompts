import React, { useState } from 'react';
import { Palette, CheckCircle, Circle, FastForward, ArrowRight, Brush } from 'lucide-react';

const StylistDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    if (!data || !data.spec_options) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-4 animate-in slide-in-from-bottom-2">

            {/* COMPACT HEADER */}
            <div className="bg-slate-900 border border-pink-500/30 rounded-t-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">The Stylist</h3>
                        <p className="text-xs text-slate-400 mt-1">{data.spec_summary}</p>
                    </div>
                </div>
                {data.agent_commentary && (
                    <div className="text-xs text-pink-300/80 italic max-w-md text-right border-l-2 border-pink-500/20 pl-3 hidden md:block">
                        "{data.agent_commentary}"
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="bg-slate-950/50 border-x border-b border-pink-500/30 rounded-b-2xl p-4">

                {/* HORIZONTAL SCROLL CONTAINER */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
                    {data.spec_options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(option.label)}
                            className={`snap-start shrink-0 w-72 group relative p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${selectedOption === option.label
                                    ? 'bg-pink-900/40 border-pink-500 shadow-lg shadow-pink-900/20'
                                    : 'bg-slate-900 border-slate-800 hover:border-pink-500/50 hover:bg-slate-800'
                                }`}
                        >
                            <div className="absolute top-3 right-3 text-slate-700 group-hover:text-pink-500/30 transition-colors">
                                <Brush size={14} />
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 transition-colors ${selectedOption === option.label ? 'text-pink-400' : 'text-slate-600 group-hover:text-pink-500/50'}`}>
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

                {/* ACTION BAR */}
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
                            ? 'bg-white hover:bg-pink-50 text-pink-950 shadow-pink-900/20 cursor-pointer'
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

export default StylistDeck;
