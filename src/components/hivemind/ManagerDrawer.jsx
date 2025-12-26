import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronUp, ChevronDown, Bot, User } from 'lucide-react';

const ManagerDrawer = ({ isOpen, setIsOpen, messages, onSendMessage, loading }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input, setInput);
    };

    return (
        // CHANGED: Removed 'fixed bottom-0 z-50'. Now it fills the width of its PARENT.
        <div className="w-full bg-slate-900 border-t border-slate-800 shrink-0 relative z-10">

            {/* 1. HISTORY DRAWER (Slides up from the bar, restricted to parent width) */}
            <div className={`absolute bottom-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 transition-all duration-300 ease-out overflow-hidden flex flex-col shadow-2xl ${isOpen ? 'h-[400px] opacity-100 visible' : 'h-0 opacity-0 invisible'
                }`}>
                {/* Chat Header */}
                <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Bot size={14} className="text-indigo-400" /> Hivemind Manager
                    </span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                        <ChevronDown size={16} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center text-slate-600 text-xs mt-10 italic">
                            System ready. Give me feedback to adjust the swarm.
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`text-xs p-3 rounded-lg max-w-[80%] leading-relaxed ${msg.role === 'user' ? 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20' : 'bg-slate-800 text-slate-300'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-2 text-xs text-slate-500 items-center pl-10">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. INPUT BAR (Docked Footer) */}
            <div className="p-3 flex items-center gap-3">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>

                <form onSubmit={handleSubmit} className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Give feedback to the team..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-1 text-indigo-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManagerDrawer;
