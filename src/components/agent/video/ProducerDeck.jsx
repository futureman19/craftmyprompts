import React, { useState } from 'react';
import { Clapperboard, CheckCircle, Circle, FastForward, MessageSquareQuote, ArrowRight, Star, Film } from 'lucide-react';

const ProducerDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // Safety Check
    if (!data || !data.pitch_options) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <Clapperboard size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Producer</h3>
                        <p className="text-sm text-slate-400">{data.pitch_summary}</p>
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

            {/* PITCH CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {data.pitch_options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(option.label)}
                        className={`group relative p-5 rounded-xl border text-left transition-all hover:scale-[1.01] ${selectedOption === option.label
                                ? 'bg-amber-900/40 border-amber-500 shadow-lg shadow-amber-900/20'
                                : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800'
                            }`}
                    >
                        {/* Recommendation Badge */}
                        {option.recommended && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                <Star size={10} fill="currentColor" /> Producer's Pick
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            {/* Selection Radio */}
                            <div className={`mt-1 transition-colors ${selectedOption === option.label ? 'text-amber-400' : 'text-slate-600 group-hover:text-amber-500/50'}`}>
                                {selectedOption === option.label ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className={`text-lg font-bold ${selectedOption === option.label ? 'text-white' : 'text-slate-200'}`}>
                                        {option.label}
                                    </h4>
                                    {option.genre && (
                                        <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                                            {option.genre}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button
                    onClick={() => onConfirm(null)}
                    className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <FastForward size={16} />
                    Decide for me (Auto-Pilot)
                </button>

                <button
                    disabled={!selectedOption}
                    onClick={() => onConfirm(selectedOption)}
                    className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${selectedOption
                            ? 'bg-white hover:bg-amber-50 text-amber-950 shadow-amber-900/20 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Greenlight Concept <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProducerDeck;
