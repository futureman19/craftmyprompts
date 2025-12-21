import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader, ArrowRightCircle, AlertTriangle } from 'lucide-react';
import { useAgent } from '../hooks/useAgent.js';

const ChatInterface = ({ activeAgent, onUpdateBuilder, initialInput }) => {
    const [input, setInput] = useState(initialInput || '');
    
    // Load keys from storage to support multi-provider agents
    const [keys, setKeys] = useState({
        gemini: localStorage.getItem('gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '',
        openai: localStorage.getItem('openai_key') || import.meta.env.VITE_OPENAI_API_KEY || '',
        anthropic: localStorage.getItem('anthropic_key') || import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        groq: localStorage.getItem('groq_key') || import.meta.env.VITE_GROQ_API_KEY || ''
    });

    // Update input if initialInput changes (e.g. re-navigation)
    useEffect(() => {
        if (initialInput) setInput(initialInput);
    }, [initialInput]);

    // Initialize the Agent Hook with the active persona
    const { messages, isLoading, sendMessage, handleAction, clearHistory } = useAgent(keys, activeAgent);

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

    // Check if the current agent has a valid key
    const currentProvider = activeAgent?.provider || 'gemini';
    const hasKey = !!keys[currentProvider];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    {activeAgent ? (
                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                                {activeAgent.name}
                            </h3>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                                {activeAgent.role} • {activeAgent.provider}
                            </span>
                        </div>
                    ) : (
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Sparkles size={18} className="text-indigo-500" /> CraftOS Agent
                        </h3>
                    )}
                </div>
                
                <button 
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    Clear Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-60 px-8">
                        {activeAgent ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-800">
                                    <Bot size={32} className="text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{activeAgent.systemPrompt.split('.')[0]}.</p>
                                <p className="text-xs">I am ready to assist with {activeAgent.role.toLowerCase()}.</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <Bot size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-sm">Select an agent from the roster or start typing.</p>
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {/* Avatar (Assistant) */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1 border border-indigo-200 dark:border-indigo-800">
                                <Bot size={16} />
                            </div>
                        )}

                        {/* Content Bubble */}
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none text-slate-700 dark:text-slate-200'
                        }`}>
                            {/* Text Content */}
                            {msg.type === 'text' && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
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
                                        <msg.component 
                                            {...msg.props} 
                                            onAction={handleAction} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Push to Builder Action */}
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
                    <div className="flex gap-3 justify-start animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-1">
                            <Loader size={16} className="animate-spin" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                {!hasKey && activeAgent ? (
                    <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle size={14} />
                        <span>Missing API Key for <strong>{currentProvider}</strong>. Please check settings.</span>
                    </div>
                ) : null}
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && hasKey && handleSend()}
                        placeholder={activeAgent ? `Message ${activeAgent.name}...` : "Select an agent to begin..."}
                        className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white placeholder-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || (!hasKey && activeAgent)}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || (!hasKey && activeAgent)}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;