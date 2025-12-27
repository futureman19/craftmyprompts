import React, { useEffect } from 'react';
import { Settings, Monitor, Ratio, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

// --- THE BRAIN: MODEL CAPABILITIES ---
const MODEL_SPECS = {
    "Midjourney v6": {
        ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
        qualities: ["Standard", "HD", "Raw"],
        note: "Supports almost any aspect ratio via --ar parameter."
    },
    "DALL-E 3": {
        ratios: ["1:1", "16:9", "9:16"], // Strict
        qualities: ["Standard", "HD"],
        note: "Strictly standard sizes only."
    },
    "Google Imagen 4": {
        ratios: ["1:1", "16:9", "9:16", "4:3", "3:4"], // No 21:9
        qualities: ["Standard"],
        note: "Optimized for 16:9 and 1:1. No Ultrawide."
    },
    "Stable Diffusion XL": {
        ratios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
        qualities: ["Standard", "4k"],
        note: "Highly flexible open weights."
    }
};

const TechDeck = ({ selections, onSelect }) => {
    // 1. Current State (Defaults if empty)
    const currentSpecs = selections.technical || {
        ratio: "16:9",
        model: "Midjourney v6",
        quality: "Standard"
    };

    const currentModel = currentSpecs.model || "Midjourney v6";
    const specs = MODEL_SPECS[currentModel] || MODEL_SPECS["Midjourney v6"];

    // 2. AUTO-CORRECTION LOGIC
    // If the current ratio/quality is invalid for the NEW model, snap to a safe default.
    useEffect(() => {
        let hasChanges = false;
        let newSpecs = { ...currentSpecs };

        // Check Ratio
        if (!specs.ratios.includes(currentSpecs.ratio)) {
            newSpecs.ratio = "16:9"; // Safe default for everyone
            hasChanges = true;
        }

        // Check Quality
        if (!specs.qualities.includes(currentSpecs.quality)) {
            newSpecs.quality = specs.qualities[0];
            hasChanges = true;
        }

        if (hasChanges) {
            console.log(`[TechDeck] Auto-correcting for ${currentModel}...`);
            onSelect('technical', newSpecs);
        }
    }, [currentModel]); // Run specifically when model changes

    const updateSpec = (key, val) => {
        onSelect('technical', { ...currentSpecs, [key]: val });
    };

    // UI LISTS
    const allRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
    const allModels = Object.keys(MODEL_SPECS);
    const allQualities = ["Standard", "HD", "4k", "Raw"];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Settings size={64} /></div>
                <div className="p-3 bg-slate-800 text-white rounded-lg z-10"><Settings size={24} /></div>
                <div className="z-10">
                    <h3 className="text-lg font-bold text-white">Technical Specs</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Configuring for:</span>
                        <span className="text-fuchsia-400 font-bold">{currentModel}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. AI MODEL SELECTOR */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-fuchsia-400 font-bold text-sm uppercase">
                        <Cpu size={16} /> Generator
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        {allModels.map(m => (
                            <button key={m} onClick={() => updateSpec('model', m)}
                                className={`py-3 px-4 rounded-lg text-xs font-bold border text-left transition-all flex justify-between items-center group ${
                                    currentSpecs.model === m 
                                    ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-fuchsia-500 hover:bg-slate-800'
                                }`}>
                                {m}
                                {currentSpecs.model === m && <CheckCircle size={14} className="text-fuchsia-500" />}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] text-slate-500 italic flex items-start gap-2">
                             <span className="text-fuchsia-500">ℹ️</span> {specs.note}
                        </p>
                    </div>
                </div>

                {/* 2. ASPECT RATIO SELECTOR */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm uppercase">
                        <Ratio size={16} /> Aspect Ratio
                    </div>
                    <div className="grid grid-cols-2 gap-2 content-start">
                        {allRatios.map(r => {
                            const isSupported = specs.ratios.includes(r);
                            return (
                                <button 
                                    key={r} 
                                    onClick={() => isSupported && updateSpec('ratio', r)}
                                    disabled={!isSupported}
                                    className={`py-3 px-3 rounded-lg text-xs font-bold border transition-all relative ${
                                        currentSpecs.ratio === r 
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                                        : isSupported 
                                            ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-white'
                                            : 'bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                                    }`}>
                                    {r}
                                    {!isSupported && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-lg">
                                            <span className="text-[8px] uppercase tracking-wider text-red-900 font-bold">N/A</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. QUALITY / RES SELECTOR */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-sm uppercase">
                        <Monitor size={16} /> Resolution
                    </div>
                    <div className="grid grid-cols-1 gap-2 content-start">
                        {allQualities.map(q => {
                            const isSupported = specs.qualities.includes(q);
                            return (
                                <button 
                                    key={q} 
                                    onClick={() => isSupported && updateSpec('quality', q)}
                                    disabled={!isSupported}
                                    className={`py-3 px-3 rounded-lg text-xs font-bold border transition-all ${
                                        currentSpecs.quality === q 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : isSupported
                                            ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'
                                            : 'bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                                    }`}>
                                    {q}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center flex justify-center">
                 <div className="px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        {currentModel} Validation Active
                    </p>
                 </div>
            </div>
        </div>
    );
};
export default TechDeck;