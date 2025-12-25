import React, { useState } from 'react';
import { Lightbulb, Palette, Camera, Image, Check } from 'lucide-react';

const ArtManifest = ({ manifest, currentPhase }) => {
    // manifest = { strategy: "...", style: "...", technical: {...} }

    const steps = [
        { id: 'muse', label: 'Concept', icon: <Lightbulb size={14} />, value: manifest.strategy },
        { id: 'stylist', label: 'Style', icon: <Palette size={14} />, value: manifest.style },
        { id: 'cinematographer', label: 'Composition', icon: <Camera size={14} />, value: manifest.technical?.aspect_ratio },
        { id: 'gallery', label: 'Render', icon: <Image size={14} />, value: manifest.generated ? 'Complete' : null },
    ];

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col h-full animate-in slide-in-from-right-4">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Project Manifest
                </h3>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, idx) => {
                    const isActive = currentPhase === step.id;
                    const isDone = !!step.value;
                    const isPending = !isActive && !isDone;

                    return (
                        <div key={step.id} className={`relative flex gap-3 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                            {/* Connector Line */}
                            {idx !== steps.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-800" />
                            )}

                            {/* Icon Bubble */}
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 transition-colors
                                ${isActive ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                                    isDone ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' :
                                        'bg-slate-900 text-slate-600 border-slate-800'}
                            `}>
                                {isDone && !isActive ? <Check size={12} /> : step.icon}
                            </div>

                            {/* Text Content */}
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wide block mb-0.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>

                                {step.value ? (
                                    <div className="text-sm font-medium text-white animate-in fade-in">
                                        {step.value}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-600 italic">
                                        {isActive ? 'Awaiting selection...' : 'Pending...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Status */}
            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 font-mono text-center">
                Hivemind Art Engine v2.1
            </div>
        </div>
    );
};

export default ArtManifest;
