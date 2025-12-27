import React, { useState } from 'react';
import { Wand2, Copy, Download, Image as ImageIcon, Check } from 'lucide-react';

const GalleryDeck = ({ finalData }) => {
    const [copied, setCopied] = useState(false);

    // Support both the Agent JSON structure AND the injected image from the hook
    // Note: 'finalData' comes from ArtFeed's parser. 
    // We might need to pass the raw message to get the 'generatedImage' property if it's not in the JSON.
    // BUT, for now, let's assume ArtFeed passes the whole object or we handle the image prop separately.

    // Actually, ArtFeed's `parseAgentJson` only parses the text content.
    // We need to update ArtFeed to pass the *image* too. 
    // See note below code block.

    // Check if finalData itself has generatedImage (if passed from Feed correctly)
    // Or if it's part of the JSON structure (less likely given the hook structure)
    const { clean_prompt, midjourney_prompt, final_summary, generatedImage } = finalData || {};

    const handleCopy = () => {
        navigator.clipboard.writeText(midjourney_prompt || clean_prompt);
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
        <div className="w-full max-w-5xl mx-auto mt-6 animate-in zoom-in-95 duration-500">

            {/* The Masterpiece Container */}
            <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">

                {/* Image Display */}
                <div className="aspect-video w-full bg-slate-900 flex items-center justify-center relative">
                    {generatedImage ? (
                        <img
                            src={generatedImage}
                            alt="Generated Masterpiece"
                            className="w-full h-full object-cover animate-in fade-in duration-1000"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-600 animate-pulse">
                            <ImageIcon size={64} />
                            <p className="text-sm font-mono uppercase tracking-widest">Rendering...</p>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-end justify-between gap-8">

                        {/* Prompt Text */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-fuchsia-600 rounded-lg text-white shadow-lg shadow-fuchsia-900/50">
                                    <Wand2 size={20} />
                                </div>
                                <span className="text-fuchsia-300 font-bold tracking-wide text-sm uppercase">
                                    Final Output
                                </span>
                            </div>

                            <p className="text-white/90 text-lg font-medium leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                                {clean_prompt || "Processing final vision..."}
                            </p>

                            {midjourney_prompt && (
                                <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between gap-4 group/prompt cursor-pointer" onClick={handleCopy}>
                                    <code className="text-xs text-fuchsia-200/70 font-mono truncate flex-1">
                                        {midjourney_prompt}
                                    </code>
                                    <Copy size={14} className={copied ? "text-green-400" : "text-slate-400 group-hover/prompt:text-white"} />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 shrink-0">
                            {generatedImage && (
                                <button
                                    onClick={handleDownload}
                                    className="p-4 bg-white hover:bg-slate-200 text-slate-950 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                                    title="Download Image"
                                >
                                    <Download size={24} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryDeck;
