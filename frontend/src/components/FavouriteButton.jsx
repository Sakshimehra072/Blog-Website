'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { toggleFavouriteApi, isBlogSavedLocally } from '../services/favouriteService';

export default function FavouriteButton({ blogId = 1, isSaved = false, onToggle, showToast = true }) {
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (blogId) {
      const locallySaved = isBlogSavedLocally(blogId);
      setSaved(isSaved || locallySaved);
    }
  }, [blogId, isSaved]);

  useEffect(() => {
    const handleSavedEvent = (e) => {
      if (e?.detail && Number(e.detail.blogId) === Number(blogId)) {
        setSaved(e.detail.isSaved);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('saved_blogs_updated', handleSavedEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('saved_blogs_updated', handleSavedEvent);
      }
    };
  }, [blogId]);

  const triggerToast = (msg) => {
    if (!showToast) return;
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handleToggle = async (e) => {
    if (e) e.stopPropagation();
    
    // Instant optimistic UI update
    const nextState = !saved;
    setSaved(nextState);

    if (nextState) {
      triggerToast('Article saved to reading list');
    } else {
      triggerToast('Article removed from saved list');
    }

    setLoading(true);
    const res = await toggleFavouriteApi(blogId);
    setLoading(false);

    if (res && typeof res.isSaved === 'boolean') {
      setSaved(res.isSaved);
      if (onToggle) onToggle(res.isSaved);
    } else {
      if (onToggle) onToggle(nextState);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`p-1.5 rounded-md text-xs transition-all duration-150 shadow-2xs ${
          saved
            ? 'bg-amber-50 text-[#ff9432] border border-[#ff9432]/60 ring-1 ring-[#ff9432]/30'
            : 'bg-slate-100/90 text-slate-600 border border-slate-300 hover:text-slate-900 hover:border-slate-400'
        }`}
        title={saved ? "Remove from Saved Blogs" : "Save Blog"}
        aria-label={saved ? "Remove from Saved Blogs" : "Save Blog"}
      >
        <Bookmark className={`w-3.5 h-3.5 transition-transform duration-150 ${saved ? 'fill-[#ff9432] text-[#ff9432] scale-105' : ''}`} />
      </button>

      {/* Light Theme Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ff9432] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
