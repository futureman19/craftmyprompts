import React, { useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthModal = ({ isOpen, onClose, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignup) {
        // Supabase Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;

        // Check if email confirmation is required (Supabase default)
        if (data?.user && !data?.session) {
            showToast("Please check your email to confirm your account.", "success");
        } else {
            showToast("Account created successfully!", "success");
        }

      } else {
        // Supabase Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        showToast("Logged in successfully!", "success");
      }
      
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setIsSignup(false);
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{isSignup ? 'Create Account' : 'Sign In'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        <div className="mt-4 text-center text-sm space-y-3">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium hover:underline"
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          
          <button
            onClick={onClose}
            className="block w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;