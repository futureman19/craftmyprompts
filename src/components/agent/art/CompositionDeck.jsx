import React from 'react';
import { Layers, User, Mountain, Sun, Camera, Palette, Brush, CheckCircle } from 'lucide-react';

const CompositionDeck = ({ structure }) => {
    // Handle data structure variations
    const data = structure || {};

    // Icon Mapping Helper
    const getIcon = (key) => {
        const k = key.toLowerCase();
        if (k.includes('subject')) return <User size={18} />;
        if (k.includes('environment')) return <Mountain size={18} />;
        if (k.includes('atmosphere') || k.includes('light')) return <Sun size={18} />;
        if (k.includes('camera')) return <Camera size={18} />;
        if (k.includes('color')) return <Palette size={18} />;
        if (k.includes('medium')) return <Brush size={18} />;
        return <Layers size={18} />;
    };

    // Filter out metadata keys
    const layers = Object.entries(data).filter(([key]) => key !== 'blueprint_summary' && key !== 'technical');

    if (layers.length === 0) return <div className="p-10 text-slate-500 text-center">Initializing Blueprint...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="p-3 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/50">
                    <Layers size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Composition Blueprint</h3>
                    <p className="text-xs text-blue-200">
                        {data.blueprint_summary || "Finalizing visual hierarchy..."}
                    </p>
                </div>
            </div>

            {/* The Visual Stack */}
            <div className="space-y-3 relative">
                {/* Connecting Line Effect */}
                <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-800 -z-10" />

                {layers.map(([key, value], idx) => (
                    <div
                        key={key}
                        className="flex items-start gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all group backdrop-blur-sm"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Icon Column */}
                        <div className="mt-1 relative">
                            <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500 transition-colors z-10 relative shadow-sm">
                                {getIcon(key)}
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 group-hover:text-blue-400 transition-colors">
                                {key.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-sm text-slate-200 leading-relaxed font-mono">
                                {value}
                            </p>
                        </div>

                        {/* Status Check */}
                        <div className="mt-2 text-emerald-500/20 group-hover:text-emerald-500 transition-colors">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    Blueprint Locked • Ready for Rendering
                </p>
            </div>
        </div>
    );
};

export default CompositionDeck;
