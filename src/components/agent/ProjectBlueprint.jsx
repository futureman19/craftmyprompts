import React, { useState } from 'react';
import { Folder, FileCode, Check, Edit, Layers, Code } from 'lucide-react';

const ProjectBlueprint = ({ structure = [], onApprove, onRefine }) => {
    const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'raw'

    // Safety check for data
    if (!structure || !Array.isArray(structure) || structure.length === 0) {
        return (
            <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 text-center text-xs">
                Waiting for architecture data...
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900 shadow-2xl animate-in fade-in">

            {/* Header */}
            <div className="bg-slate-950 p-3 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                        <Layers size={16} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Blueprint</h3>
                    </div>
                </div>
                {/* Toggle View Mode */}
                <button
                    onClick={() => setViewMode(viewMode === 'tree' ? 'raw' : 'tree')}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition-colors"
                >
                    {viewMode === 'tree' ? <Code size={12} /> : <Layers size={12} />}
                    {viewMode === 'tree' ? ' Raw JSON' : ' Visual Tree'}
                </button>
            </div>

            {/* Content Area - No fixed height, let it grow */}
            <div className="p-4 bg-slate-900/50">
                {viewMode === 'tree' ? (
                    <div className="space-y-2 font-mono text-sm">
                        {structure.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all group"
                            >
                                {/* Icon */}
                                {item.type === 'directory' ? (
                                    <Folder size={16} className="text-amber-400 shrink-0 fill-amber-400/20" />
                                ) : (
                                    <FileCode size={16} className="text-cyan-400 shrink-0" />
                                )}

                                {/* Path / Name - Forced High Contrast */}
                                <span className={`truncate ${item.type === 'directory' ? 'text-slate-200 font-bold' : 'text-slate-300'}`}>
                                    {item.path || item.name || "Unnamed Item"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Raw JSON View for Debugging */
                    <pre className="text-[10px] text-green-400 bg-black p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(structure, null, 2)}
                    </pre>
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-3 bg-slate-950 border-t border-cyan-500/20 flex gap-3">
                <button
                    onClick={onRefine}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Edit size={14} /> Refine
                </button>
                <button
                    onClick={onApprove}
                    className="flex-[2] py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <Check size={14} /> Approve & Build
                </button>
            </div>
        </div>
    );
};

export default ProjectBlueprint;
