import React from 'react';
import { FileText, Edit3 } from 'lucide-react';

const Manuscript = ({ data }) => {
    if (!data) return null;

    const text = data.manuscript || data.content || "";

    return (
        <div className="w-full h-full flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-sm animate-in fade-in">

            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
                        <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">The Scribe</span>
                </div>
                <p className="text-xs text-slate-500 truncate hidden sm:block">
                    {data.blueprint_summary || "Drafting complete."}
                </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-100/5">
                <div className="max-w-3xl mx-auto bg-slate-100 text-slate-900 p-8 rounded shadow-xl min-h-[500px]">
                    <div className="font-serif whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {text}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Manuscript;
