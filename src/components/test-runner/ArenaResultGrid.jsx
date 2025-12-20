import React from 'react';
import { Trophy, Zap, Code, Shield, Feather, FileText, User, BarChart, Hash, Search, Swords } from 'lucide-react';

const ROLE_ICONS = {
    'visionary': Zap, 'architect': Code, 'critic': Shield,
    'muse': Feather, 'editor': FileText, 'publisher': User,
    'analyst': BarChart, 'quant': Hash, 'skeptic': Search,
    'default': User
};

export default function ArenaResultGrid({ results }) {
    // Mock winner logic: In a real battle, we'd have a vote button
    // For now, highlight the first result if there are multiple
    const winnerIndex = results.length > 1 ? 0 : -1;

    return (
        <div className="w-full h-full flex flex-col">
            {/* VS Badge Header */}
            <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 font-bold tracking-widest text-xs uppercase">
                <Swords className="w-4 h-4" /> Arena Mode Active
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {results.map((result, index) => {
                    const Icon = ROLE_ICONS[result.id] || ROLE_ICONS[result.role?.toLowerCase()] || ROLE_ICONS.default;
                    const isWinner = index === winnerIndex;

                    return (
                        <div
                            key={index}
                            className={`
                relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-300 h-full bg-white dark:bg-slate-900
                ${isWinner
                                    ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 z-10 scale-[1.005]'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }
              `}
                        >
                            {/* Winner Badge */}
                            {isWinner && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-20">
                                    <Trophy className="w-3 h-3" /> LEADER
                                </div>
                            )}

                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isWinner ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
                                        {result.role || result.name || 'Contender'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {result.model || 'AI Model'}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5 overflow-y-auto font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {result.content || (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 italic gap-2 opacity-50">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-ping" />
                                        Waiting for output...
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
