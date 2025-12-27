import React from 'react';
import { Sparkles, Zap, CheckCircle } from 'lucide-react';

const MaverickDeck = ({ data, selections, onSelect }) => {
    if (!data || !data.wildcards) return null;

    // Maverick uses an array for selections, unlike Muse/Cinema
    const selectedItems = selections.maverick || [];

    const toggleSelection = (card) => {
        const isSelected = selectedItems.find(i => i.label === card.label);
        let newSelection;
        if (isSelected) {
            newSelection = selectedItems.filter(i => i.label !== card.label);
        } else {
            newSelection = [...selectedItems, card];
        }
        // Pass updated array back to ArtFeed
        onSelect('maverick', newSelection);
    };

    return (
        <div className="w-full h-full p-4 flex flex-col animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0 mb-4 rounded-xl border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-500/10 rounded text-violet-400">
                            <Zap size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">The Maverick</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 italic">
                    {data.suggestion_summary || "Select chaos elements..."}
                </div>
            </div>

            {/* Grid Layout (Matching MuseDeck) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {data.wildcards.map((card, idx) => {
                    const isSelected = !!selectedItems.find(i => i.label === card.label);

                    return (
                        <button
                            key={idx}
                            onClick={() => toggleSelection(card)}
                            className={`flex flex-col h-full rounded-xl border transition-all text-left relative overflow-hidden group ${isSelected
                                    ? 'bg-slate-800 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                                }`}
                        >
                            <div className="p-4 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                                        {card.category}
                                    </span>
                                    {isSelected && <CheckCircle size={16} className="text-violet-500" />}
                                </div>

                                <h4 className={`text-sm font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                    {card.label}
                                </h4>

                                <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                                    {card.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MaverickDeck;
