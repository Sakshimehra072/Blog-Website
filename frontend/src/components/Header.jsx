'use client';

import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, PenTool, Bookmark, BookOpen, Home as HomeIcon } from 'lucide-react';

export default function Header({ onOpenAuthModal, onFocusSearch }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Blog<span className="gradient-text">Verse</span>
              </span>
            </a>
          </div>

          {/* Desktop SearchBar */}
          <div className="hidden lg:block max-w-xs w-full">
            <SearchBar />
          </div>

          {/* Desktop Horizontal Navbar */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="/" className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <HomeIcon className="w-4 h-4 text-indigo-400" /> Home
              </a>
              <a href="#blogs" className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <BookOpen className="w-4 h-4 text-purple-400" /> Blogs
              </a>
              <a href="/saved" className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Bookmark className="w-4 h-4 text-pink-400" /> Saved Blogs
              </a>
              <a 
                href="/write" 
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    onOpenAuthModal();
                  }
                }}
                className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <PenTool className="w-4 h-4 text-emerald-400" /> Write Blog
              </a>
            </nav>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-5">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden xl:inline">Profile:</span>
                  <ProfileDropdown user={user} onLogout={logout} />
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-5 py-2 rounded-xl text-sm font-semibold gradient-btn"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <SearchBar />
          <nav className="flex flex-col space-y-3 pt-2 text-sm font-medium text-slate-200">
            <a 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors py-1"
            >
              <HomeIcon className="w-4 h-4 text-indigo-400" /> Home
            </a>
            <a 
              href="#blogs" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors py-1"
            >
              <BookOpen className="w-4 h-4 text-purple-400" /> Blogs
            </a>
            <a 
              href="#favourites" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors py-1"
            >
              <Bookmark className="w-4 h-4 text-pink-400" /> Favourites
            </a>
            <a 
              href="#write" 
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (!isLoggedIn) {
                  e.preventDefault();
                  onOpenAuthModal();
                }
              }}
              className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors py-1"
            >
              <PenTool className="w-4 h-4 text-emerald-400" /> Write Blog
            </a>
          </nav>
          
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            {isLoggedIn ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-300">Logged in as {user?.username}</span>
                <ProfileDropdown user={user} onLogout={logout} />
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold gradient-btn"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
