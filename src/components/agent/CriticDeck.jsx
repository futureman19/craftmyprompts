import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

const CriticDeck = ({ data, onConfirm }) => {
    // Default selections (optional: could default to first option)
    const [selections, setSelections] = useState({});

    if (!data || !data.risk_options) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* Header Card */}
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Critical Audit</h3>
                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                            {data.critique_summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                {data.risk_options.map((risk, idx) => {
                    const isSelected = (val) => selections[risk.category] === val;

                    return (
                        <div key={idx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {risk.category}
                                </span>
                                {risk.severity === 'high' && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold">HIGH RISK</span>}
                                {risk.severity === 'medium' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-bold">MEDIUM</span>}
                            </div>

                            <h4 className="text-slate-200 font-medium text-sm mb-4">
                                {risk.question}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                                {risk.options.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect(risk.category, opt)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isSelected(opt)
                                                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/20'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                            }`}
                                    >
                                        {isSelected(opt) && <CheckCircle size={12} />}
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Bar */}
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
