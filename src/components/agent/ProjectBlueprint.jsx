import React, { useState } from 'react';
import { Folder, FileCode, Layers, Code, Loader } from 'lucide-react';

const ProjectBlueprint = ({ structure = [] }) => {
    const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'raw'

    // Safety check for data
    const hasStructure = structure && Array.isArray(structure) && structure.length > 0;

    if (!hasStructure) {
        return (
            <div className="p-6 bg-slate-900 border border-dashed border-slate-700 rounded-xl text-center">
                <div className="flex justify-center mb-2">
                    <Loader size={24} className="animate-spin text-cyan-500" />
                </div>
                <p className="text-slate-400 text-xs font-mono">
                    Architecting system... (If this persists, the Architect returned invalid JSON)
                </p>
                {/* Debug View */}
                <details className="mt-4 text-[10px] text-slate-600 text-left">
                    <summary className="cursor-pointer hover:text-slate-400">Raw Data Debug</summary>
                    <pre className="mt-2 p-2 bg-black rounded overflow-auto max-h-32">
                        {JSON.stringify(structure, null, 2)}
                    </pre>
                </details>
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

            {/* Footer Removed - Actions are now handled by CodingFeed */}
        </div>
    );
};

export default ProjectBlueprint;
