'use client';

import React from 'react';
import SubscribeButton from './SubscribeButton';
import { Sparkles, Twitter, Github, Linkedin, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* 1. About Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Blog<span className="gradient-text">Verse</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              BlogVerse is a modern, full-stack blogging platform empowering readers, creators, and thinkers to share knowledge, like, comment, bookmark, and subscribe to their favorite authors worldwide.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-indigo-400 transition-colors">Home</a></li>
              <li><a href="#blogs" className="hover:text-indigo-400 transition-colors">Latest Blogs</a></li>
              <li><a href="#favourites" className="hover:text-indigo-400 transition-colors">Saved Favourites</a></li>
              <li><a href="#write" className="hover:text-indigo-400 transition-colors">Write a Blog</a></li>
              <li><a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* 3. Categories Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#tech" className="hover:text-indigo-400 transition-colors">Technology & AI</a></li>
              <li><a href="#programming" className="hover:text-indigo-400 transition-colors">Programming</a></li>
              <li><a href="#business" className="hover:text-indigo-400 transition-colors">Business & Finance</a></li>
              <li><a href="#travel" className="hover:text-indigo-400 transition-colors">Travel & Lifestyle</a></li>
              <li><a href="#gaming" className="hover:text-indigo-400 transition-colors">Gaming & Science</a></li>
            </ul>
          </div>

          {/* 4. Contact Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>support@blogverse.com</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>+1 (800) 555-BLOG</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>San Francisco, CA 94107</span>
              </li>
            </ul>
            
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] text-slate-400">Subscribe for weekly updates:</p>
              <SubscribeButton compact />
            </div>
          </div>

        </div>

        {/* 5. Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BlogVerse Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for blog creators
          </p>
        </div>
      </div>
    </footer>
  );
}
