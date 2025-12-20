import React from 'react';
import { Folder, FileCode, Check, Edit, Layers } from 'lucide-react';

const ProjectBlueprint = ({ structure = [], onApprove, onRefine }) => {
    return (
        <div className="w-full max-w-md mx-auto my-4 rounded-xl overflow-hidden border-2 border-cyan-500/30 bg-slate-900/90 shadow-2xl shadow-cyan-900/20 backdrop-blur-sm animate-in zoom-in-95 duration-300">

            {/* Header */}
            <div className="bg-cyan-950/50 p-3 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                        <Layers size={16} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-cyan-100 uppercase tracking-wider">Project Manifest</h3>
                        <p className="text-[10px] text-cyan-400/80 font-mono">Architectural Blueprint</p>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-cyan-500 bg-cyan-950 px-2 py-1 rounded border border-cyan-500/20">
                    v1.0.0
                </div>
            </div>

            {/* Content (File Tree) */}
            <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-opacity-5">
                <div className="space-y-2 font-mono text-xs">
                    {structure.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 italic">
                            No structure definition found.
                        </div>
                    ) : (
                        structure.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-2 rounded hover:bg-cyan-500/5 transition-colors group"
                            >
                                {item.type === 'directory' ? (
                                    <Folder size={14} className="text-amber-400 shrink-0" />
                                ) : (
                                    <FileCode size={14} className="text-cyan-400 shrink-0" />
                                )}
                                <span className="text-slate-300 group-hover:text-cyan-200 transition-colors truncate">
                                    {item.path}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-3 bg-slate-950/50 border-t border-cyan-500/20 flex gap-3">
                <button
                    onClick={onRefine}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Edit size={14} /> Modify
                </button>
                <button
                    onClick={onApprove}
                    className="flex-[2] py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <Check size={14} /> Initialize & Build
                </button>
            </div>
        </div>
    );
};

export default ProjectBlueprint;
