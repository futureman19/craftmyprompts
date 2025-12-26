import React from 'react';
import { Cpu, Server, Palette, CheckCircle } from 'lucide-react';

const SpecsDeck = ({ data, selections, onSelect }) => {

    if (!data) return null;

    const decks = [
        {
            id: 'frontend',
            title: 'Frontend',
            icon: <Cpu size={14} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500',
            dataKey: 'frontend_options'
        },
        {
            id: 'backend',
            title: 'Backend',
            icon: <Server size={14} />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500',
            dataKey: 'backend_options'
        },
        {
            id: 'ui',
            title: 'UI Library',
            icon: <Palette size={14} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500',
            dataKey: 'ui_options'
        }
    ];

    const getLabel = (opt) => opt.label || opt.title || "Untitled";
    const getDescription = (opt) => opt.description || opt.details || "";

    return (
        <div className="w-full flex flex-col h-full overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
                            <Cpu size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">The Tech Lead</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800 hidden md:block" />
                    <p className="text-xs text-slate-500 truncate max-w-xs md:max-w-md hidden sm:block">
                        {data.spec_summary || "Selecting technology stack..."}
                    </p>
                </div>
            </div>

            {/* Deck Grid */}
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
                                    <span className="text-[9px] text-slate-500 font-mono">{options.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                    {options.map((option, idx) => {
                                        const label = getLabel(option);
                                        const desc = getDescription(option);
                                        const isSelected = currentSelection === label;
                                        return (
                                            <button
                                                key={idx}
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
                                                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{desc}</p>
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

export default SpecsDeck;
