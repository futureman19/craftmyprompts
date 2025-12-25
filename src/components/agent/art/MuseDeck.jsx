import React, { useState } from 'react';
import { Lightbulb, CheckCircle, Circle, FastForward, ArrowRight, Star } from 'lucide-react';

const MuseDeck = ({ data, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // Safety Check
    if (!data || !data.strategy_options) return (
        <div className="p-4 text-center text-slate-500 text-xs italic">Waiting for Muse...</div>
    );

    // --- SMART ADAPTER ---
    const getLabel = (opt) => {
        if (!opt) return "Unknown Option";
        if (typeof opt === 'string') return opt;
        return opt.label || opt.title || opt.name || opt.concept || "Untitled";
    };

    const getDescription = (opt) => {
        if (!opt || typeof opt === 'string') return "";
        return opt.description || opt.details || opt.summary || "";
    };

    return (
        <div className="w-full mt-4 animate-in slide-in-from-bottom-2 flex flex-col">

            {/* 1. HEADER (Pinned) */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-t-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">The Muse</h3>
                        <p className="text-xs text-slate-400 mt-1">{data.strategy_summary || "Strategy Options"}</p>
                    </div>
                </div>
                {/* Inline Agent Commentary */}
                {data.agent_commentary && (
                    <div className="text-xs text-purple-300/80 italic max-w-md text-right border-l-2 border-purple-500/20 pl-3 hidden md:block">
                        "{data.agent_commentary}"
                    </div>
                )}
            </div>

            {/* 2. SCROLLABLE CARD AREA (The Window) */}
            <div className="bg-slate-950/50 border-x border-purple-500/30 p-4 max-h-[450px] overflow-y-auto custom-scrollbar">

                {/* Vertical Grid: 1 col mobile, 2 cols desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {data.strategy_options.map((option, idx) => {
                        const label = getLabel(option);
                        const desc = getDescription(option);
                        const isRecommended = option.recommended === true;

                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedOption(label)}
                                className={`group relative p-4 rounded-xl border text-left transition-all hover:scale-[1.01] flex flex-col ${selectedOption === label
                                        ? 'bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-900/20'
                                        : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800'
                                    }`}
                            >
                                {/* Recommended Badge */}
                                {isRecommended && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        <Star size={10} fill="currentColor" /> Pick
                                    </div>
                                )}

                                <div className="flex items-start gap-3 mb-2">
                                    <div className={`mt-0.5 transition-colors ${selectedOption === label ? 'text-purple-400' : 'text-slate-600 group-hover:text-purple-500/50'}`}>
                                        {selectedOption === label ? <CheckCircle size={20} /> : <Circle size={20} />}
                                    </div>
                                    <h4 className={`text-base font-bold ${selectedOption === label ? 'text-white' : 'text-slate-200'}`}>
                                        {label}
                                    </h4>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed pl-8">
                                    {desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. ACTION BAR (Pinned Bottom) */}
            <div className="bg-slate-950/50 border-x border-b border-purple-500/30 rounded-b-2xl p-4 pt-3 flex justify-between items-center shrink-0">
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
    );
};

export default MuseDeck;
