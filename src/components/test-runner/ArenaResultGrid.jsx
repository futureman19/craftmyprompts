```
import React, { useState } from 'react';
import { Sparkles, Bot, Trophy, CheckCircle, ChevronRight, X, Swords } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ArenaResultGrid = ({ results, config, loading, renderContent }) => {
    // Local state for winner selection
    const [winner, setWinner] = useState(null);

    // Helper to get styling based on provider name
    const getProviderStyle = (provider) => {
        if (!provider) return { icon: <Bot size={16} />, color: 'slate', name: 'Unknown' };
        const p = provider.toLowerCase();
        if (p.includes('gemini')) return { icon: <Sparkles size={16} />, color: 'indigo', name: 'Gemini 2.5' };
        if (p.includes('openai') || p.includes('gpt')) return { icon: <Bot size={16} />, color: 'emerald', name: 'GPT-4o' };
        if (p.includes('claude') || p.includes('anthropic')) return { icon: <Bot size={16} />, color: 'orange', name: 'Claude 3.5' };
        if (p.includes('groq') || p.includes('llama')) return { icon: <Bot size={16} />, color: 'cyan', name: 'Llama 3' };
        return { icon: <Bot size={16} />, color: 'slate', name: provider };
    };

    const fighterAConfig = getProviderStyle(config?.fighterA || 'gemini');
    const fighterBConfig = getProviderStyle(config?.fighterB || 'openai');

    const contenders = [
        { 
            id: 'fighterA', 
            provider: config?.fighterA,
            name: fighterAConfig.name, 
            output: results?.fighterA || '', 
            icon: fighterAConfig.icon, 
            color: fighterAConfig.color 
        },
        { 
            id: 'fighterB', 
            provider: config?.fighterB,
            name: fighterBConfig.name, 
            output: results?.fighterB || '', 
            icon: fighterBConfig.icon, 
            color: fighterBConfig.color 
        }
    ];

    if (loading && !results) {
        return (
            <div className="grid grid-cols-2 gap-4 h-[600px] animate-pulse relative">
                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full p-2 border-4 border-slate-100 dark:border-slate-900 shadow-xl">
                    <span className="font-black text-xl italic text-slate-300 dark:text-slate-600">VS</span>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col items-center justify-center p-8 text-slate-400">
                    <div className="animate-spin mb-4 text-indigo-400"><Sparkles size={32} /></div>
                    <span className="text-xs font-bold uppercase tracking-wider">{fighterAConfig.name} Preparing...</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col items-center justify-center p-8 text-slate-400">
                    <div className="animate-spin mb-4 text-emerald-400"><Bot size={32} /></div>
                    <span className="text-xs font-bold uppercase tracking-wider">{fighterBConfig.name} Preparing...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-250px)] min-h-[500px] relative">
             {/* VS Badge */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-800 rounded-full w-12 h-12 flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow-2xl">
                <span className="font-black text-sm italic text-rose-500">VS</span>
            </div>

            {contenders.map((c) => {
                const isWinner = winner === c.id;
                const isLoser = winner && winner !== c.id;

                return (
                    <div 
                        key={c.id} 
                        className={`rounded - xl border - 2 flex flex - col transition - all duration - 300 overflow - hidden bg - white dark: bg - slate - 900 ${
    isWinner ? `border-${c.color}-500 shadow-xl ring-2 ring-${c.color}-400/20 z-10 scale-[1.01]` :
        (isLoser ? 'border-slate-100 dark:border-slate-800 opacity-60 grayscale-[50%]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600')
} `}
                    >
                        {/* HEADER */}
                        <div className={`p - 4 border - b flex items - center justify - between ${
    isWinner ? `bg-${c.color}-50 dark:bg-${c.color}-900/20 border-${c.color}-100 dark:border-${c.color}-900/50` : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
} `}>
                            <div className={`flex items - center gap - 2 font - bold text - sm ${ isWinner ? `text-${c.color}-700 dark:text-${c.color}-300` : 'text-slate-700 dark:text-slate-300' } `}>
                                <div className={`p - 1.5 rounded - lg ${ isWinner ? `bg-${c.color}-200 dark:bg-${c.color}-800` : 'bg-white dark:bg-slate-900 shadow-sm' } `}>
                                    {c.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="uppercase text-[10px] opacity-60 tracking-wider">Contender</span>
                                    <span>{c.name}</span>
                                </div>
                            </div>

                            {/* WINNER BADGE */}
                            {isWinner && (
                                <span className={`px - 2 py - 1 rounded - full text - [10px] font - bold uppercase tracking - widest bg - ${ c.color } -100 text - ${ c.color } -700 dark: bg - ${ c.color } -500 / 20 dark: text - ${ c.color } -300 flex items - center gap - 1`}>
                                    <Trophy size={12} /> Winner
                                </span>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                           {/* Use renderContent if available, otherwise fallback to basic markdown */}
                           {c.output?.text ? (
                               renderContent ? renderContent(c.output.text) : <div className="prose prose-sm dark:prose-invert"><ReactMarkdown>{c.output.text}</ReactMarkdown></div>
                           ) : (
                               c.output && (renderContent ? renderContent(c.output) : <div className="prose prose-sm dark:prose-invert"><ReactMarkdown>{c.output}</ReactMarkdown></div>)
                           )}
                           
                           {/* Loading State for individual stream */}
                           {loading && !c.output && (
                               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-50">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                               </div>
                           )}
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-center">
                            {!winner ? (
                                <button 
                                    onClick={() => setWinner(c.id)}
                                    className="text-xs font-bold text-slate-400 hover:text-emerald-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                >
                                    <CheckCircle size={14} /> Declare Winner
                                </button>
                            ) : (
                                isWinner ? (
                                    <button onClick={() => setWinner(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                        <X size={12} /> Reset
                                    </button>
                                ) : (
                                    <span className="text-[10px] font-mono text-slate-400 opacity-50">Runner Up</span>
                                )
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ArenaResultGrid;
