'use client';

import React from 'react';
import { Sparkles, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-300 bg-white text-slate-600 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff9432] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Blog<span className="text-[#ff9432]">Verse</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md font-normal">
              An independent publishing network for thoughtful writers, developers, and creators.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/Sakshimehra072" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub Profile" 
              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#ff9432] hover:border-[#ff9432] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/sakshi-mehra-b91ab024b" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn Profile" 
              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#ff9432] hover:border-[#ff9432] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BlogVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
