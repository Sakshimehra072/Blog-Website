'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, Heart, Settings, LogOut, PenSquare, ShieldCheck } from 'lucide-react';

export default function ProfileDropdown({ user = null, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Demo fallback user if not signed in
  const currentUser = user || {
    name: 'Alex Morgan',
    username: '@alexm',
    avatar: null,
    isLoggedIn: false
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full border border-slate-700/80 bg-slate-900/60 hover:border-indigo-500/50 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {currentUser.name ? currentUser.name.charAt(0) : 'U'}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-700/60">
            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-400">{currentUser.username}</p>
          </div>

          <div className="py-1">
            <a href="/write" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors">
              <PenSquare className="w-4 h-4 text-indigo-400" /> Write Story
            </a>
            <a href="/saved" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors">
              <Bookmark className="w-4 h-4 text-purple-400" /> Saved Blogs
            </a>
            <a href="#liked" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors">
              <Heart className="w-4 h-4 text-pink-400" /> Liked Posts
            </a>
            <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors">
              <User className="w-4 h-4 text-emerald-400" /> Profile
            </a>
          </div>

          <div className="border-t border-slate-700/60 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
