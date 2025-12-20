import React, { useState } from 'react';
import { Sparkles, Code, ShieldAlert, Bot, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SwarmResultGrid = ({ results }) => {
    const [isPoppedOut, setIsPoppedOut] = useState(false);

    // Helper to get role-specific styling
    const getRoleStyle = (role) => {
        if (role.toLowerCase().includes('visionary')) {
            return {
                border: 'border-fuchsia-400',
                bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/10',
                header: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
                icon: <Sparkles size={16} />
            };
        }
        if (role.toLowerCase().includes('architect')) {
            return {
                border: 'border-cyan-400',
                bg: 'bg-cyan-50 dark:bg-cyan-900/10',
                header: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
                icon: <Code size={16} />
            };
        }
        if (role.toLowerCase().includes('critic')) {
            return {
                border: 'border-rose-400',
                bg: 'bg-rose-50 dark:bg-rose-900/10',
                header: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
                icon: <ShieldAlert size={16} />
            };
        }
        if (role.toLowerCase().includes('executive')) {
            return {
                border: 'border-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                header: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                icon: <Bot size={16} />
            };
        }
        return {
            border: 'border-slate-200 dark:border-slate-700',
            bg: 'bg-white dark:bg-slate-800',
            header: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            icon: <Bot size={16} />
        };
    };

    const containerInfo = isPoppedOut
        ? "fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto"
        : "space-y-6 animate-in fade-in";

    return (
        <div className={containerInfo}>
            {/* Context Header for Popout */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2">
                    Hivemind Results
                    {isPoppedOut && <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[9px]">FULLSCREEN</span>}
                </h3>
                <button
                    onClick={() => setIsPoppedOut(!isPoppedOut)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                    {isPoppedOut ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            {/* THE BOARDROOM GRID */}
            <div className={`grid gap-4 ${isPoppedOut ? 'grid-cols-1 md:grid-cols-3 h-full' : 'grid-cols-1 md:grid-cols-3'}`}>
                {results.map((agent, index) => {
                    const style = getRoleStyle(agent.role);
                    return (
                        <div
                            key={index}
                            className={`rounded-xl border-2 ${style.border} ${style.bg} overflow-hidden shadow-sm flex flex-col ${isPoppedOut ? 'h-[80vh]' : 'h-[500px]'}`}
                        >
                            {/* Card Header */}
                            <div className={`p-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b ${style.border} ${style.header}`}>
                                {style.icon} {agent.role}
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                <div className="prose prose-xs dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50">
                                    <ReactMarkdown>{agent.text}</ReactMarkdown>
                                </div>
                            </div>

                            {/* Reasoning Trace Footer */}
                            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/30 p-2">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-emerald-500">⚡</span>
                                    <span className="truncate" title={agent.meta?.trace}>{agent.meta?.trace || 'Thinking...'}</span>
                                </div>
                                <div className="opacity-75 flex items-center gap-1">
                                    <span>🤖</span> {agent.meta?.model || 'AI Model'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SYNTHESIS PLACEHOLDER */}
            {!isPoppedOut && (
                <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Synthesis Module</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        The Boardroom has spoken. Activate the Synthesis Engine to merge these perspectives into a final unified prompt.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SwarmResultGrid;
