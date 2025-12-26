import React from 'react';
import { Target, Cpu, Layers, Code2, FastForward, ArrowRight, Check, ShieldCheck, Zap, Circle, Bug } from 'lucide-react';

const CodingManifest = ({
    manifest,
    currentPhase,
    onConfirm,
    onAutoPilot,
    isReady,
    onAudit,
    onBuild
}) => {

    const isSetupPhase = ['vision', 'vision_options', 'specs', 'spec_options'].includes(currentPhase);
    const isBlueprintPhase = ['blueprint', 'critique'].includes(currentPhase);

    // Render Logic for the "Detail List"
    const renderValue = (val, type) => {
        if (!val) return null;

        // SKIP STATE
        if (val === 'Skipped') {
            return <div className="text-[10px] text-slate-500 italic mt-1">Skipped by User</div>;
        }

        // PENDING STATE
        if (val === 'Pending...') {
            return <div className="text-[10px] text-slate-600 italic mt-1">Pending...</div>;
        }

        // SIMPLE STRING (e.g. "Architecture Locked")
        if (typeof val === 'string') {
            return <div className="text-xs font-medium text-white animate-in fade-in mt-1">{val}</div>;
        }

        // OBJECT (Deck Selections)
        if (typeof val === 'object') {
            const listItems = [];

            if (type === 'vision') {
                if (val.archetype) listItems.push({ label: 'Archetype', val: val.archetype });
                if (val.features) listItems.push({ label: 'Core Value', val: val.features });
                if (val.ux) listItems.push({ label: 'UX / Vibe', val: val.ux });
            }
            else if (type === 'specs') {
                if (val.frontend) listItems.push({ label: 'Frontend', val: val.frontend });
                if (val.backend) listItems.push({ label: 'Backend', val: val.backend });
                if (val.ui) listItems.push({ label: 'UI Lib', val: val.ui });
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
        { id: 'vision', label: 'Strategy', icon: <Target size={14} />, value: manifest.strategy },
        { id: 'specs', label: 'Stack', icon: <Cpu size={14} />, value: manifest.stack },
        { id: 'blueprint', label: 'Blueprint', icon: <Layers size={14} />, value: manifest.blueprint },
        { id: 'critic', label: 'Critic', icon: <Bug size={14} />, value: manifest.critic }, // NEW STEP
        { id: 'final', label: 'Build', icon: <Code2 size={14} />, value: manifest.final },
    ];

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col h-full animate-in slide-in-from-right-4 shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Engineering Manifest
                </h3>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, idx) => {
                    const isActive = currentPhase && currentPhase.includes(step.id);
                    const isDone = !!step.value && step.value !== 'Pending...';
                    const isSkipped = step.value === 'Skipped';
                    const isPending = !isActive && !isDone;

                    return (
                        <div key={step.id} className={`relative flex gap-3 ${isPending ? 'opacity-40' : 'opacity-100'} transition-opacity duration-500`}>
                            {/* Connecting Line */}
                            {idx !== steps.length - 1 && (
                                <div className={`absolute left-[11px] top-6 bottom-[-24px] w-px transition-colors duration-500 ${isDone ? 'bg-emerald-900' : 'bg-slate-800'}`} />
                            )}

                            {/* Status Icon */}
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all duration-300
                                ${isActive ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-110' :
                                    isSkipped ? 'bg-slate-800 text-slate-500 border-slate-700' :
                                        isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' :
                                            'bg-slate-900 text-slate-600 border-slate-800'}
                            `}>
                                {isDone && !isActive && !isSkipped ? <Check size={12} /> : step.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold uppercase tracking-wide block mb-0.5 ${isActive ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>

                                {step.value ? (
                                    renderValue(step.value, step.id)
                                ) : (
                                    <div className="text-[10px] text-slate-600 italic mt-1">
                                        {isActive ? 'Awaiting selection...' : 'Pending...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER CONTROLS */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-3">

                {/* 1. SETUP PHASE */}
                {isSetupPhase && (
                    <>
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
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            Continue <ArrowRight size={14} />
                        </button>
                    </>
                )}

                {/* 2. BLUEPRINT PHASE */}
                {isBlueprintPhase && (
                    <>
                        <button
                            onClick={onAudit}
                            className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <ShieldCheck size={14} /> Run Critic Audit
                        </button>

                        <button
                            onClick={onBuild}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95"
                        >
                            <Zap size={14} className="fill-white" /> Build Project
                        </button>
                    </>
                )}
            </div>

            <div className="p-2 border-t border-slate-800 text-[9px] text-slate-700 font-mono text-center">
                Hivemind Coding Engine v2.4
            </div>
        </div>
    );
};

export default CodingManifest;
