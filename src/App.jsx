import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase.js';

import Sidebar from './components/Sidebar.jsx';
import Notification from './components/Notification.jsx';
import AuthModal from './components/AuthModal.jsx';
import FeedView from './views/FeedView.jsx';
import SavedView from './views/SavedView.jsx';
import HistoryView from './views/HistoryView.jsx';
import BuilderView from './views/BuilderView.jsx';

const App = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [promptToLoad, setPromptToLoad] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Navigation Hook
  const navigate = useNavigate();

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0]
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
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
        await signOut(auth);
        setUser(null);
        showToast("Logged out successfully.");
      } catch (error) {
        showToast(error.message || "Logout failed", "error");
      }
  };

  const handleLoginRequest = () => {
      setShowLoginModal(true);
  };

  return (
    <div className="flex w-full h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
        <Sidebar 
            handleLogin={handleLoginRequest} 
            handleLogout={handleLogout} 
            user={user} 
        />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
            <Routes>
                {/* Public Route: Builder is now accessible to everyone */}
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
                
                {/* Public Route: Feed is visible to everyone (read-only for guests) */}
                <Route path="/feed" element={
                    <FeedView 
                        user={user} 
                        loadPrompt={loadPrompt} 
                        onLoginRequest={handleLoginRequest}
                    />
                } />

                {/* Private Routes: Require User */}
                {user ? (
                    <>
                        <Route path="/library" element={<SavedView user={user} loadPrompt={loadPrompt} showToast={showToast} />} />
                        <Route path="/history" element={<HistoryView sessionHistory={sessionHistory} showToast={showToast} />} />
                    </>
                ) : (
                    // Redirect guests trying to access private routes to Builder or show a restricted view
                    <>
                        <Route path="/library" element={<div className="flex items-center justify-center h-full"><div className="text-center p-8"><h2 className="text-xl font-bold text-slate-700 mb-2">Library is locked</h2><p className="text-slate-500 mb-4">Please sign in to save your prompts.</p><button onClick={handleLoginRequest} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign In</button></div></div>} />
                        <Route path="/history" element={<div className="flex items-center justify-center h-full"><div className="text-center p-8"><h2 className="text-xl font-bold text-slate-700 mb-2">History is locked</h2><p className="text-slate-500 mb-4">Sign in to track your session history.</p><button onClick={handleLoginRequest} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign In</button></div></div>} />
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