'use client';

import React, { useState } from 'react';
import { Bookmark, CheckCircle2, Trash2 } from 'lucide-react';
import { toggleFavouriteApi } from '../services/favouriteService';

export default function FavouriteButton({ blogId = 1, isSaved = false, onToggle, showToast = true }) {
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    if (!showToast) return;
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleToggle = async (e) => {
    if (e) e.stopPropagation();
    setLoading(true);

    const nextState = !saved;
    setSaved(nextState);

    const res = await toggleFavouriteApi(blogId);
    setLoading(false);

    const isNowSaved = (res && res.success) ? res.isSaved : nextState;
    setSaved(isNowSaved);

    if (isNowSaved) {
      triggerToast('✅ Blog saved successfully.');
    } else {
      triggerToast('✅ Blog removed from Saved Blogs.');
    }

    if (onToggle) onToggle(isNowSaved);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-xl text-xs transition-all duration-200 ${
          saved
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
            : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
        }`}
        title={saved ? "Remove from Saved Blogs" : "Save Blog"}
      >
        <Bookmark className={`w-4 h-4 ${saved ? 'fill-indigo-500 text-indigo-400 animate-bounce' : ''}`} />
      </button>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl glass-panel border border-indigo-500/40 bg-slate-950/90 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
