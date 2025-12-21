import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    MonitorPlay,
    Users,
    Swords,
    Sparkles,
    Activity,
    Clock,
    User,
    Shield,
    ChevronRight
} from 'lucide-react';
import ApiWalletCard from '../components/dashboard/ApiWalletCard.jsx';

const DashboardView = ({ onConfigureApi }) => {
    const navigate = useNavigate();
    const [recentComms, setRecentComms] = useState([]);

    // Load recent history (Mocking for now, or reading generic history if available)
    useEffect(() => {
        // Placeholder for reading actual history
        // In a real implementation, we might read 'swarm_history' or similar from localStorage
        const history = [];
        setRecentComms(history);
    }, []);

    const QuickLaunchCard = ({ title, icon: Icon, color, desc, onClick }) => (
        <button
            onClick={onClick}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-left transition-all hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1"
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={64} />
            </div>

            <div className={`mb-4 inline-flex p-3 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon size={24} className={color.replace('text-', '') /* Hacky but works for text-color classes usually, or just use text-current */} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
            </p>
        </button>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layout className="text-indigo-500" />
                        Command Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Welcome back, Commander. Systems nominal.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN (1/3) */}
                <div className="space-y-6">
                    {/* User Profile Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500"></div>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm">
                                <User size={32} className="text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Commander</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        Level 1
                                    </span>
                                    <span className="text-xs text-slate-400">Free Tier</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="text-lg font-bold text-slate-700 dark:text-slate-200">0</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Projects</div>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="text-lg font-bold text-slate-700 dark:text-slate-200">0</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Agents</div>
                            </div>
                        </div>
                    </div>

                    {/* API Wallet */}
                    <ApiWalletCard onConfigure={onConfigureApi} />
                </div>

                {/* RIGHT COLUMN (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Launch */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <Activity size={16} /> Quick Launch
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <QuickLaunchCard
                                title="Hivemind"
                                icon={Users}
                                color="text-violet-500"
                                desc="Deploy an auto-squad of agents to solve complex tasks."
                                onClick={() => navigate('/test-runner')}
                            />
                            <QuickLaunchCard
                                title="Arena"
                                icon={Swords}
                                color="text-rose-500"
                                desc="Pit two AI models against each other in a battle of wits."
                                onClick={() => navigate('/test-runner')}
                            />
                            <QuickLaunchCard
                                title="Blueprint"
                                icon={Sparkles}
                                color="text-amber-500"
                                desc="Architect a new project from scratch using natural language."
                                onClick={() => navigate('/')}
                            />
                        </div>
                    </div>

                    {/* Recent Comms */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Clock size={16} /> Recent Comms
                            </h2>
                            <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">View All</button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[150px] flex items-center justify-center">
                            {recentComms.length > 0 ? (
                                <ul className="w-full">
                                    {recentComms.map((item, i) => (
                                        <li key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.title}</span>
                                                <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 px-4">
                                    <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-600 mb-2">
                                        <Shield size={24} />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No recent transmissions</p>
                                    <p className="text-xs text-slate-400 mt-1">Initialize a run to populate history.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardView;
