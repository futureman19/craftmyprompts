import React from 'react';
import { Layers } from 'lucide-react';

const CompositionDeck = ({ structure }) => {
    // Handles specific 'structure' prop, or generic 'data' prop if passed that way
    const data = structure || {};

    if (!data) return <div className="p-10 text-slate-500">Waiting for composition...</div>;

    return (
        <div className="w-full p-6 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                    <div className="p-2 bg-fuchsia-500/10 rounded text-fuchsia-400"><Layers size={20} /></div>
                    <h3 className="text-lg font-bold text-white">Image Composition</h3>
                </div>
                <div className="space-y-4 font-mono text-sm text-slate-300">
                    {/* Render prompt segments */}
                    {Object.entries(data).map(([key, value]) => {
                        // Skip system keys
                        if (key === 'blueprint_summary' || key === 'technical') return null;

                        return (
                            <div key={key} className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase text-slate-500 font-bold">{key}</span>
                                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-fuchsia-200">
                                    {value}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default CompositionDeck;
