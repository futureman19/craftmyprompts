import React, { useState } from 'react';
import { Clapperboard, CheckCircle, Circle, FastForward, MessageSquareQuote, ArrowRight, Film } from 'lucide-react';

const ProducerDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // Safety Check
    if (!data || !data.strategy_options) return null;

    // Find the full option object based on label
    const handleConfirm = () => {
        if (!selectedOption) return;
        const fullOption = data.strategy_options.find(opt => opt.label === selectedOption);
        onConfirm(fullOption);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Clapperboard size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Producer</h3>
                        <p className="text-sm text-slate-400">{data.strategy_summary}</p>
                    </div>
                </div>

                {/* AGENT BLURB */}
                {data.agent_commentary && (
                    <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-purple-400 shrink-0 mt-1" size={20} />
                        <p className="text-purple-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* CONCEPT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {data.strategy_options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(option.label)}
                        className={`group relative p-5 rounded-xl border text-left transition-all hover:scale-[1.01] ${selectedOption === option.label
                                ? 'bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-900/20'
                                : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800'
                            }`}
                    >
                        {/* Duration Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <Film size={10} fill="currentColor" /> {option.duration || '??s'}
                        </div>

                        <div className="flex items-start gap-4">
                            {/* Selection Radio */}
                            <div className={`mt-1 transition-colors ${selectedOption === option.label ? 'text-purple-400' : 'text-slate-600 group-hover:text-purple-500/50'}`}>
                                {selectedOption === option.label ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </div>

                            <div>
                                <h4 className={`text-lg font-bold mb-1 ${selectedOption === option.label ? 'text-white' : 'text-slate-200'}`}>
                                    {option.label}
                                </h4>
                                <p className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">{option.mood}</p>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-end items-center pt-6 border-t border-slate-800">
                <button
                    disabled={!selectedOption}
                    onClick={handleConfirm}
                    className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${selectedOption
                            ? 'bg-white hover:bg-purple-50 text-purple-950 shadow-purple-900/20 cursor-pointer'
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
