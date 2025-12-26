import React from 'react';
import { Wand2, Copy } from 'lucide-react';

const GalleryDeck = ({ finalData }) => {
    return (
        <div className="w-full p-6 animate-in zoom-in-95">
            <div className="bg-slate-900 border border-fuchsia-500/30 rounded-xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                    <Wand2 size={40} className="text-fuchsia-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Masterpiece Ready</h2>
                <p className="text-slate-400 text-sm mb-6">Your prompt has been optimized for generation.</p>

                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 text-left mb-6">
                    <code className="text-xs text-fuchsia-200 font-mono break-words">
                        {finalData?.final_prompt || "No prompt generated."}
                    </code>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigator.clipboard.writeText(finalData?.final_prompt || "")}
                        className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                        <Copy size={16} /> Copy Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};
export default GalleryDeck;
