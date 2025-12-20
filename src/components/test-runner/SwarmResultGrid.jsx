import React from 'react';
import { Sparkles, Code, ShieldAlert, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SwarmResultGrid = ({ results }) => {
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
        return {
            border: 'border-slate-200 dark:border-slate-700',
            bg: 'bg-white dark:bg-slate-800',
            header: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            icon: <Bot size={16} />
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* THE BOARDROOM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((agent, index) => {
                    const style = getRoleStyle(agent.role);
                    return (
                        <div
                            key={index}
                            className={`rounded-xl border-2 ${style.border} ${style.bg} overflow-hidden shadow-sm flex flex-col h-[500px]`}
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
                        </div>
                    );
                })}
            </div>

            {/* SYNTHESIS PLACEHOLDER */}
            <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Synthesis Module</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The Boardroom has spoken. Activate the Synthesis Engine to merge these perspectives into a final unified prompt.
                </p>
                {/* <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    Ignite Synthesis
                </button> */}
            </div>
        </div>
    );
};

export default SwarmResultGrid;
