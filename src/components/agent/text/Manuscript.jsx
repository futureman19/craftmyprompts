import React from 'react';
import { FileText, List, Hash, Quote, AlignLeft, BookOpen, Feather } from 'lucide-react';

const Manuscript = ({ data }) => {

    // Safety check
    if (!data || !data.structure) {
        return (
            <div className="p-6 bg-slate-900 border border-dashed border-emerald-500/30 rounded-xl text-center">
                <p className="text-emerald-400/50 text-xs font-mono">
                    Outline in progress...
                </p>
            </div>
        );
    }

    // Helper to get icon based on section type
    const getSectionIcon = (type) => {
        const lower = (type || '').toLowerCase();
        if (lower.includes('header')) return <Hash size={16} />;
        if (lower.includes('list')) return <List size={16} />;
        if (lower.includes('quote') || lower.includes('blockquote')) return <Quote size={16} />;
        if (lower.includes('intro') || lower.includes('hook')) return <Feather size={16} />;
        return <AlignLeft size={16} />;
    };

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-2xl animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-950 p-4 border-b border-emerald-500/20 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <BookOpen size={20} className="text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Narrative Outline</h3>
                    <p className="text-xs text-slate-400">{data.blueprint_summary}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row">

                {/* LEFT: THE OUTLINE FLOW */}
                <div className="flex-1 p-4 bg-slate-900/50">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                        <FileText size={12} /> Structure & Flow
                    </h4>

                    <div className="space-y-0 relative">
                        {/* Vertical connecting line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-800" />

                        {data.structure.map((item, idx) => (
                            <div key={idx} className="relative group pl-2 pb-4 last:pb-0">

                                <div className="flex items-start gap-4">
                                    {/* Icon Bubble */}
                                    <div className="relative z-10 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 group-hover:border-emerald-500/50 flex items-center justify-center shrink-0 transition-colors">
                                        <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                                            {getSectionIcon(item.type)}
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div className="flex-1 p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900 hover:border-emerald-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                                                {item.section}
                                            </span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                                                {item.type}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-400 italic leading-relaxed">
                                            "{item.notes}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: AGENT NOTES */}
                <div className="w-full md:w-64 bg-slate-950 p-4 border-l border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">
                        Scribe's Commentary
                    </h4>
                    {data.agent_commentary && (
                        <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                            <p className="text-xs text-emerald-200/80 italic leading-relaxed">
                                {data.agent_commentary}
                            </p>
                        </div>
                    )}

                    <div className="mt-6">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                            Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                                <div className="text-[10px] text-slate-500">Sections</div>
                                <div className="text-lg font-bold text-white">{data.structure.length}</div>
                            </div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                                <div className="text-[10px] text-slate-500">Est. Words</div>
                                <div className="text-lg font-bold text-emerald-400">
                                    {data.structure.length * 150}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Manuscript;
