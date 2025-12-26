import React from 'react';
import { Lightbulb, CheckCircle, Map, Palette, Ghost, Info } from 'lucide-react';

// Now accepts 'selections' and 'onSelect' from Parent
const MuseDeck = ({ data, selections, onSelect }) => {

    if (!data) return null;

    // --- CONFIGURATION ---
    const decks = [
        {
            id: 'genre',
            title: 'Genre',
            icon: <Ghost size={14} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500',
            dataKey: 'genre_options'
        },
        {
            id: 'environment',
            title: 'Env',
            icon: <Map size={14} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500',
            dataKey: 'environment_options'
        },
        {
            id: 'style',
            title: 'Style',
            icon: <Palette size={14} />,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500',
            dataKey: 'style_options'
        }
    ];

    // --- HELPERS ---
    const getLabel = (opt) => {
        if (!opt) return "Unknown";
        if (typeof opt === 'string') return opt;
        return opt.label || opt.title || "Untitled";
    };

    const getDescription = (opt) => {
        if (!opt || typeof opt === 'string') return "";
        return opt.description || opt.details || "";
    };

    return (
        <div className="w-full flex flex-col h-full overflow-hidden animate-in fade-in">

            {/* 1. THE "SUB-NAV" HEADER */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/10 rounded text-purple-400">
                            <Lightbulb size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">The Muse</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800 hidden md:block" />
                    <p className="text-xs text-slate-500 truncate max-w-xs md:max-w-md hidden sm:block">
                        {data.muse_summary || "Curating concepts..."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {data.agent_commentary && (
                        <div className="group relative">
                            <Info size={16} className="text-slate-600 hover:text-purple-400 cursor-help" />
                            <div className="absolute right-0 top-6 w-72 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                "{data.agent_commentary}"
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. THE MEGA-DECK GRID */}
            <div className="flex-1 overflow-hidden bg-slate-950 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                    {decks.map((deck) => {
                        const options = data[deck.dataKey] || [];
                        const currentSelection = selections[deck.id];

                        return (
                            <div key={deck.id} className="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                                <div className={`px-3 py-2 border-b border-slate-800 flex items-center justify-between ${deck.bg}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={deck.color}>{deck.icon}</div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${deck.color}`}>
                                            {deck.title}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                        {options.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                    {options.map((option, idx) => {
                                        const label = getLabel(option);
                                        const desc = getDescription(option);
                                        const isSelected = currentSelection === label;
                                        const isRec = option.recommended === true;

                                        return (
                                            <button
                                                key={idx}
                                                // Trigger Parent Function
                                                onClick={() => onSelect(deck.id, label)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all relative group ${isSelected
                                                        ? `bg-slate-800 ${deck.border} shadow-lg`
                                                        : 'bg-slate-950/80 border-slate-800/50 hover:bg-slate-900 hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {label}
                                                    </span>
                                                    {isSelected && <CheckCircle size={14} className={deck.color} />}
                                                </div>

                                                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                                                    {desc}
                                                </p>

                                                {isRec && !isSelected && (
                                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default MuseDeck;
