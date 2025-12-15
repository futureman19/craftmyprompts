import React, { useState } from 'react';
import { Check, Copy, Github, Terminal } from 'lucide-react';

const CodeBlock = ({ rawContent, onShip }) => {
    const [copied, setCopied] = useState(false);
    
    // 1. Robust Regex: Handles optional whitespace after ```lang and before newline
    // Also handles the end of the block more gracefully
    const cleanCode = rawContent
        .replace(/^```[a-z]*\s*\n/i, '') // Remove opening fence
        .replace(/```\s*$/, '')          // Remove closing fence
        .trim();                         // Remove extra whitespace padding
    
    // Extract language label if present (e.g. ```javascript)
    const match = rawContent.match(/^```([a-z]+)/i);
    const language = match ? match[1] : 'Code';

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-slate-700 shadow-lg relative group transition-all hover:border-slate-600">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-slate-700 select-none">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-300 font-mono tracking-wide uppercase">{language}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* --- SHIP BUTTON --- */}
                    <button 
                        onClick={() => onShip(cleanCode)} 
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-medium text-slate-400 hover:text-white transition-all"
                        title="Push to GitHub"
                    >
                        <Github size={14} /> 
                        <span>Ship</span>
                    </button>
                    
                    <div className="w-px h-3 bg-slate-600/50 mx-1"></div>
                    
                    <button 
                        onClick={handleCopy} 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-medium transition-all ${copied ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div className="relative">
                <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-[#d4d4d4] bg-[#1e1e1e] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <code>{cleanCode}</code>
                </pre>
            </div>
        </div>
    );
};

export default CodeBlock;