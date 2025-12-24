import React, { useState, useEffect } from 'react';
import { Layers, Camera, Sun, User, Image, Monitor, ScanLine, Aperture, Ratio, Users, CheckCircle2 } from 'lucide-react';

const ArtBlueprint = ({ data, onSettingsChange }) => {

    // Safety check
    if (!data || !data.layers) {
        return (
            <div className="p-6 bg-slate-900 border border-dashed border-orange-500/30 rounded-xl text-center">
                <p className="text-orange-400/50 text-xs font-mono">
                    Composing Scene...
                </p>
            </div>
        );
    }

    // --- LOCAL STATE FOR USER OVERRIDES ---
    // We initialize with the Agent's suggestion, but allow User to change it.
    const [aspectRatio, setAspectRatio] = useState(data.technical?.aspect_ratio || "1:1");
    const [personGeneration, setPersonGeneration] = useState(data.technical?.person_generation || "allow_adult");

    // Notify parent (ArtFeed) whenever settings change
    useEffect(() => {
        if (onSettingsChange) {
            onSettingsChange({
                aspectRatio,
                personGeneration
            });
        }
    }, [aspectRatio, personGeneration, onSettingsChange]);

    // Helper to get icon based on layer name
    const getLayerIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('background')) return <Image size={16} />;
        if (lower.includes('subject') || lower.includes('character')) return <User size={16} />;
        if (lower.includes('light') || lower.includes('sun')) return <Sun size={16} />;
        if (lower.includes('overlay') || lower.includes('vfx')) return <ScanLine size={16} />;
        return <Layers size={16} />;
    };

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-orange-500/30 bg-slate-900 shadow-2xl animate-in fade-in">

            {/* HEADER */}
            <div className="bg-slate-950 p-4 border-b border-orange-500/20 flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Camera size={20} className="text-orange-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scene Composition</h3>
                    <p className="text-xs text-slate-400">{data.blueprint_summary}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row">

                {/* LEFT: LAYER STACK (Read Only) */}
                <div className="flex-1 p-4 bg-slate-900/50 border-r border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Layers size={12} /> Visual Stack (Back to Front)
                    </h4>

                    <div className="space-y-2">
                        {data.layers.map((layer, idx) => (
                            <div key={idx} className="relative group">
                                {/* Connector Line */}
                                {idx !== data.layers.length - 1 && (
                                    <div className="absolute left-[19px] top-8 bottom-[-8px] w-px bg-slate-800 group-hover:bg-orange-500/30 transition-colors" />
                                )}

                                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-orange-500/50 transition-all">
                                    <div className="mt-1 text-slate-500 group-hover:text-orange-400 transition-colors">
                                        {getLayerIcon(layer.layer)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">
                                            {layer.layer}
                                        </div>
                                        <div className="text-sm font-bold text-white mb-1">
                                            {layer.element}
                                        </div>
                                        <div className="text-xs text-slate-400 leading-relaxed">
                                            {layer.details}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: TECHNICAL CONTROLS (Interactive) */}
                <div className="w-full md:w-72 bg-slate-950 p-5 flex flex-col gap-6">

                    {/* 1. Aspect Ratio Control */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Ratio size={12} /> Format & Ratio
                        </h4>
                        <div className="relative">
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none"
                            >
                                <option value="1:1">1:1 Square (Default)</option>
                                <option value="16:9">16:9 Cinematic Landscape</option>
                                <option value="9:16">9:16 Mobile Portrait</option>
                                <option value="4:3">4:3 Classic TV</option>
                                <option value="3:4">3:4 Classic Portrait</option>
                            </select>
                            {/* Checkmark to show Agent's choice match */}
                            {data.technical?.aspect_ratio === aspectRatio && (
                                <div className="absolute right-3 top-3 text-emerald-500" title="Matches Agent Recommendation">
                                    <CheckCircle2 size={14} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Person Generation Control */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Users size={12} /> Person Filters
                        </h4>
                        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setPersonGeneration('allow_adult')}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${personGeneration === 'allow_adult' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
                            >
                                Adults
                            </button>
                            <button
                                onClick={() => setPersonGeneration('dont_allow')}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${personGeneration === 'dont_allow' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
                            >
                                No People
                            </button>
                        </div>
                    </div>

                    {/* 3. Read-Only Camera Specs (From Agent) */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Monitor size={12} /> Agent Settings
                        </h4>
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500">Lens</span>
                                <span className="text-xs font-mono text-orange-400">{data.camera?.lens || "Auto"}</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500">Aperture</span>
                                <span className="text-xs font-mono text-slate-300">{data.camera?.aperture || "Auto"}</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500">Lighting</span>
                                <span className="text-xs font-mono text-slate-300 truncate max-w-[120px]">{data.camera?.lighting || "Auto"}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ArtBlueprint;
