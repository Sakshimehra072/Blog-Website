'use client';

import React, { useState } from 'react';
import { Share2, Check, CheckCircle2 } from 'lucide-react';

export default function ShareButton({ title = 'BlogVerse Story', url = '' }) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2200);
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title || 'BlogVerse Article',
          text: `Check out this article on BlogVerse: ${title}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        triggerToast('Article link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        triggerToast('Article link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleShare}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100/90 text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300'
        }`}
        title="Share Article Link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </>
        )}
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
