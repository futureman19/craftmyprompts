import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './lib/firebase.js';

import Sidebar from './components/Sidebar.jsx';
import Notification from './components/Notification.jsx';
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleLogin = async () => {
      setShowLoginModal(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        showToast("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        showToast("Logged in successfully!");
      }
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      setIsSignup(false);
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex w-full h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
        <Sidebar handleLogin={handleLogin} handleLogout={handleLogout} user={user} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
            {user ? (
              <Routes>
                  <Route path="/" element={
                      <BuilderView 
                          user={user} 
                          initialData={promptToLoad} 
                          clearInitialData={() => setPromptToLoad(null)}
                          showToast={showToast}
                          addToHistory={addToHistory}
                      />
                  } />
                  <Route path="/feed" element={<FeedView user={user} loadPrompt={loadPrompt} />} />
                  <Route path="/library" element={<SavedView user={user} loadPrompt={loadPrompt} showToast={showToast} />} />
                  <Route path="/history" element={<HistoryView sessionHistory={sessionHistory} showToast={showToast} />} />
              </Routes>
            ) : (
              <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to CraftMyPrompt</h2>
                  <p className="text-slate-500 mb-6">Sign in to get started with your prompts</p>
                  <button onClick={() => setShowLoginModal(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                    Sign In / Create Account
                  </button>
                </div>
              </div>
            )}
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{isSignup ? 'Create Account' : 'Sign In'}</h3>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginEmail('');
                  setLoginPassword('');
                  setIsSignup(false);
                }}
                className="mt-4 w-full py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;

