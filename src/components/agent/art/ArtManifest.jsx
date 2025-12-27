import React from 'react';
import { Palette, Aperture, Brush, Zap, Settings, Wand2, FastForward, ArrowRight, Check, Circle, Sparkles } from 'lucide-react';

const ArtManifest = ({ manifest, currentPhase, onConfirm, onAutoPilot, onRender, isReady }) => {

    // Updated Phases
    const isSetupPhase = ['vision', 'specs', 'mimic', 'maverick'].includes(currentPhase);
    const isTechPhase = currentPhase === 'technical';

    // FIX: Helper to render arrays (handles Multi-Select logic)
    const renderList = (items) => {
        // Normalize: if it's a string, make it an array. If array, use it.
        const array = Array.isArray(items) ? items : [items];

        return array.map((val, idx) => {
            // Handle object (like from Maverick/Mimic) or string (like from Vision)
            const label = val.label || val.category || "Option";
            const text = val.val || val.label || val;

            return (
                <div key={idx} className="flex items-start gap-2">
                    <Circle size={4} className="mt-1.5 fill-slate-500 text-slate-500 shrink-0" />
                    <div className="text-[10px] leading-tight text-slate-300">
                        {typeof val === 'object' ? (
                            <>
                                <span className="text-slate-500">{val.category || val.label}:</span> {val.description ? val.description.substring(0, 20) + "..." : val.label}
                            </>
                        ) : (
                            val
                        )}
                    </div>
                </div>
            );
        });
    };

    const renderValue = (val, type) => {
        if (!val) return null;

        // If it's a simple array (like from multi-select), render it directly
        if (Array.isArray(val) && type === 'maverick') {
            return <div className="space-y-1.5 mt-2">{renderList(val)}</div>;
        }

        if (typeof val === 'object') {
            const listItems = [];

            // Map Vision (handle arrays if user selected multiple)
            if (type === 'vision') {
                if (val.concept) listItems.push({ label: 'Concept', val: val.concept });
                if (val.subject) listItems.push({ label: 'Subject', val: val.subject });
                if (val.mood) listItems.push({ label: 'Mood', val: val.mood });
            }

            // Map Specs
            if (type === 'specs') {
                if (val.style) listItems.push({ label: 'Style', val: val.style });
                if (val.lighting) listItems.push({ label: 'Lighting', val: val.lighting });
            }

            // Map Mimic
            if (type === 'mimic' && Array.isArray(val)) {
                return <div className="space-y-1.5 mt-2">{renderList(val)}</div>;
            }

            // Map Technical
            if (type === 'technical') {
                if (val.model) listItems.push({ label: 'Model', val: val.model });
                if (val.ratio) listItems.push({ label: 'Ratio', val: val.ratio });
                if (val.quality) listItems.push({ label: 'Qual', val: val.quality });
            }

            return (
                <div className="space-y-1.5 mt-2 animate-in slide-in-from-left-2">
                    {listItems.map((item, idx) => {
                        // Handle if the value itself is an array (e.g. 3 concepts selected)
                        if (Array.isArray(item.val)) {
                            return (
                                <div key={idx}>
                                    <span className="text-[10px] text-slate-500 block mb-0.5">{item.label}:</span>
                                    {item.val.map((sub, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-1 ml-2 text-[10px] text-slate-300">
                                            <Circle size={3} className="fill-slate-600" /> {sub.label || sub}
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                        return (
                            <div key={idx} className="flex items-start gap-2">
                                <Circle size={4} className="mt-1.5 fill-slate-500 text-slate-500 shrink-0" />
                                <div className="text-[10px] leading-tight">
                                    <span className="text-slate-500">{item.label}</span>
                                    <span className="text-slate-700 mx-1">-</span>
                                    <span className="text-slate-300 font-medium">{item.val}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const steps = [
        { id: 'vision', label: 'Concept', icon: <Palette size={14} />, value: manifest.vision },
        { id: 'specs', label: 'Art Direction', icon: <Aperture size={14} />, value: manifest.specs },
        { id: 'mimic', label: 'The Mimic', icon: <Brush size={14} />, value: manifest.mimic }, // NEW
        { id: 'maverick', label: 'The Maverick', icon: <Zap size={14} />, value: manifest.maverick },
        { id: 'technical', label: 'Tech Specs', icon: <Settings size={14} />, value: manifest.technical }, // NEW
        { id: 'final', label: 'Gallery', icon: <Wand2 size={14} />, value: manifest.final },
    ];

    return (
        <div className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col h-full animate-in slide-in-from-right-4 shrink-0 transition-all duration-300">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Art Manifest</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, idx) => {
                    const isActive = currentPhase && currentPhase.includes(step.id);
                    const isDone = !!step.value && step.value !== 'Pending...';
                    const isPending = !isActive && !isDone;
                    return (
                        <div key={step.id} className={`relative flex gap-3 ${isPending ? 'opacity-40' : 'opacity-100'} transition-opacity duration-500`}>
                            {idx !== steps.length - 1 && (<div className={`absolute left-[11px] top-6 bottom-[-24px] w-px transition-colors duration-500 ${isDone ? 'bg-fuchsia-900' : 'bg-slate-800'}`} />)}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all duration-300 ${isActive ? 'bg-fuchsia-500 text-white border-fuchsia-400 scale-110' : isDone ? 'bg-fuchsia-900/20 text-fuchsia-400 border-fuchsia-500/50' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                                {isDone && !isActive ? <Check size={12} /> : step.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold uppercase tracking-wide block mb-0.5 ${isActive ? 'text-fuchsia-400' : isDone ? 'text-fuchsia-300' : 'text-slate-500'}`}>{step.label}</span>
                                {step.value ? renderValue(step.value, step.id) : <div className="text-[10px] text-slate-600 italic mt-1">{isActive ? 'Awaiting selection...' : 'Pending...'}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/30 space-y-3">
                {isSetupPhase && (
                    <>
                        <button onClick={onAutoPilot} className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2"><FastForward size={14} /> Auto-Pilot</button>
                        <button onClick={onConfirm} disabled={!isReady && currentPhase !== 'maverick'} className={`w-full py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${(isReady || ['maverick', 'mimic'].includes(currentPhase)) ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>Continue <ArrowRight size={14} /></button>
                    </>
                )}
                {isTechPhase && (
                    <button onClick={onRender} className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/20"><Sparkles size={14} className="fill-white" /> Generate Masterpiece</button>
                )}
            </div>
        </div>
    );
};
export default ArtManifest;
