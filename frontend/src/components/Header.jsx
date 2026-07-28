'use client';

import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { Menu, X, PenTool, Bookmark, BookOpen, Home as HomeIcon, Sparkles, LogIn, UserPlus, FolderEdit } from 'lucide-react';

export default function Header({ onOpenAuthModal, onFocusSearch }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  const handleOpenLogin = () => {
    if (onOpenAuthModal) onOpenAuthModal('login');
  };

  const handleOpenRegister = () => {
    if (onOpenAuthModal) onOpenAuthModal('register');
  };

  const handleWriteClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      if (onOpenAuthModal) {
        onOpenAuthModal('login', 'Please sign in or create an account to write and publish a blog.', '/write');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#ff9432] flex items-center justify-center text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                Blog<span className="text-[#ff9432] font-semibold">Verse</span>
              </span>
            </a>
          </div>

          {/* Desktop SearchBar */}
          <div className="hidden lg:block max-w-xs w-full">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/" className="flex items-center gap-1.5 hover:text-[#ff9432] transition-colors text-slate-900">
                <HomeIcon className="w-4 h-4 text-slate-500" /> Home
              </a>
              
              <a href="/blogs" className="flex items-center gap-1.5 hover:text-[#ff9432] transition-colors text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-500" /> Blogs
              </a>

              <a 
                href="/write" 
                onClick={handleWriteClick}
                className="flex items-center gap-1.5 hover:text-[#ff9432] transition-colors text-slate-600"
              >
                <PenTool className="w-4 h-4 text-slate-500" /> Write Blog
              </a>

              {isLoggedIn && (
                <>
                  <a href="/my-blogs" className="flex items-center gap-1.5 hover:text-[#ff9432] transition-colors text-slate-600">
                    <FolderEdit className="w-4 h-4 text-slate-500" /> My Blogs
                  </a>

                  <a href="/saved" className="flex items-center gap-1.5 hover:text-[#ff9432] transition-colors text-slate-600">
                    <Bookmark className="w-4 h-4 text-slate-500" /> Saved Blogs
                  </a>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              {isLoggedIn ? (
                <ProfileDropdown user={user} onLogout={logout} />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenLogin}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" /> Sign In
                  </button>

                  <button
                    onClick={handleOpenRegister}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in fade-in duration-150 shadow-md">
          <SearchBar />
          
          <nav className="flex flex-col space-y-2.5 pt-2 text-sm font-medium text-slate-700">
            <a 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-1.5 hover:text-[#ff9432] transition-colors text-slate-900 font-semibold"
            >
              <HomeIcon className="w-4 h-4 text-[#ff9432]" /> Home
            </a>

            <a 
              href="/blogs" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-1.5 hover:text-[#ff9432] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" /> Blogs
            </a>

            <a 
              href="/write" 
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleWriteClick(e);
              }}
              className="flex items-center gap-2.5 py-1.5 hover:text-[#ff9432] transition-colors"
            >
              <PenTool className="w-4 h-4 text-slate-500" /> Write Blog
            </a>

            {isLoggedIn && (
              <>
                <a 
                  href="/my-blogs" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 hover:text-[#ff9432] transition-colors"
                >
                  <FolderEdit className="w-4 h-4 text-slate-500" /> My Blogs
                </a>

                <a 
                  href="/saved" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 hover:text-[#ff9432] transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-slate-500" /> Saved Blogs
                </a>
              </>
            )}
          </nav>
          
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            {isLoggedIn ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-700">{user?.name || user?.username}</span>
                <ProfileDropdown user={user} onLogout={logout} />
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenLogin();
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenRegister();
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
