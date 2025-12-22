import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ManagerDrawer = ({ isOpen, onClose, messages, onSendMessage, loading }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center animate-in slide-in-from-bottom-10">
            {/* The Drawer Card */}
            <div className="w-full max-w-3xl bg-slate-900 border-t border-x border-slate-700 rounded-t-2xl shadow-2xl flex flex-col h-[500px]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Swarm Manager</h3>
                            <p className="text-xs text-slate-400">Orchestrating the Hivemind...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-500 text-sm mt-10">
                            Give an instruction, and I will direct the agents.
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-xl animate-pulse">
                                Manager is thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                            placeholder="Type an instruction (e.g., 'Change database to Firebase')..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && onSendMessage(input, setInput)}
                        />
                        <button
                            onClick={() => !loading && onSendMessage(input, setInput)}
                            disabled={!input || loading}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDrawer;
