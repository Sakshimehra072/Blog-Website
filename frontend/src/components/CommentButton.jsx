'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { getSocket } from '../services/socketService';

export default function CommentButton({ blogId, count = 0, onClick }) {
  const [commentCount, setCommentCount] = useState(count);

  useEffect(() => {
    setCommentCount(count);
  }, [count]);

  useEffect(() => {
    if (!blogId) return;
    const socket = getSocket();

    const handleCommentAdded = (data) => {
      if (String(data.blogId) === String(blogId)) {
        setCommentCount(prev => prev + 1);
      }
    };

    socket.on('comment:added', handleCommentAdded);
    return () => {
      socket.off('comment:added', handleCommentAdded);
    };
  }, [blogId]);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-300 hover:text-slate-900 hover:border-slate-400 transition-colors duration-150 shadow-2xs"
    >
      <MessageSquare className="w-3.5 h-3.5 text-[#ff9432]" />
      <span className="font-bold text-xs">{commentCount}</span>
    </button>
  );
}
