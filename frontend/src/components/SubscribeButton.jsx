'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Check, Loader2, UserPlus } from 'lucide-react';
import { toggleSubscribeApi, fetchSubscriberCountApi } from '../services/subscriptionService';

export default function SubscribeButton({ authorId = 'author_john_smith', compact = false, initialCount = 124 }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    async function loadCount() {
      if (authorId) {
        const res = await fetchSubscriberCountApi(authorId);
        if (res.success && res.subscriberCount > 0) {
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

    if (res.success) {
      setSubscribed(res.isSubscribed);
      if (typeof res.subscriberCount === 'number') {
        setCount(res.subscriberCount);
      } else {
        setCount(prev => (res.isSubscribed ? prev + 1 : prev - 1));
      }
    } else {
      // Local toggle fallback
      setSubscribed(prev => !prev);
      setCount(prev => (subscribed ? prev - 1 : prev + 1));
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
          subscribed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'gradient-btn'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : subscribed ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Subscribed ({count})
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5 text-white" /> Subscribe ({count})
          </>
        )}
      </button>
    );
  }

  return (
    <form onSubmit={handleToggle} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email for updates"
          disabled={subscribed}
          className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-w-[110px] ${
          subscribed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'gradient-btn'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : subscribed ? (
          <>
            <Check className="w-3.5 h-3.5" /> Subscribed ({count})
          </>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
}
