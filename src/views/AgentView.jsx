import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Sparkles, Brain, MessageSquare, Users, Zap, Bot,
    Code, Feather, BarChart, ChevronRight, Check
} from 'lucide-react';
import ChatInterface from '../components/ChatInterface.jsx';
import MemoryManager from '../components/MemoryManager.jsx';

// NOTE: swarm-agents.js was deleted, so we removed the import.
// If you need to re-enable manual chatting with specific agents, 
// we can re-define the roster locally later.

const AgentView = ({ user, globalApiKey, orchestrator, onUpdateBuilder }) => {
    const location = useLocation();
    const initialInput = location.state?.prompt || '';

    // State
    const [activeTab, setActiveTab] = useState('chat'); // Mobile: 'roster' | 'chat' | 'memory'
    const [activeAgent, setActiveAgent] = useState(null); // The selected persona

    // Group Squads for rendering
    // Agents set to empty [] for now to prevent build errors
    const SQUADS = [
        { id: 'tech', name: 'Tech Squad', icon: Code, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', agents: [] },
        { id: 'creative', name: 'Creative Squad', icon: Feather, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30', agents: [] },
        { id: 'data', name: 'Data Squad', icon: BarChart, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', agents: [] },
    ];

    // Auth Guard
    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 h-full">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-fuchsia-600 dark:text-fuchsia-400">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Agent Access Restricted</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Please sign in to access your personal AI agent roster.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">

            {/* Header (Mobile & Desktop) */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white shadow-md transition-colors ${activeAgent ? 'bg-indigo-600' : 'bg-gradient-to-br from-fuchsia-600 to-purple-600'}`}>
                        {activeAgent ? <Users size={20} /> : <Sparkles size={20} />}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {activeAgent ? activeAgent.name : 'Agent Workspace'}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            {activeAgent ? activeAgent.role : 'Select a Persona'}
                        </p>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('roster')} className={`p-2 rounded-md ${activeTab === 'roster' ? 'bg-white dark:bg-slate-600 shadow text-indigo-500' : 'text-slate-400'}`}><Users size={20} /></button>
                    <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-md ${activeTab === 'chat' ? 'bg-white dark:bg-slate-600 shadow text-fuchsia-500' : 'text-slate-400'}`}><MessageSquare size={20} /></button>
                    <button onClick={() => setActiveTab('memory')} className={`p-2 rounded-md ${activeTab === 'memory' ? 'bg-white dark:bg-slate-600 shadow text-pink-500' : 'text-slate-400'}`}><Brain size={20} /></button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. LEFT PANEL: THE ROSTER (Desktop: Sidebar, Mobile: Tab) */}
                <div className={`w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col transition-all duration-300 ${activeTab === 'roster' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deploy Agent</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-6">
                        {/* Default / Generalist */}
                        <button
                            onClick={() => { setActiveAgent(null); setActiveTab('chat'); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${!activeAgent ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
                                <Bot size={18} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Generalist</div>
                                <div className="text-[10px] text-slate-400">Standard Assistant</div>
                            </div>
                            {!activeAgent && <Check size={14} className="ml-auto text-indigo-500" />}
                        </button>

                        {/* Squads */}
                        {SQUADS.map(squad => (
                            <div key={squad.id}>
                                <div className="px-2 mb-2 flex items-center gap-2">
                                    <squad.icon size={12} className={squad.color} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{squad.name}</span>
                                </div>
                                <div className="space-y-1">
                                    {squad.agents && squad.agents.length > 0 ? squad.agents.map(agent => {
                                        const isActive = activeAgent?.id === agent.id;
                                        return (
                                            <button
                                                key={agent.id}
                                                onClick={() => { setActiveAgent(agent); setActiveTab('chat'); }}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border ${isActive ? `bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-500/20` : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 opacity-80 hover:opacity-100'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${squad.bg} ${squad.color}`}>
                                                    {agent.name.charAt(0)}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className={`text-xs font-bold truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{agent.name}</div>
                                                    <div className="text-[9px] text-slate-400 truncate">{agent.role}</div>
                                                </div>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                                            </button>
                                        );
                                    }) : (
                                        <div className="p-2 text-[10px] text-slate-400 italic pl-8">No agents available</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. CENTER PANEL: CHAT INTERFACE */}
                <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-all duration-300 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 p-4 md:p-6 overflow-hidden">
                        {/* Key Logic: Pass activeAgent to the Chat Interface */}
                        <ChatInterface
                            key={activeAgent?.id || 'default'}
                            activeAgent={activeAgent}
                            apiKey={globalApiKey}
                            onUpdateBuilder={onUpdateBuilder}
                            initialInput={initialInput}
                        />
                    </div>
                </div>

                {/* 3. RIGHT PANEL: MEMORY (Desktop: Sidebar, Mobile: Tab) */}
                <div className={`w-full md:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col transition-all duration-300 ${activeTab === 'memory' ? 'flex' : 'hidden md:flex'}`}>
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