import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Globe, Bookmark, List, LogOut, LogIn, Sparkles } from 'lucide-react';

const Sidebar = ({ handleLogin, handleLogout, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path 
        ? 'bg-slate-800 text-indigo-400' 
        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50';

    return (
        <div className="w-16 md:w-20 bg-slate-900 flex flex-col items-center py-6 gap-6 border-r border-slate-800 z-50 flex-shrink-0 h-full">
           <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 shadow-lg shadow-indigo-900/50">
             <Sparkles className="text-white" size={24} />
           </div>
           
           <div className="flex-1 flex flex-col gap-6 w-full items-center">
               <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 ${isActive('/')}`}>
                   <Layout size={24} /><span className="text-[10px] font-medium">Create</span>
               </button>
               <button onClick={() => navigate('/feed')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 ${isActive('/feed')}`}>
                   <Globe size={24} /><span className="text-[10px] font-medium">Feed</span>
               </button>
               <button onClick={() => navigate('/library')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 ${isActive('/library')}`}>
                   <Bookmark size={24} /><span className="text-[10px] font-medium">Library</span>
               </button>
               <button onClick={() => navigate('/history')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-14 ${isActive('/history')}`}>
                   <List size={24} /><span className="text-[10px] font-medium">History</span>
               </button>
           </div>
    
           <div className="mt-auto pb-4">
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