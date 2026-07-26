'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function CommentButton({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-all duration-200"
    >
      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
      <span>{count}</span>
    </button>
  );
}
