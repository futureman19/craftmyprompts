import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, FastForward, MessageSquareQuote, ArrowRight, AlertTriangle } from 'lucide-react';

const ArtCriticDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    // Safety Check: If data is missing or malformed
    if (!data || !data.risk_options) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center animate-in fade-in">
                <p className="text-slate-500 mb-4">No critical risks detected.</p>
                <button
                    onClick={() => onConfirm({})}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    Proceed to Blueprint
                </button>
            </div>
        );
    }

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Visual Audit</h3>
                        <p className="text-sm text-slate-400">{data.critique_summary || "Reviewing composition logic..."}</p>
                    </div>
                </div>
            </div>

            {/* RISK CARDS */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {data.risk_options.map((risk, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl">
                        <div className="flex justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">{risk.category}</span>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase flex items-center gap-1 ${risk.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                <AlertTriangle size={10} /> {risk.severity} Risk
                            </span>
                        </div>

                        <h4 className="text-slate-200 font-medium text-lg mb-4">{risk.question}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {risk.options.map((opt) => {
                                const active = selections[risk.category] === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(risk.category, opt.label)}
                                        className={`p-4 rounded-lg text-left border transition-all flex flex-col gap-2 ${active
                                                ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-rose-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm font-bold">{opt.label}</span>
                                            {active && <CheckCircle size={16} />}
                                        </div>
                                        <span className={`text-xs ${active ? 'text-rose-100' : 'text-slate-500'}`}>
                                            {opt.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ACTION BAR - FIXED: ENSURES onConfirm IS CALLED */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800 pb-10">
                <button
                    onClick={() => onConfirm({})} // Pass empty object = Skip/Ignore
                    className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <FastForward size={16} />
                    Skip Critic
                </button>

                <button
                    onClick={() => onConfirm(selections)} // Pass choices
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                    Apply Fixes & Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ArtCriticDeck;
