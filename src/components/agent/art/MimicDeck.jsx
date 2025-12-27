import React from 'react';
import { Brush, Video, Frame, CheckCircle } from 'lucide-react';

const MimicDeck = ({ data, selections, onSelect }) => {
    if (!data || !data.influences) return null;
    const selectedItems = selections.mimic || [];

    const toggleSelection = (card) => {
        const isSelected = selectedItems.find(i => i.label === card.label);
        let newSelection;
        if (isSelected) newSelection = selectedItems.filter(i => i.label !== card.label);
        else newSelection = [...selectedItems, card];
        onSelect('mimic', newSelection);
    };

    const getIcon = (cat) => {
        if (cat === 'Director') return <Video size={16} />;
        if (cat === 'Artist') return <Brush size={16} />;
        return <Frame size={16} />;
    };

    return (
        <div className="w-full h-full p-4 flex flex-col animate-in fade-in">
            <div className="bg-slate-950 border-b border-slate-800 p-3 mb-4 rounded-xl border flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded text-indigo-400"><Brush size={16} /></div>
                <span className="text-sm font-bold text-white">The Mimic</span>
                <span className="text-xs text-slate-500 ml-auto">{data.mimic_summary}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {data.influences.map((card, idx) => {
                    const isSelected = !!selectedItems.find(i => i.label === card.label);
                    return (
                        <button key={idx} onClick={() => toggleSelection(card)}
                            className={`flex flex-col h-full rounded-xl border transition-all text-left relative overflow-hidden group p-4 ${isSelected ? 'bg-slate-800 border-indigo-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                                    {getIcon(card.category)} {card.category}
                                </span>
                                {isSelected && <CheckCircle size={16} className="text-indigo-500" />}
                            </div>
                            <h4 className={`text-sm font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{card.label}</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{card.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default MimicDeck;
