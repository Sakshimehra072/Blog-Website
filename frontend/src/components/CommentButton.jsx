'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { getSocket } from '../services/socketService';
import { fetchCommentsApi } from '../services/commentService';

function countAllComments(list) {
  if (!Array.isArray(list)) return 0;
  let total = 0;
  list.forEach(item => {
    total += 1;
    if (Array.isArray(item.replies) && item.replies.length > 0) {
      total += countAllComments(item.replies);
    }
  });
  return total;
}

export default function CommentButton({ blogId, count = 0, onClick }) {
  const [commentCount, setCommentCount] = useState(count);

  useEffect(() => {
    setCommentCount(count);
  }, [count]);

  // Fetch real database comments count
  useEffect(() => {
    if (!blogId) return;
    let isMounted = true;

    async function loadRealCount() {
      const res = await fetchCommentsApi(blogId);
      if (res && res.success && Array.isArray(res.comments)) {
        const total = countAllComments(res.comments);
        if (isMounted) {
          setCommentCount(total);
        }
      }
    }

    loadRealCount();
    return () => { isMounted = false; };
  }, [blogId]);

  // Real-Time Socket Listener for Live Comment Updates
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
