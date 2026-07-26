'use client';

import React, { useEffect, useState } from 'react';
import { X, Lock, Phone, User, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePhone, validateUsername, validatePassword } from '../utils/validation';

export default function Modal({ isOpen, onClose, title, children }) {
  const { sendOtp, verifyOtp, register, login, googleLogin } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('+15550192834');
  const [otpCode, setOtpCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

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
    setDevOtpHint('');
    setLoading(false);
  };

  const handleTabSwitch = (mode) => {
    setAuthMode(mode);
    resetFormState();
    setOtpSent(false);
  };

  // 1. Password Login Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    resetFormState();

    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) return setErrorMsg(phoneErr);

    const passErr = validatePassword(password);
    if (passErr) return setErrorMsg(passErr);

    setLoading(true);
    try {
      const res = await login(phoneNumber, password);
      setSuccessMsg(res.message || 'Login successful!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Manual Registration Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    resetFormState();

    const userErr = validateUsername(username);
    if (userErr) return setErrorMsg(userErr);

    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) return setErrorMsg(phoneErr);

    const passErr = validatePassword(password);
    if (passErr) return setErrorMsg(passErr);

    setLoading(true);
    try {
      const res = await register(username, phoneNumber, password);
      setSuccessMsg(res.message || 'Registration successful!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Twilio Mobile OTP Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetFormState();

    const phoneErr = validatePhone(phoneNumber);
    if (phoneErr) return setErrorMsg(phoneErr);

    setLoading(true);
    try {
      const res = await sendOtp(phoneNumber);
      setOtpSent(true);
      setSuccessMsg(res.message || 'OTP sent via Twilio!');
      if (res.otp) {
        setDevOtpHint(`Dev Mode Test Code: ${res.otp}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!otpCode || otpCode.trim().length !== 6) {
      return setErrorMsg('Please enter a 6-digit OTP code.');
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phoneNumber, otpCode);
      setSuccessMsg(res.message || 'Mobile OTP verified!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Google Login Handler
  const handleGoogleLogin = async () => {
    resetFormState();
    setLoading(true);
    try {
      const dummyGoogleUser = {
        google_id: `g_${Date.now()}`,
        name: 'Google User',
        email: `googleuser_${Math.floor(Math.random() * 1000)}@gmail.com`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      };
      const res = await googleLogin(dummyGoogleUser);
      setSuccessMsg(res.message || 'Signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/70 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {title || (authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Twilio Mobile OTP')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children || (
          <div className="space-y-4">
            
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('otp')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'otp' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Dev OTP Code Hint */}
            {devOtpHint && (
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono text-center font-bold">
                {devOtpHint}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-all active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="h-px bg-slate-800 flex-1" />
              <span>OR</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* TAB 1: Password Login */}
            {authMode === 'login' && (
              <form className="space-y-3" onSubmit={handlePasswordLogin}>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+15550192834"
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs gradient-btn flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* TAB 2: Registration Form */}
            {authMode === 'register' && (
              <form className="space-y-3" onSubmit={handleRegister}>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alexmorgan"
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+15550192834"
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password (min 6 characters)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs gradient-btn flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* TAB 3: Mobile OTP Form */}
            {authMode === 'otp' && (
              <form className="space-y-3" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+15550192834"
                      disabled={otpSent}
                      className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Enter 6-Digit Verification OTP</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white tracking-widest focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs gradient-btn flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : otpSent ? (
                    <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Send Twilio OTP SMS <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
