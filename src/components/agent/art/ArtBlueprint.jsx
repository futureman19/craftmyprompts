import React, { useState, useEffect } from 'react';
import { Layers, Camera, Sun, User, Image, ScanLine, Ratio, Users, CheckCircle2, Monitor } from 'lucide-react';

const ArtBlueprint = ({ data, onSettingsChange }) => {

    if (!data || !data.layers) return null;

    // Local State
    const [aspectRatio, setAspectRatio] = useState(data.technical?.aspect_ratio || "1:1");
    const [personGeneration, setPersonGeneration] = useState(data.technical?.person_generation || "allow_adult");

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
        <div className="w-full rounded-2xl overflow-hidden border border-orange-500/30 bg-slate-900 shadow-2xl animate-in fade-in mt-4">

            {/* COMPACT HEADER */}
            <div className="bg-slate-950 p-3 border-b border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-500/10 rounded-lg">
                        <Camera size={16} className="text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scene Composition</h3>
                        <p className="text-[10px] text-slate-400">{data.blueprint_summary}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row h-full">

                {/* LEFT: LAYER STACK (Compact List) */}
                <div className="flex-1 p-3 bg-slate-900/50 border-r border-slate-800">
                    <div className="space-y-2">
                        {data.layers.map((layer, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 rounded-lg border border-slate-800 bg-slate-950/50 hover:border-orange-500/30 transition-all">
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

                {/* RIGHT: CONTROLS (Compact Sidebar) */}
                <div className="w-full md:w-64 bg-slate-950 p-4 flex flex-col gap-4">

                    {/* Aspect Ratio */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                            <Ratio size={12} /> Format
                        </h4>
                        <div className="relative">
                            <select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            >
                                <option value="1:1">1:1 Square</option>
                                <option value="16:9">16:9 Cinematic</option>
                                <option value="9:16">9:16 Portrait</option>
                                <option value="4:3">4:3 TV</option>
                            </select>
                            {data.technical?.aspect_ratio === aspectRatio && (
                                <div className="absolute right-2 top-2.5 text-emerald-500"><CheckCircle2 size={12} /></div>
                            )}
                        </div>
                    </div>

                    {/* Person Filters */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                            <Users size={12} /> Content Filter
                        </h4>
                        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                            <button onClick={() => setPersonGeneration('allow_adult')} className={`flex-1 text-[9px] font-bold py-1 rounded ${personGeneration === 'allow_adult' ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>Adults</button>
                            <button onClick={() => setPersonGeneration('dont_allow')} className={`flex-1 text-[9px] font-bold py-1 rounded ${personGeneration === 'dont_allow' ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>No People</button>
                        </div>
                    </div>

                    {/* Agent Specs */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                            <Monitor size={12} /> Agent Settings
                        </h4>
                        <div className="space-y-1">
                            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                                <span className="text-[9px] text-slate-500">Lens</span>
                                <span className="text-[9px] font-mono text-orange-400">{data.camera?.lens || "Auto"}</span>
                            </div>
                            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                                <span className="text-[9px] text-slate-500">Lighting</span>
                                <span className="text-[9px] font-mono text-slate-300 truncate max-w-[80px]">{data.camera?.lighting || "Auto"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtBlueprint;
