import React from 'react';
import { User, Code, AlertTriangle, Feather, FileText, BarChart, Hash, Search, Shield, Zap, Maximize2, Trophy } from 'lucide-react';

const ROLE_ICONS = {
    // Tech Squad
    'visionary': Zap,
    'architect': Code,
    'critic': Shield,
    // Creative Squad
    'muse': Feather,
    'editor': FileText,
    'publisher': User,
    // Data Squad
    'analyst': BarChart,
    'quant': Hash,
    'skeptic': Search,
    // Fallback
    'default': User
};

export default function SwarmResultGrid({ results = [], mode }) {
    // Determine Layout based on Mode
    const isArena = mode === 'arena';

    // Arena Mode: Strict 2 columns
    // Hivemind Mode: Responsive 1 -> 3 columns
    const gridClass = isArena
        ? "grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
        : "grid grid-cols-1 md:grid-cols-3 gap-6";

    return (
        <div className={`w-full ${isArena ? 'h-full' : ''}`}>
            <div className={gridClass}>
                {Array.isArray(results) && results.map((result, index) => {
                    // Dynamic Icon Lookup
                    const Icon = ROLE_ICONS[result.id] || ROLE_ICONS[result.role?.toLowerCase()] || ROLE_ICONS.default;

                    // Arena Mode: Winner Logic (Mock logic for now, can be expanded)
                    const isWinner = isArena && index === 0 && results.length > 1;

                    return (
                        <div
                            key={index}
                            className={`
                relative flex flex-col rounded-xl border-2 overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300
                ${isArena ? 'h-full' : 'min-h-[400px]'}
                ${isWinner
                                    ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 z-10 scale-[1.01]'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }
              `}
                        >
                            {/* Arena Winner Badge */}
                            {isWinner && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-20">
                                    <Trophy className="w-3 h-3" /> LEADER
                                </div>
                            )}

                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isWinner ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
                                        {result.role || result.name || 'Agent'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {result.model || 'AI Model'}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5 overflow-y-auto font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {result.content || (
                                    <span className="text-slate-400 italic flex items-center gap-2">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                                        Thinking...
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
