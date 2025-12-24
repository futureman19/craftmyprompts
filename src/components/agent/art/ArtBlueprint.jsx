import React from 'react';
import { Layers, Camera, Sun, User, Image, Monitor, ScanLine, Aperture } from 'lucide-react';

const ArtBlueprint = ({ data }) => {

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

                {/* LEFT: LAYER STACK */}
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

                {/* RIGHT: CAMERA SPECS */}
                <div className="w-full md:w-64 bg-slate-950 p-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Monitor size={12} /> Technical Specs
                    </h4>

                    {data.camera && (
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="text-[10px] text-slate-500 mb-1">Lens</div>
                                <div className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                    <Aperture size={14} /> {data.camera.lens}
                                </div>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="text-[10px] text-slate-500 mb-1">Aperture</div>
                                <div className="text-sm font-bold text-white">
                                    {data.camera.aperture}
                                </div>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="text-[10px] text-slate-500 mb-1">Lighting</div>
                                <div className="text-xs font-medium text-slate-300">
                                    {data.camera.lighting}
                                </div>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="text-[10px] text-slate-500 mb-1">Aspect Ratio</div>
                                <div className="text-xs font-medium text-slate-300 border border-slate-700 px-2 py-1 rounded inline-block bg-black">
                                    {data.camera.aspect_ratio}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ArtBlueprint;
