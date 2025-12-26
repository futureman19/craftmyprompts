import React from 'react';
import { Film, Clapperboard, Video, FileVideo, FastForward, ArrowRight, Check, Circle } from 'lucide-react';

const VideoManifest = ({ manifest, currentPhase, onConfirm, onAutoPilot, isReady }) => {

    const showControls = ['vision', 'specs'].includes(currentPhase);

    // Smart Renderer for Bullet Lists
    const renderValue = (val, type) => {
        if (!val) return null;
        if (typeof val === 'string') return <div className="text-xs font-medium text-white animate-in fade-in mt-1">{val}</div>;

        if (typeof val === 'object') {
            const listItems = [];
            if (type === 'vision') {
                if (val.genre) listItems.push({ label: 'Genre', val: val.genre });
                if (val.hook) listItems.push({ label: 'Hook', val: val.hook });
                if (val.setting) listItems.push({ label: 'Setting', val: val.setting });
            } else if (type === 'specs') {
                if (val.camera) listItems.push({ label: 'Camera', val: val.camera });
                if (val.lighting) listItems.push({ label: 'Lighting', val: val.lighting });
                if (val.motion) listItems.push({ label: 'Motion', val: val.motion });
            }

            return (
                <div className="space-y-1.5 mt-2 animate-in slide-in-from-left-2">
                    {listItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <Circle size={4} className="mt-1.5 fill-slate-500 text-slate-500 shrink-0" />
                            <div className="text-[10px] leading-tight">
                                <span className="text-slate-500">{item.label}</span>
                                <span className="text-slate-700 mx-1">-</span>
                                <span className="text-slate-300 font-medium">{item.val}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const steps = [
        { id: 'vision', label: 'Concept', icon: <Film size={14} />, value: manifest.vision },
        { id: 'specs', label: 'Direction', icon: <Clapperboard size={14} />, value: manifest.specs },
        { id: 'blueprint', label: 'Storyboard', icon: <Video size={14} />, value: manifest.blueprint },
        { id: 'final', label: 'Production', icon: <FileVideo size={14} />, value: manifest.final },
    ];

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col h-full animate-in slide-in-from-right-4 shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Production Manifest
                </h3>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, idx) => {
                    const isActive = currentPhase && currentPhase.includes(step.id);
                    const isDone = !!step.value && step.value !== 'Pending...';
                    const isPending = !isActive && !isDone;

                    return (
                        <div key={step.id} className={`relative flex gap-3 ${isPending ? 'opacity-40' : 'opacity-100'} transition-opacity`}>
                            {/* Connecting Line */}
                            {idx !== steps.length - 1 && (
                                <div className={`absolute left-[11px] top-6 bottom-[-24px] w-px ${isDone ? 'bg-purple-900' : 'bg-slate-800'}`} />
                            )}

                            {/* Status Icon */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 
                                ${isActive ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                                    isDone ? 'bg-purple-900/20 text-purple-400 border-purple-500/50' :
                                        'bg-slate-900 text-slate-600 border-slate-800'}`}>
                                {isDone && !isActive ? <Check size={12} /> : step.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold uppercase tracking-wide block mb-0.5 ${isActive ? 'text-purple-400' : isDone ? 'text-purple-300' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                                {step.value ? renderValue(step.value, step.id) : <div className="text-[10px] text-slate-600 italic mt-1">{isActive ? 'Awaiting selection...' : 'Pending...'}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Controls */}
            {showControls && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-3">
                    <button onClick={onAutoPilot} className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                        <FastForward size={14} /> Auto-Pilot
                    </button>
                    <button onClick={onConfirm} disabled={!isReady} className={`w-full py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${isReady ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                        Continue <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoManifest;
