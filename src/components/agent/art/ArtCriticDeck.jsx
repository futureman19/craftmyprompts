import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const ArtCriticDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    if (!data) return null;

    const risks = data.risk_options || [];

    const handleSelect = (category, optionLabel) => {
        setSelections(prev => ({ ...prev, [category]: optionLabel }));
    };

    const isComplete = risks.every(r => selections[r.category]);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="mb-8 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Visual Audit</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg">
                    {data.critique_summary || "Reviewing potential visual conflicts..."}
                </p>
            </div>

            {/* Risk Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {risks.map((risk, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-red-500/20 rounded-xl overflow-hidden hover:border-red-500/40 transition-colors">
                        <div className="p-4 bg-red-950/20 border-b border-red-500/10 flex justify-between items-center">
                            <span className="font-mono text-xs text-red-400 uppercase tracking-wider">{risk.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${risk.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
                                {risk.severity?.toUpperCase()}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">{risk.question}</h3>
                            <div className="space-y-2">
                                {risk.options?.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleSelect(risk.category, opt.label)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group
                                            ${selections[risk.category] === opt.label
                                                ? 'bg-red-500/20 border-red-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium group-hover:text-red-300 transition-colors">{opt.label}</div>
                                            <div className="text-xs opacity-70 mt-1">{opt.description}</div>
                                        </div>
                                        {selections[risk.category] === opt.label && <CheckCircle className="w-4 h-4 text-red-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center pt-6 border-t border-slate-800/50">
                <button
                    onClick={() => onConfirm && onConfirm(selections)}
                    disabled={!isComplete && risks.length > 0}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105
                        ${isComplete || risks.length === 0
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }
                    `}
                >
                    <span>Proceed to Composition</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ArtCriticDeck;
