'use client';

import React from 'react';
import SubscribeButton from './SubscribeButton';
import { Sparkles, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/90 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* About Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff9432] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Blog<span className="text-[#ff9432]">Verse</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pr-4 max-w-sm font-normal">
              An independent publishing network for thoughtful writers, developers, and creators sharing deep perspectives on tech, code, design, and culture.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-[#ff9432] transition-colors">Home</a></li>
              <li><a href="#blogs" className="hover:text-[#ff9432] transition-colors">Featured Stories</a></li>
              <li><a href="/saved" className="hover:text-[#ff9432] transition-colors">Saved Reading List</a></li>
              <li><a href="/write" className="hover:text-[#ff9432] transition-colors">Write an Article</a></li>
            </ul>
          </div>

          {/* Topics Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Topics</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#categories" className="hover:text-[#ff9432] transition-colors">Technology & AI</a></li>
              <li><a href="#categories" className="hover:text-[#ff9432] transition-colors">Software Architecture</a></li>
              <li><a href="#categories" className="hover:text-[#ff9432] transition-colors">Design & Product</a></li>
              <li><a href="#categories" className="hover:text-[#ff9432] transition-colors">Culture & Ideas</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-slate-500">Get top stories delivered directly to your inbox weekly.</p>
            <div className="pt-1">
              <SubscribeButton compact />
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BlogVerse Publishing Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
