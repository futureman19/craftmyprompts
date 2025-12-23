import React, { useState } from 'react';
import { Palette, CheckCircle, Star, Shirt } from 'lucide-react';

const StylistDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    const getTitle = (mode) => {
        if (mode === 'text') return "Content Outline";
        if (mode === 'video') return "Production Board";
        if (mode === 'coding') return "File Architecture";
        return "Set & Wardrobe"; // Default (Art)
    };

    // The Stylist returns 'modules' as its main content array
    if (!data || !data.modules) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in">

            {/* Header */}
            <div className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400">
                        <Shirt size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{getTitle(data.mode || 'art')}</h3>
                        <p className="text-sm text-slate-400 mt-2">{data.blueprint_summary}</p>
                    </div>
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {data.modules.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
                        <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider mb-2">
                            {cat.category}
                        </div>
                        <h4 className="text-white font-medium text-lg mb-4">
                            {cat.question}
                        </h4>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {cat.options.map((opt, i) => {
                                const isString = typeof opt === 'string';
                                const label = isString ? opt : (opt.label || opt.name || "Option");
                                const description = isString ? "" : (opt.description || "");
                                const isRecommended = !isString && opt.recommended;

                                const isSelected = selections[cat.category] === label;

                                return (
                                    <div key={i} className="relative group">
                                        <button
                                            onClick={() => handleSelect(cat.category, label)}
                                            className={`w-full h-full p-3 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between min-h-[80px] ${isSelected
                                                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start w-full mb-1">
                                                {isSelected ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                                                {isRecommended && !isSelected && <Star size={12} className="text-fuchsia-300 fill-fuchsia-300/20" />}
                                            </div>
                                            <div className="font-bold text-xs">{label}</div>
                                        </button>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 text-white text-[10px] p-3 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl backdrop-blur-sm">
                                            <div className="font-bold mb-1 text-fuchsia-300">{label}</div>
                                            {description && <div className="leading-relaxed text-slate-300">{description}</div>}
                                            {isRecommended && (
                                                <div className="mt-2 text-fuchsia-300 font-bold flex items-center gap-1">
                                                    <Star size={8} /> Stylist Pick
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                    onClick={() => onConfirm(selections)}
                    disabled={Object.keys(selections).length < data.modules.length}
                    className="px-6 py-3 bg-white hover:bg-fuchsia-50 text-slate-900 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Finalize Set <CheckCircle size={16} />
                </button>
            </div>
        </div>
    );
};

export default StylistDeck;
