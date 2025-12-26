import React from 'react';
import { Aperture, Sun, Camera, CheckCircle } from 'lucide-react';

const CinemaDeck = ({ data, selections, onSelect }) => {
    if (!data) return null;

    const decks = [
        { id: 'style', title: 'Art Style', icon: <Aperture size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500', dataKey: 'style_options' },
        { id: 'lighting', title: 'Lighting', icon: <Sun size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500', dataKey: 'lighting_options' },
        { id: 'camera', title: 'Camera', icon: <Camera size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500', dataKey: 'camera_options' }
    ];

    return (
        <div className="w-full h-full p-4 flex flex-col animate-in fade-in">
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0 mb-4 rounded-xl border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/10 rounded text-amber-400">
                            <Aperture size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">The Cinematographer</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {decks.map((deck) => (
                    <div key={deck.id} className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
                        <div className={`px-3 py-2 border-b border-slate-800 flex items-center justify-between ${deck.bg}`}>
                            <div className="flex items-center gap-2"><div className={deck.color}>{deck.icon}</div><span className={`text-[10px] font-bold uppercase ${deck.color}`}>{deck.title}</span></div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {(data[deck.dataKey] || []).map((opt, idx) => {
                                const label = opt.label || opt;
                                const isSelected = selections[deck.id] === label;
                                return (
                                    <button key={idx} onClick={() => onSelect(deck.id, label)} className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? `bg-slate-800 ${deck.border}` : 'bg-slate-950/80 border-slate-800/50 hover:bg-slate-900'}`}>
                                        <div className="flex items-center justify-between"><span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{label}</span>{isSelected && <CheckCircle size={14} className={deck.color} />}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default CinemaDeck;
