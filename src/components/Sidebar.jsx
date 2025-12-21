import React from 'react';
import {
    Bot, Hammer, Globe, Bookmark,
    Sun, Moon, UserCircle, LogOut, LogIn
} from 'lucide-react';

const Sidebar = ({
    user,
    onNavigate,
    currentView,
    darkMode,
    toggleDarkMode,
    onLogout,
    onLogin
}) => {

    // Helper for Nav Buttons
    const NavItem = ({ id, icon: Icon, label, onClick }) => {
        const isActive = currentView === id;
        return (
            <button
                onClick={() => onClick(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                    }`}
            >
                <Icon size={20} className={isActive ? 'text-emerald-400 dark:text-emerald-600' : 'group-hover:text-slate-900 dark:group-hover:text-white'} />
                <span className="font-bold text-sm">{label}</span>
            </button>
        );
    };

    return (
        <div className="h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 fixed left-0 top-0 z-50">

            {/* 1. APP LOGO/HEADER */}
            <div className="mb-8 px-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                    C
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    Context OS
                </span>
            </div>

            {/* 2. TOP NAVIGATION (Items 1-4) */}
            <div className="space-y-2 flex-1">
                <NavItem
                    id="test-runner" // "Agent" maps to the Test Runner/Hivemind
                    label="Agent"
                    icon={Bot}
                    onClick={onNavigate}
                />
                <NavItem
                    id="blueprint" // "Builder" maps to new feature
                    label="Builder"
                    icon={Hammer}
                    onClick={onNavigate}
                />
                <NavItem
                    id="feed"
                    label="Feed"
                    icon={Globe}
                    onClick={onNavigate}
                />
                <NavItem
                    id="saved"
                    label="Saved"
                    icon={Bookmark}
                    onClick={onNavigate}
                />
            </div>

            {/* 3. BOTTOM ACTIONS (Items 5-7) */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">

                {/* Item 5: Theme Switch */}
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="font-bold text-sm">
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                {/* Item 6: Profile */}
                <NavItem
                    id="profile"
                    label="Profile"
                    icon={UserCircle}
                    onClick={onNavigate}
                />

                {/* Item 7: Login/Exit */}
                {user ? (
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Exit</span>
                    </button>
                ) : (
                    <button
                        onClick={onLogin}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-all"
                    >
                        <LogIn size={20} />
                        <span className="font-bold text-sm">Login</span>
                    </button>
                )}

            </div>
        </div>
    );
};

export default Sidebar;