'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { likeBlogApi } from '../services/blogService';
import { getSocket } from '../services/socketService';

export default function LikeButton({ blogId, initialLikes = 0, onLike }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);

  useEffect(() => {
    setCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (!blogId) return;
    const socket = getSocket();

    const handleBlogLiked = (data) => {
      if (Number(data.blogId) === Number(blogId)) {
        if (typeof data.likesCount === 'number') {
          setCount(data.likesCount);
        }
      }
    };

    socket.on('blog:liked', handleBlogLiked);
    return () => {
      socket.off('blog:liked', handleBlogLiked);
    };
  }, [blogId]);

  const toggleLike = async (e) => {
    if (e) e.stopPropagation();
    const nextState = !liked;
    setLiked(nextState);
    setCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (blogId) {
      const res = await likeBlogApi(blogId);
      if (res && res.success) {
        setLiked(res.liked);
        if (typeof res.likesCount === 'number') {
          setCount(res.likesCount);
        }
      }
    }

    if (onLike) onLike(nextState);
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors duration-150 ${
        liked
          ? 'bg-rose-50 text-rose-600 border border-rose-200'
          : 'bg-slate-100/90 text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300'
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
      <span>{count}</span>
    </button>
  );
}
