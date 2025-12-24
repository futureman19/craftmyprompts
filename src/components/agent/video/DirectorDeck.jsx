import React, { useState } from 'react';
import { Video, CheckCircle, Circle, FastForward, MessageSquareQuote, ArrowRight, Aperture, Sun } from 'lucide-react';

const DirectorDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // Safety Check
    if (!data || !data.visual_options) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <Video size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Director</h3>
                        <p className="text-sm text-slate-400">{data.direction_summary}</p>
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

            {/* VISUAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {data.visual_options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedOption(option.label)}
                        className={`group relative p-5 rounded-xl border text-left transition-all hover:scale-[1.01] ${selectedOption === option.label
                                ? 'bg-amber-900/40 border-amber-500 shadow-lg shadow-amber-900/20'
                                : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Selection Radio */}
                            <div className={`mt-1 transition-colors ${selectedOption === option.label ? 'text-amber-400' : 'text-slate-600 group-hover:text-amber-500/50'}`}>
                                {selectedOption === option.label ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </div>

                            <div className="flex-1">
                                <h4 className={`text-lg font-bold mb-2 ${selectedOption === option.label ? 'text-white' : 'text-slate-200'}`}>
                                    {option.label}
                                </h4>

                                {/* Technical Specs Pills */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                                        <Aperture size={10} />
                                        {option.camera}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                                        <Sun size={10} />
                                        {option.lighting}
                                    </div>
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
                    Approve Specs <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default DirectorDeck;
