import React, { useState, useEffect } from 'react';
import { Camera, Sun, User, Layers, Ratio, Monitor, Image, ScanLine } from 'lucide-react';

// Pure Control Panel - No Buttons
const ArtBlueprint = ({ data, onSettingsChange }) => {

    if (!data || !data.layers) return null;

    // Local State
    const [aspectRatio, setAspectRatio] = useState(data.technical?.aspect_ratio || "1:1");
    const [personGeneration, setPersonGeneration] = useState(data.technical?.person_generation || "allow_adult");

    // Broadcast changes up to ArtFeed immediately
    useEffect(() => {
        if (onSettingsChange) {
            onSettingsChange({ aspectRatio, personGeneration });
        }
    }, [aspectRatio, personGeneration, onSettingsChange]);

    const getLayerIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('background')) return <Image size={14} />;
        if (lower.includes('subject')) return <User size={14} />;
        if (lower.includes('light')) return <Sun size={14} />;
        return <Layers size={14} />;
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-sm animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/10 rounded text-orange-400">
                        <Camera size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">The Cinematographer</span>
                </div>
                <p className="text-xs text-slate-500 truncate hidden sm:block">
                    {data.blueprint_summary || "Finalizing composition..."}
                </p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* LEFT: LAYER STACK (Scrollable) */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar border-r border-slate-800 bg-slate-950/30">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Visual Stack</h4>
                    <div className="space-y-2">
                        {data.layers.map((layer, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-orange-500/30 transition-all">
                                <div className="mt-0.5 text-slate-500">
                                    {getLayerIcon(layer.layer)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-orange-400 uppercase">{layer.layer}</span>
                                        <span className="text-xs font-bold text-white">{layer.element}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        {layer.details}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: CONTROLS (Fixed Width) */}
                <div className="w-full md:w-64 bg-slate-950 p-4 flex flex-col gap-5 border-l border-slate-800">

                    {/* Aspect Ratio */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Ratio size={12} /> Aspect Ratio
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['1:1', '16:9', '9:16', '4:3'].map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`text-xs py-2 rounded border transition-all ${aspectRatio === ratio
                                            ? 'bg-orange-600 text-white border-orange-500'
                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                                        }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Filter */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <User size={12} /> Subject Filter
                        </h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setPersonGeneration('allow_adult')}
                                className={`w-full text-left px-3 py-2 rounded border text-xs flex items-center justify-between ${personGeneration === 'allow_adult'
                                        ? 'bg-slate-800 border-orange-500 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}
                            >
                                <span>Allow People</span>
                                {personGeneration === 'allow_adult' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                            </button>
                            <button
                                onClick={() => setPersonGeneration('dont_allow')}
                                className={`w-full text-left px-3 py-2 rounded border text-xs flex items-center justify-between ${personGeneration === 'dont_allow'
                                        ? 'bg-slate-800 border-orange-500 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}
                            >
                                <span>No People (Scenery)</span>
                                {personGeneration === 'dont_allow' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                            </button>
                        </div>
                    </div>

                    {/* Read-Only Specs */}
                    <div className="mt-auto">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Monitor size={12} /> Tech Specs
                        </h4>
                        <div className="space-y-1">
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                                <span className="text-[10px] text-slate-500">Lens</span>
                                <span className="text-[10px] font-mono text-orange-400">{data.camera?.lens || "Auto"}</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                                <span className="text-[10px] text-slate-500">Lighting</span>
                                <span className="text-[10px] font-mono text-slate-300 truncate max-w-[100px]">{data.camera?.lighting || "Auto"}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ArtBlueprint;
