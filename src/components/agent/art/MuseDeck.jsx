import React, { useState } from 'react';
import { Lightbulb, CheckCircle, Circle, FastForward, ArrowRight, Star, Map, Palette, Ghost } from 'lucide-react';

const MuseDeck = ({ data, onConfirm }) => {
    // 1. Initialize State for 3 separate choices
    const [selections, setSelections] = useState({
        genre: null,
        environment: null,
        style: null
    });

    // Safety Check
    if (!data) return (
        <div className="p-4 text-center text-slate-500 text-xs italic">Waiting for Muse...</div>
    );

    // --- CONFIGURATION FOR THE 3 DECKS ---
    const decks = [
        {
            id: 'genre',
            title: 'Genre & Vibe',
            icon: <Ghost size={16} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500',
            dataKey: 'genre_options'
        },
        {
            id: 'environment',
            title: 'Environment',
            icon: <Map size={16} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500',
            dataKey: 'environment_options'
        },
        {
            id: 'style',
            title: 'Visual Style',
            icon: <Palette size={16} />,
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

    // Checks if all 3 decks have a selection
    const isReady = selections.genre && selections.environment && selections.style;

    const handleAutoPilot = () => {
        // Randomly pick one from each deck if available
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
        <div className="w-full mt-4 animate-in slide-in-from-bottom-2 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">

            {/* 1. HEADER (Pinned) */}
            <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">The Muse</h3>
                        <p className="text-xs text-slate-400 mt-1">{data.muse_summary || "World Building Options"}</p>
                    </div>
                </div>
                {/* Agent Commentary */}
                {data.agent_commentary && (
                    <div className="text-xs text-slate-500 italic max-w-md text-right border-l-2 border-slate-700 pl-3 hidden md:block">
                        "{data.agent_commentary}"
                    </div>
                )}
            </div>

            {/* 2. THE MEGA-DECK GRID (Scrollable Area) */}
            <div className="bg-slate-950/50 border-x border-slate-800 flex-1 overflow-hidden p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

                    {decks.map((deck) => {
                        const options = data[deck.dataKey] || [];
                        const currentSelection = selections[deck.id];

                        return (
                            <div key={deck.id} className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                                {/* Deck Header */}
                                <div className={`p-3 border-b border-slate-800 flex items-center gap-2 ${deck.bg}`}>
                                    <div className="text-sm">{deck.icon}</div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${deck.color}`}>
                                        {deck.title}
                                    </span>
                                    <span className="ml-auto text-[10px] text-slate-500 font-mono">
                                        {options.length} Cards
                                    </span>
                                </div>

                                {/* Deck Scroll Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                    {options.length === 0 && (
                                        <div className="text-center p-4 text-xs text-slate-600 italic">
                                            No cards dealt.
                                        </div>
                                    )}

                                    {options.map((option, idx) => {
                                        const label = getLabel(option);
                                        const desc = getDescription(option);
                                        const isSelected = currentSelection === label;
                                        const isRec = option.recommended === true;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(deck.id, label)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all relative group ${isSelected
                                                        ? `bg-slate-800 ${deck.border} shadow-lg`
                                                        : 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                                                    }`}
                                            >
                                                {/* Selection Indicator */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {label}
                                                    </span>
                                                    {isSelected && <CheckCircle size={14} className={deck.color} />}
                                                </div>

                                                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                                                    {desc}
                                                </p>

                                                {/* Recommended Dot */}
                                                {isRec && !isSelected && (
                                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-white transition-colors" title="Recommended" />
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

            {/* 3. ACTION BAR (Pinned Bottom) */}
            <div className="bg-slate-950/50 border-x border-b border-slate-800 rounded-b-2xl p-4 pt-3 flex justify-between items-center shrink-0">
                <button
                    onClick={handleAutoPilot}
                    className="text-slate-500 hover:text-white text-xs font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <FastForward size={14} />
                    Auto-Pilot (Random)
                </button>

                <div className="flex items-center gap-4">
                    {/* Progress Indicator */}
                    <div className="text-[10px] font-mono text-slate-500">
                        {Object.values(selections).filter(Boolean).length} / 3 Selected
                    </div>

                    <button
                        disabled={!isReady}
                        onClick={() => onConfirm(selections)}
                        className={`px-8 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${isReady
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Confirm Selection <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MuseDeck;
