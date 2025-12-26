import React from 'react';
import { Palette, Sparkles, User, CheckCircle } from 'lucide-react';

const MuseDeck = ({ data, selections, onSelect }) => {
    if (!data) return null;

    const decks = [
        { id: 'concept', title: 'Concept', icon: <Sparkles size={14} />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500', dataKey: 'concept_options' },
        { id: 'subject', title: 'Subject', icon: <User size={14} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500', dataKey: 'subject_options' },
        { id: 'mood', title: 'Mood', icon: <Palette size={14} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500', dataKey: 'mood_options' }
    ];

    return (
        <div className="w-full h-full p-4 flex flex-col animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0 mb-4 rounded-xl border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-fuchsia-500/10 rounded text-fuchsia-400">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">The Muse</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {decks.map((deck) => {
                    const options = data[deck.dataKey] || [];
                    return (
                        <div key={deck.id} className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
                            <div className={`px-3 py-2 border-b border-slate-800 flex items-center justify-between ${deck.bg}`}>
                                <div className="flex items-center gap-2">
                                    <div className={deck.color}>{deck.icon}</div>
                                    <span className={`text-[10px] font-bold uppercase ${deck.color}`}>{deck.title}</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                {options.map((opt, idx) => {
                                    const label = opt.label || opt;
                                    const isSelected = selections[deck.id] === label;
                                    return (
                                        <button key={idx} onClick={() => onSelect(deck.id, label)} className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? `bg-slate-800 ${deck.border}` : 'bg-slate-950/80 border-slate-800/50 hover:bg-slate-900'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{label}</span>
                                                {isSelected && <CheckCircle size={14} className={deck.color} />}
                                            </div>
                                            {opt.description && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{opt.description}</p>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default MuseDeck;
