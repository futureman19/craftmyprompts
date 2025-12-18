import React from 'react';
import { X, Sparkles } from 'lucide-react';
import ChatInterface from './ChatInterface.jsx';

const AgentModal = ({ isOpen, onClose, apiKey }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-0 md:p-4 animate-in fade-in duration-200">
            {/* Responsive Container: Full screen on mobile, fixed size on desktop */}
            <div className="bg-white dark:bg-slate-900 w-full md:max-w-2xl h-full md:h-[700px] rounded-none md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-500" /> CraftOS Agent
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Chat Interface fills the remaining space */}
                {/* We override the internal height of ChatInterface to fit the modal */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0">
                        <ChatInterface apiKey={apiKey} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentModal;