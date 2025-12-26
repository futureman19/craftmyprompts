import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';

const FileTreeItem = ({ name, content, depth = 0 }) => {
    return (
        <div
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-800/50 rounded text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-default"
            style={{ paddingLeft: `${depth * 1.5}rem` }}
        >
            <FileCode size={14} className="shrink-0" />
            <span className="truncate">{name}</span>
        </div>
    );
};

const FolderItem = ({ name, children, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 py-1.5 px-2 w-full hover:bg-slate-800/50 rounded text-sm font-bold text-slate-300 hover:text-white transition-colors"
                style={{ paddingLeft: `${depth * 1.5}rem` }}
            >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder size={14} className="shrink-0 text-blue-400" />
                <span className="truncate">{name}</span>
            </button>
            {isOpen && <div>{children}</div>}
        </div>
    );
};

// Recursive Tree Renderer
const renderTree = (items, depth = 0) => {
    if (!items) return null;
    return items.map((item, idx) => {
        if (item.type === 'folder') {
            return (
                <FolderItem key={idx} name={item.name} depth={depth}>
                    {renderTree(item.children, depth + 1)}
                </FolderItem>
            );
        }
        return <FileTreeItem key={idx} name={item.name} content={item.content} depth={depth} />;
    });
};

const ProjectBlueprint = ({ structure, onRefine, onApprove }) => {
    if (!structure) return null;

    // Helper to parse if the agent returned a string representation or actual JSON
    // (Adapting to potential API variations)
    let files = [];
    if (Array.isArray(structure)) {
        files = structure;
    } else if (structure.root) {
        files = [structure.root]; // Handle single root object
    }

    return (
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Architecture</h3>
                    <p className="text-xs text-slate-500">Proposed File Structure</p>
                </div>
                <div className="flex gap-2">
                    <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                        React
                    </div>
                    <div className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">
                        Node
                    </div>
                </div>
            </div>

            {/* Tree View */}
            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {files.length > 0 ? renderTree(files) : (
                    <p className="text-slate-500 italic text-sm">No file structure generated.</p>
                )}
            </div>

            {/* Action Footer (Only if buttons aren't handled by parent) */}
            <div className="bg-slate-950 p-3 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500">
                    Review the structure above. "Build Now" will generate the actual code content.
                </p>
            </div>
        </div>
    );
};

export default ProjectBlueprint;
