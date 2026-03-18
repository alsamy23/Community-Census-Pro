import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Users, ArrowRight, Shield, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { dataService } from '../services/dataService';

export default function Login() {
  const { login } = useAuth();
  // ... existing state ...
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'user') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      await login(email, 'user');
    } else {
      // Admin login logic
      const isAdmin1 = email === 'admin@census.com' && password === 'admin123';
      const isAdmin2 = email === 'lsamy2752@gmail.com' && password === 'admin@123';
      
      if (isAdmin1 || isAdmin2) {
        await login(email, 'admin');
      } else {
        setError('Invalid admin credentials');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100"
      >
        {/* ... existing header ... */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
            <Users size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Community Census Pro</h1>
        <p className="text-center text-slate-500 mb-8">Select your login type</p>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button 
            onClick={() => { setMode('user'); setError(''); }}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
              mode === 'user' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Users size={16} />
            User Login
          </button>
          <button 
            onClick={() => { setMode('admin'); setError(''); }}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
              mode === 'admin' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Shield size={16} />
            Admin Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* ... existing form fields ... */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {mode === 'admin' ? 'Admin Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder={mode === 'admin' ? 'admin@census.com' : 'name@example.com'}
                required
              />
            </div>
          </div>

          {mode === 'admin' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>
          )}
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 mt-6"
          >
            <span>{mode === 'admin' ? 'Admin Access' : 'Continue'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            {mode === 'user' 
              ? 'Users can view data and add members but cannot manage villages or export data.' 
              : 'Admins have full control over villages, members, and data exports.'}
          </p>
          
          <div className="mt-6 flex flex-col gap-2">
            <button 
              onClick={() => dataService.setDemo(true)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors border border-slate-200 rounded-lg hover:border-brand-200 hover:bg-brand-50"
            >
              Try Demo Mode (Local Storage)
            </button>
          </div>

          {mode === 'admin' && (
            <div className="mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100 text-center text-[10px]">
              <p className="font-bold text-slate-900">Demo Admin Credentials</p>
              <p className="text-slate-500">Email: admin@census.com | Pass: admin123</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
