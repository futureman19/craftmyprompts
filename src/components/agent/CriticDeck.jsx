import React, { useState } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

const CriticDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    // Safety check
    if (!data || !data.risk_options) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

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

            {/* The Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
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

                        <h4 className="text-slate-200 font-medium text-sm mb-4">{risk.question}</h4>

                        <div className="flex flex-wrap gap-2">
                            {risk.options.map((opt) => {
                                const active = selections[risk.category] === opt;
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect(risk.category, opt)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${active
                                                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/20'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                            }`}
                                    >
                                        {active && <CheckCircle size={12} />}
                                        {opt}
                                    </button>
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
