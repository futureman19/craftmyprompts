import React, { useEffect } from 'react';
import { Settings, Monitor, Ratio, Cpu, CheckCircle, Ban } from 'lucide-react';
import { GALLERY_BRAIN } from '../../../../api/_agents/art/brains/gallery_brain'; // Import The Gallery's Brain

const TechDeck = ({ selections, onSelect }) => {
    // Map the brain data
    const MODEL_CONFIG = GALLERY_BRAIN.models;

    // 1. Initialize State
    const currentSpecs = selections.technical || {
        ratio: "16:9",
        modelId: MODEL_CONFIG[0].id, // Default to Midjourney
        quality: "Standard"
    };

    // 2. Find Active Model Config
    const activeModel = MODEL_CONFIG.find(m => m.id === currentSpecs.modelId) || MODEL_CONFIG[0];

    // 3. AUTO-CORRECTION LOGIC (The Safety Net)
    useEffect(() => {
        let hasChanges = false;
        let newSpecs = { ...currentSpecs };

        // Check Ratio Compatibility
        if (!activeModel.capabilities.ratios.includes(currentSpecs.ratio) && !activeModel.capabilities.flexible_ratios) {
            console.log(`[TechDeck] ${activeModel.label} does not support ${currentSpecs.ratio}. Snapping to 16:9.`);
            newSpecs.ratio = "16:9"; // Safe fallback
            hasChanges = true;
        }

        // Check Negative Prompt (Clear it if unsupported to avoid API errors)
        if (!activeModel.capabilities.negative_prompt && newSpecs.negative_prompt) {
            delete newSpecs.negative_prompt;
            hasChanges = true;
        }

        if (hasChanges) {
            onSelect('technical', newSpecs);
        }
    }, [activeModel.id]);

    const updateSpec = (key, val) => {
        onSelect('technical', { ...currentSpecs, [key]: val });
    };

    // UI Constants
    const allRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"];
    const allQualities = ["Standard", "HD", "Raw"];

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
                        <span className="text-fuchsia-400 font-bold">{activeModel.label}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. MODEL SELECTOR */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-fuchsia-400 font-bold text-sm uppercase">
                        <Cpu size={16} /> Generator
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        {MODEL_CONFIG.map(m => (
                            <button key={m.id} onClick={() => updateSpec('modelId', m.id)}
                                className={`py-3 px-4 rounded-lg text-xs font-bold border text-left transition-all flex justify-between items-center group ${currentSpecs.modelId === m.id
                                    ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-fuchsia-500 hover:bg-slate-800'
                                    }`}>
                                {m.label}
                                {currentSpecs.modelId === m.id && <CheckCircle size={14} className="text-fuchsia-500" />}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] text-slate-500 italic">
                            <span className="text-fuchsia-500">ℹ️</span> {activeModel.notes}
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
                            const isSupported = activeModel.capabilities.flexible_ratios || activeModel.capabilities.ratios.includes(r);
                            return (
                                <button
                                    key={r}
                                    onClick={() => isSupported && updateSpec('ratio', r)}
                                    disabled={!isSupported}
                                    className={`py-3 px-3 rounded-lg text-xs font-bold border transition-all relative ${currentSpecs.ratio === r
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                                        : isSupported
                                            ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-white'
                                            : 'bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                                        }`}>
                                    {r}
                                    {!isSupported && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-lg">
                                            <Ban size={12} className="text-red-900" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CAPABILITIES DISPLAY (Dynamic) */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-sm uppercase">
                        <Monitor size={16} /> Capabilities
                    </div>
                    <div className="grid grid-cols-1 gap-2 content-start">
                        {/* Negative Prompt Indicator */}
                        <div className={`py-3 px-3 rounded-lg text-xs font-bold border flex items-center justify-between ${activeModel.capabilities.negative_prompt ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-800 text-slate-600'
                            }`}>
                            <span>Negative Prompts</span>
                            {activeModel.capabilities.negative_prompt ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </div>

                        {/* Raw Mode Indicator */}
                        <div className={`py-3 px-3 rounded-lg text-xs font-bold border flex items-center justify-between ${activeModel.capabilities.raw_mode ? 'border-blue-500/30 text-blue-400' : 'border-slate-800 text-slate-600'
                            }`}>
                            <span>Raw Mode</span>
                            {activeModel.capabilities.raw_mode ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center flex justify-center">
                <div className="px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        {activeModel.provider} Validation Active
                    </p>
                </div>
            </div>
        </div>
    );
};
export default TechDeck;