import React, { useState } from 'react';
import { Lightbulb, CheckCircle, FastForward, ArrowRight, Star, Map, Palette, Ghost, Info } from 'lucide-react';

const MuseDeck = ({ data, onConfirm }) => {
    // 1. Initialize State for 3 separate choices
    const [selections, setSelections] = useState({
        genre: null,
        environment: null,
        style: null
    });

    // Safety Check
    if (!data) return null;

    // --- CONFIGURATION ---
    const decks = [
        {
            id: 'genre',
            title: 'Genre', // Shortened title
            icon: <Ghost size={14} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500',
            dataKey: 'genre_options'
        },
        {
            id: 'environment',
            title: 'Environment',
            icon: <Map size={14} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500',
            dataKey: 'environment_options'
        },
        {
            id: 'style',
            title: 'Style', // Shortened title
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

    const handleSelect = (deckId, value) => {
        setSelections(prev => ({ ...prev, [deckId]: value }));
    };

    const isReady = selections.genre && selections.environment && selections.style;

    const handleAutoPilot = () => {
        const autoSelections = {};
        decks.forEach(deck => {
            const options = data[deck.dataKey] || [];
            if (options.length > 0) {
                const random = options[Math.floor(Math.random() * options.length)];
                autoSelections[deck.id] = getLabel(random);
            }
        });
        onConfirm(autoSelections);
    };

    return (
        <div className="w-full flex flex-col h-full overflow-hidden animate-in fade-in">

            {/* 1. ULTRA-SLIM HEADER */}
            <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between shrink-0 h-12">

                {/* Left: Identity */}
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-md text-purple-400">
                        <Lightbulb size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">The Muse</span>
                </div>

                {/* Center: Summary (Truncated) */}
                <div className="flex-1 px-4 text-center hidden md:block">
                    <p className="text-xs text-slate-500 truncate max-w-md mx-auto">
                        {data.muse_summary || "Select your concepts below."}
                    </p>
                </div>

                {/* Right: Info & Stats */}
                <div className="flex items-center gap-3">
                    {data.agent_commentary && (
                        <div className="group relative">
                            <Info size={16} className="text-slate-600 hover:text-purple-400 cursor-help" />
                            {/* Tooltip for Commentary */}
                            <div className="absolute right-0 top-6 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                "{data.agent_commentary}"
                            </div>
                        </div>
                    )}
                    <div className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
                        {Object.values(selections).filter(Boolean).length}/3
                    </div>
                </div>
            </div>

            {/* 2. THE MEGA-DECK GRID (Flex-1 fills remaining space) */}
            <div className="flex-1 overflow-hidden p-2 bg-slate-950/30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">

                    {decks.map((deck) => {
                        const options = data[deck.dataKey] || [];
                        const currentSelection = selections[deck.id];

                        return (
                            <div key={deck.id} className="flex flex-col h-full bg-slate-900/40 rounded-lg border border-slate-800 overflow-hidden">
                                {/* Deck Header */}
                                <div className={`px-3 py-2 border-b border-slate-800 flex items-center justify-between ${deck.bg}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={deck.color}>{deck.icon}</div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${deck.color}`}>
                                            {deck.title}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono opacity-70">
                                        {options.length}
                                    </span>
                                </div>

                                {/* Deck Scroll Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                    {options.map((option, idx) => {
                                        const label = getLabel(option);
                                        const desc = getDescription(option);
                                        const isSelected = currentSelection === label;
                                        const isRec = option.recommended === true;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(deck.id, label)}
                                                className={`w-full text-left p-2.5 rounded border transition-all relative group ${isSelected
                                                        ? `bg-slate-800 ${deck.border} shadow-lg`
                                                        : 'bg-slate-950/80 border-slate-800/50 hover:bg-slate-900 hover:border-slate-700'
                                                    }`}
                                            >
                                                {/* Label + Check */}
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {label}
                                                    </span>
                                                    {isSelected && <CheckCircle size={12} className={deck.color} />}
                                                </div>

                                                {/* Description */}
                                                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                                                    {desc}
                                                </p>

                                                {/* Rec Dot */}
                                                {isRec && !isSelected && (
                                                    <div className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-500 transition-colors" />
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

            {/* 3. ACTION BAR (Slim Footer) */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center shrink-0">
                <button
                    onClick={handleAutoPilot}
                    className="text-slate-500 hover:text-white text-[10px] font-bold uppercase flex items-center gap-1.5 px-3 py-2 rounded hover:bg-slate-800 transition-colors"
                >
                    <FastForward size={12} />
                    Auto-Pilot
                </button>

                <button
                    disabled={!isReady}
                    onClick={() => onConfirm(selections)}
                    className={`px-6 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${isReady
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20 cursor-pointer'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                >
                    Continue <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default MuseDeck;
