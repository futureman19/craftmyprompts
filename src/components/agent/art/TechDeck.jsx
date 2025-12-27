import React from 'react';
import { Settings, Monitor, Ratio, Cpu, CheckCircle } from 'lucide-react';

const TechDeck = ({ selections, onSelect }) => {
    // Initialize with defaults if empty
    const currentSpecs = selections.technical || {
        ratio: "16:9",
        model: "Midjourney",
        quality: "4k"
    };

    const updateSpec = (key, val) => {
        onSelect('technical', { ...currentSpecs, [key]: val });
    };

    const ratios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
    const models = ["Midjourney v6", "DALL-E 3", "Google Imagen 4", "Stable Diffusion XL"];
    const qualities = ["Standard", "HD", "4k", "8k", "Raw"];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in">
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="p-3 bg-slate-800 text-white rounded-lg"><Settings size={24} /></div>
                <div>
                    <h3 className="text-lg font-bold text-white">Technical Specs</h3>
                    <p className="text-xs text-slate-400">Manual Parameter Configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Aspect Ratio */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm uppercase">
                        <Ratio size={16} /> Aspect Ratio
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {ratios.map(r => (
                            <button key={r} onClick={() => updateSpec('ratio', r)}
                                className={`py-2 px-3 rounded text-xs font-bold border transition-all ${currentSpecs.ratio === r ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500'
                                    }`}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Model */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 text-fuchsia-400 font-bold text-sm uppercase">
                        <Cpu size={16} /> Generator
                    </div>
                    <div className="flex flex-col gap-2">
                        {models.map(m => (
                            <button key={m} onClick={() => updateSpec('model', m)}
                                className={`py-3 px-4 rounded text-xs font-bold border text-left transition-all flex justify-between ${currentSpecs.model === m ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-fuchsia-500'
                                    }`}>
                                {m}
                                {currentSpecs.model === m && <CheckCircle size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quality */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-sm uppercase">
                        <Monitor size={16} /> Resolution
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {qualities.map(q => (
                            <button key={q} onClick={() => updateSpec('quality', q)}
                                className={`py-2 px-3 rounded text-xs font-bold border transition-all ${currentSpecs.quality === q ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500'
                                    }`}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    Configuration Ready • Proceed to Render
                </p>
            </div>
        </div>
    );
};
export default TechDeck;
