import React, { useState } from 'react';
import { Database, Loader, Check, AlertTriangle, Play } from 'lucide-react';
// FIX: Added .js extension for explicit module resolution
import { supabase } from '../lib/supabase.js';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase.js';

const KnowledgeSeeder = () => {
    const [status, setStatus] = useState('idle'); // 'idle' | 'seeding' | 'complete' | 'error'
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

    const handleSeed = async () => {
        if (!confirm("This will generate embeddings for your entire Knowledge Base. Continue?")) return;
        
        setStatus('seeding');
        setLogs([]);
        const entries = Object.entries(KNOWLEDGE_BASE);
        setTotal(entries.length);
        let count = 0;

        for (const [topic, content] of entries) {
            try {
                // 1. Check if already exists to prevent duplicates/waste
                const { data: existing } = await supabase
                    .from('knowledge_vectors')
                    .select('id')
                    .eq('topic', topic)
                    .single();

                if (existing) {
                    addLog(`Skipping "${topic}" (Already exists)`);
                    count++;
                    setProgress(count);
                    continue;
                }

                // 2. Generate Embedding via our Proxy
                const embedResponse = await fetch('/api/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: content })
                });

                if (!embedResponse.ok) throw new Error("Failed to embed");
                const { embedding } = await embedResponse.json();

                // 3. Insert into Supabase
                const { error: insertError } = await supabase
                    .from('knowledge_vectors')
                    .insert({
                        topic: topic,
                        content: content,
                        embedding: embedding
                    });

                if (insertError) throw insertError;

                addLog(`Success: "${topic}"`);
                
                // 4. Rate Limit Pause (Google Limit is usually 60/min, staying safe)
                await new Promise(r => setTimeout(r, 1000)); 

            } catch (err) {
                console.error(err);
                addLog(`Error: "${topic}" - ${err.message}`);
            }

            count++;
            setProgress(count);
        }

        setStatus('complete');
        addLog("Seeding Complete!");
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Database size={18} className="text-violet-500" /> Knowledge Vectorizer
                </h3>
                {status === 'idle' && (
                    <button 
                        onClick={handleSeed}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                        <Play size={14} /> Start Migration
                    </button>
                )}
            </div>

            {status !== 'idle' && (
                <div className="space-y-3 animate-in fade-in">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-violet-500 h-full transition-all duration-300"
                            style={{ width: `${(progress / total) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>{status === 'seeding' ? 'Processing...' : 'Finished'}</span>
                        <span>{progress} / {total}</span>
                    </div>

                    {/* Logs */}
                    <div className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-green-400 h-24 overflow-y-auto border border-slate-800">
                        {logs.map((log, i) => (
                            <div key={i} className="truncate">{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {status === 'complete' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                    <Check size={16} /> Database is now vector-ready.
                </div>
            )}
        </div>
    );
};

export default KnowledgeSeeder;