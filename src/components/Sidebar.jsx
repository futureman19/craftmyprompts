import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Globe, Bookmark, List, LogOut, LogIn, Sparkles, Moon, Sun, Bot } from 'lucide-react';

const Sidebar = ({ handleLogin, handleLogout, user, darkMode, toggleDarkMode, onOpenAgent }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Active state styles: Distinct for Light/Dark modes
    const isActive = (path) => location.pathname === path 
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

    return (
        // Container: 
        // - Mobile: FIXED at bottom (bottom-0), full width.
        // - Desktop: RELATIVE (static flow), full height, width 20 (80px).
        <div className="fixed bottom-0 left-0 right-0 w-full h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 flex flex-row items-center justify-around md:static md:flex-col md:justify-start md:w-20 md:h-full md:border-t-0 md:border-r md:py-6 transition-all duration-200">
           
           {/* Logo - Hidden on mobile to save space */}
           <div className="hidden md:flex p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 shadow-lg shadow-indigo-900/20">
             <Sparkles className="text-white" size={24} />
           </div>
           
           {/* Navigation Items */}
           <div className="flex flex-row md:flex-col justify-around md:justify-start w-full md:w-auto gap-1 md:gap-6 items-center flex-1 md:flex-none">
               
               {/* CTO UPDATE: Global Agent Button */}
               <button 
                    onClick={onOpenAgent} 
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40"
                    title="Open CraftOS Agent"
               >
                   <Bot size={20} className="md:w-6 md:h-6" />
                   <span className="text-[10px] font-bold">Agent</span>
               </button>

               <div className="hidden md:block w-8 h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

               <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/')}`}>
                   <Layout size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Create</span>
               </button>
               <button onClick={() => navigate('/feed')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/feed')}`}>
                   <Globe size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Feed</span>
               </button>
               <button onClick={() => navigate('/library')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/library')}`}>
                   <Bookmark size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">Library</span>
               </button>
               <button onClick={() => navigate('/history')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-16 md:w-14 ${isActive('/history')}`}>
                   <List size={20} className="md:w-6 md:h-6" /><span className="text-[10px] font-medium">History</span>
               </button>
           </div>
    
           {/* Bottom Actions - Desktop Only (Mobile users use profile/settings elsewhere if needed, or we can add a menu later) */}
           <div className="hidden md:flex flex-col gap-4 pb-4 items-center w-full mt-auto">
                <button 
                    onClick={toggleDarkMode} 
                    className="p-2 text-slate-500 hover:text-yellow-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
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