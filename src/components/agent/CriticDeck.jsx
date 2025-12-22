import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Star } from 'lucide-react';

const CriticDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    if (!data || !data.risk_options) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Critical Audit</h3>
                        <p className="text-sm text-slate-400 mt-2">{data.critique_summary}</p>
                    </div>
                </div>
            </div>

            {/* Risk Cards */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {data.risk_options.map((risk, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all">
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

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {risk.options.map((opt) => {
                                const active = selections[risk.category] === opt.label;
                                return (
                                    <div key={opt.label} className="relative group">
                                        <button
                                            onClick={() => handleSelect(risk.category, opt.label)}
                                            className={`w-full h-full p-3 rounded-lg text-left border transition-all flex items-start justify-between gap-2 ${active
                                                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/20'
                                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold mb-1">{opt.label}</span>
                                                {opt.recommended && !active && <span className="text-[9px] text-rose-400">★ Suggested</span>}
                                            </div>
                                            {active && <CheckCircle size={14} className="mt-1" />}
                                        </button>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-[10px] p-3 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl backdrop-blur-sm">
                                            <div className="font-bold mb-1 text-rose-300">{opt.label}</div>
                                            <div className="leading-relaxed text-slate-300">{opt.description}</div>
                                            {opt.recommended && (
                                                <div className="mt-2 text-rose-400 font-bold flex items-center gap-1">
                                                    <Star size={8} /> Best Practice
                                                </div>
                                            )}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                    onClick={() => onConfirm(selections)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <CheckCircle size={18} />
                    Approve & Build
                </button>
            </div>
        </div>
    );
};

export default CriticDeck;
