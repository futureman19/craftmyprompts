import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader, ArrowRightCircle } from 'lucide-react';
import { useAgent } from '../hooks/useAgent.js';

const ChatInterface = ({ apiKey, provider = 'gemini', onUpdateBuilder, initialInput }) => {
    const [input, setInput] = useState(initialInput || '');

    // Update input if initialInput changes (e.g. re-navigation)
    useEffect(() => {
        if (initialInput) setInput(initialInput);
    }, [initialInput]);

    // Destructuring handleAction from the hook
    const { messages, isLoading, sendMessage, handleAction, clearHistory } = useAgent(apiKey, provider);

    const bottomRef = useRef(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-500" /> CraftOS Agent
                </h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                >
                    Clear Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-50 px-8">
                        <Bot size={48} className="mb-4 text-indigo-300" />
                        <div className="text-center space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                I can help you draft prompts, find trends, or search for visuals.
                            </p>
                            <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 inline-block text-left">
                                <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">Available Commands:</p>
                                <code className="block text-indigo-500 dark:text-indigo-400 font-mono mb-1">/trend [topic]</code>
                                <code className="block text-pink-500 dark:text-pink-400 font-mono mb-1">/image [query]</code>
                                <code className="block text-emerald-500 dark:text-emerald-400 font-mono">/ship</code>
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar (Assistant) */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1">
                                <Bot size={16} />
                            </div>
                        )}

                        {/* Content Bubble */}
                        <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                            }`}>
                            {/* Text Content */}
                            {msg.type === 'text' && (
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {msg.content}
                                </p>
                            )}

                            {/* Generative UI Content */}
                            {msg.type === 'component' && (
                                <div className="mt-1 w-full">
                                    <div className="text-[10px] font-bold uppercase text-indigo-400 mb-2 flex items-center gap-1">
                                        <Sparkles size={10} /> Generated Interface
                                    </div>
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                                        {/* Render the component dynamically with props AND action handler */}
                                        <msg.component
                                            {...msg.props}
                                            onAction={handleAction}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* PUSH TO BUILDER ACTION */}
                            {msg.role === 'assistant' && onUpdateBuilder && (
                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                                    <button
                                        onClick={() => onUpdateBuilder(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.props || {}))}
                                        className="text-[10px] flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full transition-colors"
                                    >
                                        Push to Builder <ArrowRightCircle size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Avatar (User) */}
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0 mt-1">
                                <User size={16} />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-1">
                            <Loader size={16} className="animate-spin" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for trends, visuals, or help..."
                        className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white placeholder-slate-400 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;