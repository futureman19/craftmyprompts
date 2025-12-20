import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Brain, MessageSquare } from 'lucide-react';
import ChatInterface from '../components/ChatInterface.jsx';
import MemoryManager from '../components/MemoryManager.jsx';

const AgentView = ({ user, globalApiKey, orchestrator, onUpdateBuilder }) => {
    const location = useLocation();
    const initialInput = location.state?.prompt || '';

    // Tab state for mobile switching (defaults to chat)
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'memory'

    // Auth Guard: Ensure only logged-in users can access the Agent
    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 transition-colors h-full">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-fuchsia-600 dark:text-fuchsia-400">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Agent Access Restricted</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Please sign in to access your personal AI agent and memory.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">

            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg text-white shadow-md">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">CraftOS Agent</h1>
                        <p className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider mt-1">Workspace</p>
                    </div>
                </div>

                {/* Mobile Tab Switcher (Visible only on small screens) */}
                <div className="flex md:hidden bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`p-2 rounded-md transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-slate-600 shadow text-fuchsia-600 dark:text-fuchsia-300' : 'text-slate-400'}`}
                    >
                        <MessageSquare size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('memory')}
                        className={`p-2 rounded-md transition-all ${activeTab === 'memory' ? 'bg-white dark:bg-slate-600 shadow text-pink-600 dark:text-pink-300' : 'text-slate-400'}`}
                    >
                        <Brain size={20} />
                    </button>
                </div>
            </header>

            {/* Main Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Chat Interface (Main Panel) */}
                {/* Logic: On Mobile, hide if 'memory' tab is active. On Desktop, always show (flex-1). */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeTab === 'chat' ? 'block' : 'hidden md:flex'}`}>
                    <div className="flex-1 p-4 md:p-6 overflow-hidden">
                        <ChatInterface
                            apiKey={globalApiKey}
                            onUpdateBuilder={onUpdateBuilder}
                            initialInput={initialInput}
                        />
                    </div>
                </div>

                {/* 2. Memory/Context Panel (Side Panel) */}
                {/* Logic: On Mobile, show if 'memory' tab is active. On Desktop, show as sidebar (w-[400px]). */}
                <div className={`w-full md:w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col transition-all duration-300 ${activeTab === 'memory' ? 'flex' : 'hidden md:flex'}`}>
                    <MemoryManager
                        memories={orchestrator.memories || {}}
                        onSave={orchestrator.remember}
                        onDelete={orchestrator.forget}
                        loading={orchestrator.loading}
                    />
                </div>

            </div>
        </div>
    );
};

export default AgentView;