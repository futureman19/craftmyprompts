import React, { useState } from 'react';
import { Wand2, Copy, Download, Image as ImageIcon, Check, Terminal } from 'lucide-react';

const GalleryDeck = ({ finalData }) => {
    const [copied, setCopied] = useState(false);

    // Grab data. Note: 'generatedImage' comes from the hook injection.
    const { clean_prompt, midjourney_prompt, final_summary, generatedImage } = finalData || {};

    // Prefer the Midjourney prompt for copying (it has the cool flags), 
    // but fallback to clean_prompt if missing.
    const promptText = midjourney_prompt || clean_prompt || "Waiting for prompt...";

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `masterpiece-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 animate-in zoom-in-95 duration-500 pb-20">

            {/* 1. The Masterpiece (Image Only) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl mb-6 group">
                {generatedImage ? (
                    <div className="w-full flex items-center justify-center bg-black">
                        <img
                            src={generatedImage}
                            alt="Generated Masterpiece"
                            className="w-full h-auto max-h-[70vh] object-contain animate-in fade-in duration-1000"
                        />
                    </div>
                ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-4 text-slate-600 animate-pulse bg-slate-900/50">
                        <ImageIcon size={64} />
                        <p className="text-sm font-mono uppercase tracking-widest">Rendering Image...</p>
                    </div>
                )}
            </div>

            {/* 2. The Control Center (Text & Buttons Below) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                    {/* Prompt Text */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Terminal size={16} className="text-fuchsia-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Prompt</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 break-words leading-relaxed">
                            {promptText}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                        <button
                            onClick={handleCopy}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${copied
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? "Copied!" : "Copy Prompt"}
                        </button>

                        {generatedImage && (
                            <button
                                onClick={handleDownload}
                                className="flex-1 md:flex-none px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/20 transition-transform active:scale-95"
                            >
                                <Download size={18} />
                                Download
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryDeck;
