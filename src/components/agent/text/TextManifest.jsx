import React from 'react';
import { Compass, Mic, FileText, CheckCircle, FastForward, ArrowRight, Check } from 'lucide-react';

const TextManifest = ({ manifest, currentPhase, onConfirm, onAutoPilot, isReady }) => {

    // Logic to show controls during selection phases
    const showControls = ['strategy', 'strategy_options', 'editor', 'spec', 'spec_options', 'linguist'].includes(currentPhase);

    const steps = [
        { id: 'strategy', label: 'Strategy', icon: <Compass size={14} />, value: manifest.strategy },
        { id: 'spec', label: 'Voice', icon: <Mic size={14} />, value: manifest.voice },
        { id: 'blueprint', label: 'Outline', icon: <FileText size={14} />, value: manifest.blueprint ? 'Approved' : null },
        { id: 'final', label: 'Draft', icon: <CheckCircle size={14} />, value: manifest.final ? 'Complete' : null },
    ];

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col h-full animate-in slide-in-from-right-4 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Editorial Manifest
                </h3>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, idx) => {
                    const isActive = currentPhase && currentPhase.includes(step.id);
                    const isDone = !!step.value;
                    const isPending = !isActive && !isDone;

                    return (
                        <div key={step.id} className={`relative flex gap-3 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                            {idx !== steps.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-800" />
                            )}

                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 transition-colors
                                ${isActive ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                    isDone ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' :
                                        'bg-slate-900 text-slate-600 border-slate-800'}
                            `}>
                                {isDone && !isActive ? <Check size={12} /> : step.icon}
                            </div>

                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wide block mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                                {step.value ? (
                                    <div className="text-xs font-medium text-white animate-in fade-in line-clamp-2">
                                        {step.value}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-600 italic">
                                        {isActive ? 'Awaiting selection...' : 'Pending...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MISSION CONTROL FOOTER */}
            {showControls && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-3">
                    <button
                        onClick={onAutoPilot}
                        className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <FastForward size={14} /> Auto-Pilot
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={!isReady}
                        className={`w-full py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${isReady
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        Continue <ArrowRight size={14} />
                    </button>
                </div>
            )}

            <div className="p-2 border-t border-slate-800 text-[9px] text-slate-700 font-mono text-center">
                Hivemind Text Engine v2.1
            </div>
        </div>
    );
};

export default TextManifest;
