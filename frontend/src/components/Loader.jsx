'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = "Loading BlogVerse..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-indigo-400 absolute animate-pulse" />
      </div>
      {text && <p className="text-xs text-slate-400 font-medium tracking-wide">{text}</p>}
    </div>
  );
}
