import React, { useState, useMemo } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

const FileTreeItem = ({ name, depth = 0 }) => (
    <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-800/50 rounded text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-default"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
    >
        <FileCode size={14} className="shrink-0" />
        <span className="truncate">{name}</span>
    </div>
);

const FolderItem = ({ name, children, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 py-1.5 px-2 w-full hover:bg-slate-800/50 rounded text-sm font-bold text-slate-300 hover:text-white transition-colors text-left"
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
    if (!items || items.length === 0) return null;
    return items.map((item, idx) => {
        if (item.type === 'folder') {
            return (
                <FolderItem key={idx} name={item.name} depth={depth}>
                    {renderTree(item.children, depth + 1)}
                </FolderItem>
            );
        }
        return <FileTreeItem key={idx} name={item.name} depth={depth} />;
    });
};

const ProjectBlueprint = ({ structure }) => {

    // --- ROBUST PARSER ---
    // Converts Agent output (Paths or Objects) into a Renderable Tree
    const fileTree = useMemo(() => {
        if (!structure) return [];

        let paths = [];

        // Case A: Structure is already an array of file paths (Strings)
        if (Array.isArray(structure) && typeof structure[0] === 'string') {
            paths = structure;
        }
        // Case B: Structure is an array of objects
        else if (Array.isArray(structure)) {
            paths = structure.map(s => s.path || s.name || "unknown");
        }
        // Case C: Structure is a Nested Object (Old Architect style)
        else if (structure.root) {
            return [{ type: 'folder', name: 'root', children: [] }]; // Fallback
        }

        // BUILDER LOGIC: Convert Paths to Tree
        const root = [];

        paths.forEach(path => {
            const parts = path.split('/');
            let currentLevel = root;

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;

                if (isFile) {
                    currentLevel.push({ type: 'file', name: part });
                } else {
                    let folder = currentLevel.find(i => i.type === 'folder' && i.name === part);
                    if (!folder) {
                        folder = { type: 'folder', name: part, children: [] };
                        currentLevel.push(folder);
                    }
                    currentLevel = folder.children;
                }
            });
        });

        return root;
    }, [structure]);

    return (
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Architecture</h3>
                    <p className="text-xs text-slate-500">Proposed File Structure</p>
                </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {fileTree.length > 0 ? renderTree(fileTree) : (
                    <div className="text-slate-500 italic text-sm p-4 text-center">
                        Wait for the Architect...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectBlueprint;
