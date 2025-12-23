import React, { useState } from 'react';
import { Camera, Palette, Sun, Frame, Copy, CheckCircle, Loader as LucideLoader } from 'lucide-react';
import { flattenPrompt } from '../utils/promptEngine.js';

// Helper component for data sections
const InfoCard = ({ icon: Icon, title, data, color }) => {
    if (!data) return null;

    // Helper to recursively render object/array data nicely
    const renderContent = (content) => {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.join(', ');
        if (typeof content === 'object' && content !== null) {
            return Object.entries(content).map(([key, val]) => (
                <div key={key} className="mb-1">
                    <span className="font-bold text-slate-400 capitalize">{key.replace('_', ' ')}: </span>
                    <span className="text-slate-200">{renderContent(val)}</span>
                </div>
            ));
        }
        return null;
    };

    return (
        <div className={`bg-slate-900/80 border border-${color}-500/30 p-4 rounded-xl hover:border-${color}-500/50 transition-colors backdrop-blur-sm`}>
            <div className={`flex items-center gap-2 mb-3 text-${color}-400`}>
                <Icon size={18} />
                <h3 className="font-bold uppercase text-sm tracking-wider">{title}</h3>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
                {renderContent(data)}
            </div>
        </div>
    );
};

const ArtView = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [artData, setArtData] = useState(null);
    const [copied, setCopied] = useState(false);

    const generatePrompt = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setArtData(null);
        setCopied(false);

        try {
            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    targetAgentId: 'art_director',
                })
            });

            if (!response.ok) throw new Error('Failed to fetch prompt');

            const data = await response.json();
            let parsedData = null;

            // Try to parse the JSON response
            try {
                parsedData = JSON.parse(data.swarm[0].content);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                alert("The Art Director produced an invalid format. Please try again.");
                setIsLoading(false);
                return;
            }

            setArtData(parsedData);

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while generating the prompt.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!artData) return;
        const flatPrompt = flattenPrompt(artData);
        navigator.clipboard.writeText(flatPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 pb-24">

            {/* HEADER */}
            <div className="text-center py-12 animate-in fade-in slide-in-from-top-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 mb-4">
                    AI Art Director
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                    Turn simple ideas into ultra-detailed, photorealistic prompt specifications.
                </p>
            </div>

            {/* INPUT SECTION */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-2 flex items-center shadow-lg mb-10 animate-in zoom-in-95">
                <textarea
                    placeholder="Describe your vision (e.g., 'A futuristic samurai in neon rain')"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none h-14 py-4 px-4"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), generatePrompt())}
                />
                <button
                    onClick={generatePrompt}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl px-6 h-14 font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                >
                    {isLoading ? <LucideLoader className="animate-spin" size={20} /> : <Palette size={20} />}
                    Generate
                </button>
            </div>

            {/* RESULTS DECK */}
            {artData && (
                <div className="animate-in slide-in-from-bottom-4 space-y-6">

                    {/* The Final Flattened Prompt */}
                    <div className="bg-black/40 border border-slate-800 rounded-xl p-4 relative group">
                        <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Final Prompt String (Ready for Midjourney)</div>
                        <code className="block text-fuchsia-300 text-sm break-words pr-12 font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                            {flattenPrompt(artData)}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors shadow-md"
                            title="Copy to Clipboard"
                        >
                            {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                    </div>

                    {/* The Specification Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard icon={Camera} title="Camera Specs" data={artData.meta} color="indigo" />
                        <InfoCard icon={Sun} title="Lighting Setup" data={artData.lighting} color="amber" />
                        <InfoCard icon={Frame} title="Perspective" data={artData.camera_perspective} color="cyan" />
                        <div className="md:col-span-2 lg:col-span-3">
                            <InfoCard icon={Palette} title="Subject & Scene Details" data={{ ...artData.subject, ...artData.scene }} color="fuchsia" />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ArtView;
