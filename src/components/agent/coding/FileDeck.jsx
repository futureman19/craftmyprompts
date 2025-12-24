import React, { useState } from 'react';
import { FileCode, X, Copy, Check, Maximize2 } from 'lucide-react';
import CodeBlock from '../../test-runner/CodeBlock.jsx'; // Reuse existing block

const FileDeck = ({ modules = [] }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    if (!modules || modules.length === 0) return null;

    return (
        <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 px-1">Generated Modules</h4>

            {/* THE GRID (Vibe View) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {modules.map((file, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedFile(file)}
                        className="flex flex-col items-start p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-xl transition-all group text-left"
                    >
                        <div className="flex items-center gap-2 w-full mb-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:text-indigo-300">
                                <FileCode size={16} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{file.language}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate w-full">
                            {file.path.split('/').pop()}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate w-full opacity-60">
                            {file.path}
                        </span>
                    </button>
                ))}
            </div>

            {/* THE PEEK MODAL (Code View) */}
            {selectedFile && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-[#252526]">
                            <div className="flex items-center gap-2">
                                <FileCode size={18} className="text-indigo-400" />
                                <span className="font-mono text-sm text-slate-200">{selectedFile.path}</span>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-0">
                            <CodeBlock rawContent={selectedFile.code} language={selectedFile.language} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileDeck;
