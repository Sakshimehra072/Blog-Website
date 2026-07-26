'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ initialLikes = 0, onLike }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);

  const toggleLike = () => {
    const nextState = !liked;
    setLiked(nextState);
    setCount(prev => (nextState ? prev + 1 : prev - 1));
    if (onLike) onLike(nextState);
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        liked
          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500 animate-bounce' : ''}`} />
      <span>{count}</span>
    </button>
  );
}
