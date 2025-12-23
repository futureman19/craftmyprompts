import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

const ManagerDrawer = ({ isOpen, setIsOpen, messages, onSendMessage, loading }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of history
    useEffect(() => {
        if (scrollRef.current && isOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    return (
        <>
            {/* --- 1. HISTORY PANEL (Slides Up) --- */}
            {/* Only visible when 'isOpen' is true */}
            <div
                className={`fixed inset-x-0 bottom-[80px] z-40 transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[50vh]">

                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission History</span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-600 text-sm mt-10 italic">
                                    "I am ready to direct the Swarm. What do you need?"
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/50 text-slate-400 text-xs px-3 py-2 rounded-xl animate-pulse flex items-center gap-2">
                                        <Bot size={12} /> Manager is thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. PERSISTENT COMMAND BAR (Always Visible) --- */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-950 border-t border-slate-800 pb-safe pt-2">
                <div className="max-w-3xl mx-auto px-4 pb-4 pt-2">
                    <div className="relative flex items-center gap-3 bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-lg shadow-black/50 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">

                        {/* THE CUTE ROBOT ICON */}
                        <div className={`p-2.5 rounded-xl transition-colors ${loading ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                            <Bot size={24} />
                        </div>

                        {/* INPUT FIELD */}
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm h-full py-2"
                            placeholder="Talk to the Manager Agent..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && onSendMessage(input, setInput)}
                            onFocus={() => setIsOpen(true)} // Auto-open history when typing
                        />

                        {/* ACTIONS */}
                        <div className="flex items-center gap-1">
                            {/* Toggle History Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 rounded-lg transition-colors ${isOpen ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                                title={isOpen ? "Hide History" : "Show History"}
                            >
                                {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                            </button>

                            {/* Send Button */}
                            <button
                                onClick={() => !loading && onSendMessage(input, setInput)}
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-800 transition-all transform active:scale-95"
                            >
                                <Send size={18} fill="currentColor" />
                            </button>
                        </div>

                    </div>

                    {/* Helper Text */}
                    {!isOpen && messages.length > 0 && (
                        <div className="absolute bottom-full left-0 w-full flex justify-center mb-2 pointer-events-none">
                            <span className="bg-indigo-600/90 text-white text-[10px] px-2 py-1 rounded-full shadow-lg animate-in slide-in-from-bottom-2 flex items-center gap-1">
                                <MessageSquare size={10} /> {messages.length} messages in history
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManagerDrawer;
