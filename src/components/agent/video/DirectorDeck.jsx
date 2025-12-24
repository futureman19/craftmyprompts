import React, { useState } from 'react';
import { Camera, CheckCircle, Circle, FastForward, MessageSquareQuote, ArrowRight, Video, Aperture } from 'lucide-react';

const DirectorDeck = ({ data, onConfirm }) => {
    const [selections, setSelections] = useState({});

    // Safety Check
    if (!data || !data.modules) return null;

    const handleSelect = (category, value) => {
        setSelections(prev => ({ ...prev, [category]: value }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                        <Camera size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Director</h3>
                        <p className="text-sm text-slate-400">{data.blueprint_summary}</p>
                    </div>
                </div>

                {/* AGENT BLURB */}
                {data.agent_commentary && (
                    <div className="bg-pink-950/30 border border-pink-500/20 p-4 rounded-xl flex gap-3">
                        <MessageSquareQuote className="text-pink-400 shrink-0 mt-1" size={20} />
                        <p className="text-pink-200/80 text-sm italic leading-relaxed">
                            "{data.agent_commentary}"
                        </p>
                    </div>
                )}
            </div>

            {/* VISUAL MODULES */}
            <div className="space-y-6 mb-8">
                {data.modules.map((mod, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl">
                        <h4 className="text-slate-200 font-medium text-lg mb-4 flex items-center gap-2">
                            <Aperture size={18} className="text-pink-500" />
                            {mod.question || mod.category}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mod.options.map((opt) => {
                                const active = selections[mod.category] === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(mod.category, opt.label)}
                                        className={`p-4 rounded-lg text-left border transition-all flex flex-col justify-between min-h-[80px] group ${active
                                                ? 'bg-pink-600 border-pink-500 text-white shadow-lg'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-pink-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between w-full mb-1">
                                            <span className="text-sm font-bold">{opt.label}</span>
                                            {active ? <CheckCircle size={16} /> : <Circle size={16} className="opacity-20 group-hover:opacity-50" />}
                                        </div>

                                        <div className="text-xs opacity-70 mt-1">
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
            <div className="flex justify-end items-center pt-6 border-t border-slate-800">
                <button
                    onClick={() => onConfirm(selections)}
                    className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                    <Video size={18} /> Start Rendering
                </button>
            </div>
        </div>
    );
};

export default DirectorDeck;
