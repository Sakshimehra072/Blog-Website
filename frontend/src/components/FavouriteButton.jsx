'use client';

import React, { useState } from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
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
    }, 2200);
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
      triggerToast('Article saved to your reading list');
    } else {
      triggerToast('Article removed from saved list');
    }

    if (onToggle) onToggle(isNowSaved);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`p-1.5 rounded-md text-xs transition-colors duration-150 ${
          saved
            ? 'bg-amber-50 text-[#ff9432] border border-[#ff9432]/40'
            : 'bg-slate-100/90 text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300'
        }`}
        title={saved ? "Remove from Saved" : "Save Article"}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#ff9432] text-[#ff9432]' : ''}`} />
      </button>

      {/* Light Theme Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ff9432] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
