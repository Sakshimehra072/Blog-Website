'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Edit3, BookOpen, Bookmark, LogOut } from 'lucide-react';

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

  const displayName = user?.name || user?.username || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const avatarUrl = user?.avatar_url || user?.avatar;
  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full border border-slate-200 bg-white hover:border-[#ff9432] transition-all focus:outline-none p-0.5"
        aria-label="User Profile Menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#ff9432] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {firstLetter}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150 text-slate-800">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
          </div>

          <div className="py-1 text-xs font-medium space-y-0.5">
            <a 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-amber-50/70 hover:text-[#ff9432] transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" /> View Profile
            </a>
            
            <a 
              href="/profile?edit=true" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-amber-50/70 hover:text-[#ff9432] transition-colors"
            >
              <Edit3 className="w-4 h-4 text-slate-400" /> Edit Profile
            </a>

            <a 
              href="/my-blogs" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-amber-50/70 hover:text-[#ff9432] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400" /> My Blogs
            </a>

            <a 
              href="/saved" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-amber-50/70 hover:text-[#ff9432] transition-colors"
            >
              <Bookmark className="w-4 h-4 text-slate-400" /> Saved Blogs
            </a>
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
