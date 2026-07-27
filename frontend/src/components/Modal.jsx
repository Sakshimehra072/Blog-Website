'use client';

import React, { useEffect, useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateFullName, validatePassword } from '../utils/validation';

export default function Modal({ isOpen, onClose, initialMode = 'login', title, message, redirectUrl, children }) {
  const { register, login } = useAuth();

  const [authMode, setAuthMode] = useState(initialMode || 'login');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Name or Email for Sign In
  const [email, setEmail] = useState(''); // Email for Sign Up
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
    setShowPassword(false);
  };

  const handleTabSwitch = (mode) => {
    setAuthMode(mode);
    resetFormState();
  };

  const handleSuccessRedirect = () => {
    setTimeout(() => {
      onClose();
      const targetUrl = redirectUrl || '/write';
      if (typeof window !== 'undefined') {
        window.location.href = targetUrl;
      }
    }, 700);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!identifier || !identifier.trim()) {
      return setErrorMsg('Please enter your Name or Email Address.');
    }

    const passErr = validatePassword(password);
    if (passErr) return setErrorMsg(passErr);

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      setSuccessMsg(res.message || 'Signed in successfully!');
      handleSuccessRedirect();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid name/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    resetFormState();

    const nameErr = validateFullName(fullName);
    if (nameErr) return setErrorMsg(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) return setErrorMsg(emailErr);

    const passErr = validatePassword(password);
    if (passErr) return setErrorMsg(passErr);

    setLoading(true);
    try {
      const res = await register(fullName, email, password);
      setSuccessMsg(res.message || 'Account created successfully!');
      handleSuccessRedirect();
    } catch (err) {
      setErrorMsg(err.message || 'Account creation failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 text-slate-900">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {title || (authMode === 'login' ? 'Sign In to BlogVerse' : 'Create an Account')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children || (
          <div className="space-y-4">
            
            {/* Action Notice Message */}
            {message && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-[#ff9432] shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2 rounded-md transition-all ${
                  authMode === 'login' ? 'bg-[#ff9432] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-2 rounded-md transition-all ${
                  authMode === 'register' ? 'bg-[#ff9432] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form className="space-y-3.5" onSubmit={handleSignIn}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name or Email Address</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="username or email@example.com"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form className="space-y-3.5" onSubmit={handleSignUp}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center justify-center gap-1.5 transition-all shadow-xs mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
