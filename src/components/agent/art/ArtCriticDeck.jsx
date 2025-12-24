import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Star, FastForward, MessageSquareQuote, ArrowRight } from 'lucide-react';

const ArtCriticDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    if (!data || !data.risk_options) return null;

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
                        <p className="text-sm text-slate-400">{data.critique_summary}</p>
                    </div>
                </div>

                {/* AGENT BLURB */}
                {data.agent_commentary && (
                    <div className="bg-rose-950/30 border border-rose-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-rose-400 shrink-0 mt-1" size={20} />
                        <p className="text-rose-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* RISK CARDS */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {data.risk_options.map((risk, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl">
                        <div className="flex justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase">{risk.category}</span>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${risk.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                    risk.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-slate-700 text-slate-300'
                                }`}>
                                {risk.severity} Risk
                            </span>
                        </div>

                        <h4 className="text-slate-200 font-medium text-lg mb-4">{risk.question}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {risk.options.map((opt) => {
                                const active = selections[risk.category] === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(risk.category, opt.label)}
                                        className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between h-full min-h-[80px] ${active
                                                ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-rose-500/50'
                                            }`}
                                    >
                                        <div className="flex justify-between w-full mb-1">
                                            <span className="text-xs font-bold">{opt.label}</span>
                                            {active && <CheckCircle size={14} />}
                                        </div>

                                        {opt.recommended && !active && <span className="text-[9px] text-rose-400">★ Suggested</span>}

                                        {/* Tooltip */}
                                        <div className="absolute opacity-0 hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-[10px] p-2 rounded z-10 pointer-events-none">
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
                    Decide for me (Auto-Fix)
                </button>

                <button
                    onClick={() => onConfirm(selections)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ArtCriticDeck;
