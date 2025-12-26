import React from 'react';
import { Loader2 } from 'lucide-react';

const AgentLoader = ({ message }) => {
    return (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Holographic Spinner Container */}
            <div className="relative">
                {/* 1. Glowing Backdrop */}
                <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full animate-pulse" />

                {/* 2. Main Spinner */}
                <div className="relative z-10 p-4 bg-slate-950/50 rounded-full border border-slate-800 backdrop-blur-sm shadow-2xl">
                    <Loader2 size={48} className="text-purple-500 animate-spin" />
                </div>

                {/* 3. Orbiting Particles (Optional CSS trick, keeping it simple for now) */}
            </div>

            {/* Status Text */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">
                    Hivemind Active
                </h3>
                <p className="text-xs font-mono text-purple-300">
                    {message || "Processing..."}
                </p>
            </div>
        </div>
    );
};

export default AgentLoader;
