import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';

import Sidebar from './components/Sidebar.jsx';
import Notification from './components/Notification.jsx';
import AuthModal from './components/AuthModal.jsx';
import FeedView from './views/FeedView.jsx';
import SavedView from './views/SavedView.jsx';
import HistoryView from './views/HistoryView.jsx';
import BuilderView from './views/BuilderView.jsx';
import AgentView from './views/AgentView.jsx';
import ProfileView from './views/ProfileView.jsx'; // 2. Import Profile View

// Import Orchestrator Hook
import { useOrchestrator } from './hooks/useOrchestrator.js';

const App = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [promptToLoad, setPromptToLoad] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('craft-my-prompt-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const navigate = useNavigate();

  // --- INITIALIZE CONTEXT OS (Memory Engine) ---
  const orchestrator = useOrchestrator(user);

  // Global API Key (Fallback)
  const globalApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // --- EFFECTS ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('craft-my-prompt-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('craft-my-prompt-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- HELPERS ---
  const showToast = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToHistory = (prompt, type) => {
    setSessionHistory(prev => [{ prompt, type, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const loadPrompt = (data) => {
    setPromptToLoad(data);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      showToast("Logged out successfully.");
    } catch (error) {
      showToast(error.message || "Logout failed", "error");
    }
  };

  const handleLoginRequest = () => {
    setShowLoginModal(true);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen md:h-dvh bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">

      {/* Sidebar Component */}
      <Sidebar
        handleLogin={handleLoginRequest}
        handleLogout={handleLogout}
        user={user}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenAgent={() => navigate('/agent')} // <--- CTO UPDATE: Navigate to Workspace
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={
            <BuilderView
              user={user}
              initialData={promptToLoad}
              clearInitialData={() => setPromptToLoad(null)}
              showToast={showToast}
              addToHistory={addToHistory}
              onLoginRequest={handleLoginRequest}
            />
          } />

          {/* CTO UPDATE: Agent Workspace Route */}
          <Route path="/agent" element={
            <AgentView
              user={user}
              globalApiKey={globalApiKey}
              orchestrator={orchestrator}
              onUpdateBuilder={(text) => {
                loadPrompt({ topic: text });
                navigate('/'); // Switch to Builder View
                showToast("Agent Idea loaded into Builder", "success");
              }}
            />
          } />

          <Route path="/feed" element={<FeedView user={user} loadPrompt={loadPrompt} onLoginRequest={handleLoginRequest} />} />

          <Route path="/profile" element={
            <ProfileView
              user={user}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          } />

          {user ? (
            <>
              <Route path="/library" element={<SavedView user={user} loadPrompt={loadPrompt} showToast={showToast} />} />
              <Route path="/history" element={<HistoryView sessionHistory={sessionHistory} showToast={showToast} />} />
            </>
          ) : (
            <>
              <Route path="/library" element={<div className="flex items-center justify-center h-full"><div className="text-center p-8"><h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Library is locked</h2><p className="text-slate-500 dark:text-slate-400 mb-4">Please sign in to save your prompts.</p><button onClick={handleLoginRequest} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign In</button></div></div>} />
              <Route path="/history" element={<div className="flex items-center justify-center h-full"><div className="text-center p-8"><h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">History is locked</h2><p className="text-slate-500 dark:text-slate-400 mb-4">Sign in to track your session history.</p><button onClick={handleLoginRequest} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign In</button></div></div>} />
            </>
          )}
        </Routes>
      </div>

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        showToast={showToast}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;