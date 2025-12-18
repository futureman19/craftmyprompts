import React, { useState } from 'react';
import { X, Sparkles, Brain, MessageSquare } from 'lucide-react';
import ChatInterface from './ChatInterface.jsx';
import MemoryManager from './MemoryManager.jsx';

const AgentModal = ({ 
    isOpen, 
    onClose, 
    apiKey,
    // Memory Props (Received from BuilderView -> useOrchestrator)
    memories,
    onSaveMemory,
    onDeleteMemory,
    loadingMemory
}) => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'memory'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-0 md:p-4 animate-in fade-in duration-200">
            {/* Responsive Container */}
            <div className="bg-white dark:bg-slate-900 w-full md:max-w-2xl h-full md:h-[700px] rounded-none md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                
                {/* Modal Header & Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                    <div className="flex justify-between items-center p-4 pb-0">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <Sparkles size={20} className="text-indigo-500" /> CraftOS Agent
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mb-4"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-4 gap-6">
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <MessageSquare size={16} /> Chat
                        </button>
                        <button 
                            onClick={() => setActiveTab('memory')}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'memory' ? 'border-pink-500 text-pink-600 dark:text-pink-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Brain size={16} /> Memory
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-900">
                    {activeTab === 'chat' ? (
                        <div className="absolute inset-0">
                            <ChatInterface apiKey={apiKey} />
                        </div>
                    ) : (
                        <div className="absolute inset-0">
                            <MemoryManager 
                                memories={memories || {}} 
                                onSave={onSaveMemory}
                                onDelete={onDeleteMemory}
                                loading={loadingMemory}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentModal;