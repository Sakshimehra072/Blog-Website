'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, CheckCircle2 } from 'lucide-react';

export default function ShareButton({ title = 'BlogVerse Story', url = '' }) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // 1. Try Browser Native Share Functionality
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title || 'BlogVerse Article',
          text: `Check out this blog on BlogVerse: ${title}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if user cancels or browser rejects native share
      }
    }
    
    // 2. Fallback: Copy blog link to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        triggerToast('✅ Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        // Legacy fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        triggerToast('✅ Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleShare}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
          copied
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
            : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
        }`}
        title="Share or Copy Blog Link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span className="text-emerald-400 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Share</span>
          </>
        )}
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
