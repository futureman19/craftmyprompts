import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Globe, Bookmark, List, LogOut, LogIn, Bot, UserCircle2, MonitorPlay } from 'lucide-react';

const Sidebar = ({ handleLogin, handleLogout, user, darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Active state styles: Distinct for Light/Dark modes
    const isActive = (path) => location.pathname === path
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

    // Agent specific active state (Fuchsia theme)
    const isAgentActive = location.pathname === '/agent'
        ? 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/40 border-2 border-fuchsia-200 dark:border-fuchsia-800'
        : 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 border-2 border-transparent';

    return (
        // Container: 
        // - Mobile: FIXED at bottom (bottom-0), full width.
        // - Desktop: RELATIVE (static flow), full height, width 20 (80px).
        <div className="fixed bottom-0 left-0 right-0 w-full h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 flex flex-row items-center justify-around md:static md:flex-col md:justify-start md:w-20 md:h-full md:border-t-0 md:border-r md:py-6 transition-all duration-200">

            {/* Logo - Hidden on mobile to save space */}


            {/* Navigation Items */}
            <div className="flex flex-row md:flex-col justify-around md:justify-start w-full md:w-auto gap-1 md:gap-6 items-center flex-1 md:flex-none">

                {/* 1. AGENT (Prioritized) */}
                <button
                    onClick={() => navigate('/agent')}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isAgentActive}`}
                    title="Open CraftOS Agent"
                >
                    <Bot size={20} className="md:w-6 md:h-6" />
                    <span className="text-[10px] font-bold">Agent</span>
                </button>

                {/* 2. BUILDER */}
                <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/')}`}>
                    <Layout size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Builder</span>
                </button>

                {/* 3. TEST RUNNER */}
                <button onClick={() => navigate('/test-runner')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/test-runner')}`}>
                    <MonitorPlay size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Runner</span>
                </button>

                {/* Secondary Links */}
                <button onClick={() => navigate('/library')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/library')}`}>
                    <Bookmark size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Library</span>
                </button>
            </div>

            {/* Bottom Actions - Desktop Only */}
            <div className="hidden md:flex flex-col gap-4 pb-4 items-center w-full mt-auto">
                {/* User Dock */}
                <button
                    onClick={() => navigate('/profile')}
                    className={`p-2 rounded-lg transition-all ${isActive('/profile')}`}
                    title="User Dashboard"
                >
                    <UserCircle2 size={24} />
                </button>

                {user && user.uid !== 'demo' ? (
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-red-400 transition-all" title="Sign Out">
                        <LogOut size={20} />
                        <span className="text-[9px] font-medium">Exit</span>
                    </button>
                ) : (
                    <button onClick={handleLogin} className="flex flex-col items-center gap-1 p-2 text-emerald-400 hover:text-emerald-300 transition-all" title="Sign In with Google">
                        <LogIn size={20} />
                        <span className="text-[9px] font-medium">Login</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;