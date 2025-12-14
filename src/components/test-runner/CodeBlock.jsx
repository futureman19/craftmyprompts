import React, { useState } from 'react';
import { Check, Copy, Github } from 'lucide-react';

const CodeBlock = ({ rawContent, onShip }) => {
    const [copied, setCopied] = useState(false);
    
    // Clean up: remove the opening ```lang line and closing ```
    const cleanCode = rawContent.replace(/^```[a-z]*\n/i, '').replace(/```$/, '');
    
    // Extract language label if present (e.g. ```javascript)
    const match = rawContent.match(/^```([a-z]+)/i);
    const language = match ? match[1] : 'Code';

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-3 rounded-lg overflow-hidden bg-[#1e1e1e] border border-slate-700 shadow-sm relative group">
            <div className="flex justify-between items-center px-3 py-1.5 bg-[#252526] border-b border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{language}</span>
                <div className="flex items-center gap-3">
                    {/* --- SHIP BUTTON --- */}
                    <button 
                        onClick={() => onShip(cleanCode)} 
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                        title="Push to GitHub"
                    >
                        <Github size={12} /> Ship
                    </button>
                    <div className="w-px h-3 bg-slate-600"></div>
                    <button 
                        onClick={handleCopy} 
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                    >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-xs leading-5 text-[#d4d4d4]">
                <code>{cleanCode}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;