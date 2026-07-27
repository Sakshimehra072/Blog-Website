'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Check, Loader2, UserPlus } from 'lucide-react';
import { toggleSubscribeApi, fetchSubscriberCountApi } from '../services/subscriptionService';

export default function SubscribeButton({ authorId = 'author_john_smith', compact = false, initialCount = 0 }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    async function loadCount() {
      if (authorId) {
        const res = await fetchSubscriberCountApi(authorId);
        if (res && res.success && typeof res.subscriberCount === 'number') {
          setCount(res.subscriberCount);
        }
      }
    }
    loadCount();
  }, [authorId]);

  const handleToggle = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    const res = await toggleSubscribeApi(authorId);
    setLoading(false);

    if (res && res.success) {
      setSubscribed(res.isSubscribed);
      if (typeof res.subscriberCount === 'number') {
        setCount(res.subscriberCount);
      } else {
        setCount(prev => (res.isSubscribed ? prev + 1 : Math.max(0, prev - 1)));
      }
    } else {
      setSubscribed(prev => !prev);
      setCount(prev => (subscribed ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
          subscribed
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : 'bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : subscribed ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Subscribed {count > 0 ? `(${count})` : ''}
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" /> Follow {count > 0 ? `(${count})` : ''}
          </>
        )}
      </button>
    );
  }

  return (
    <form onSubmit={handleToggle} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={subscribed}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 ${
          subscribed
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : 'bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : subscribed ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Subscribed
          </>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
}
