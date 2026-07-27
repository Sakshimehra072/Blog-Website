'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, Reply, Check } from 'lucide-react';
import { fetchCommentsApi, addCommentApi, editCommentApi, deleteCommentApi } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socketService';

export default function CommentSection({ blogId = 1, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotalCount = (list) => {
    let count = 0;
    list.forEach(item => {
      count++;
      if (item.replies && item.replies.length > 0) {
        count += calculateTotalCount(item.replies);
      }
    });
    return count;
  };

  const loadComments = async () => {
    const res = await fetchCommentsApi(blogId);
    if (res && res.success && Array.isArray(res.comments)) {
      setComments(res.comments);
      if (onCountChange) onCountChange(calculateTotalCount(res.comments));
    } else {
      setComments([]);
      if (onCountChange) onCountChange(0);
    }
  };

  useEffect(() => {
    loadComments();
  }, [blogId]);

  // Real-Time Socket Listener for Live Comments
  useEffect(() => {
    if (!blogId) return;
    const socket = getSocket();

    const handleCommentAdded = (data) => {
      if (String(data.blogId) === String(blogId)) {
        loadComments();
      }
    };

    socket.on('comment:added', handleCommentAdded);
    return () => {
      socket.off('comment:added', handleCommentAdded);
    };
  }, [blogId]);

  const updateCountNotify = (list) => {
    const total = calculateTotalCount(list);
    if (onCountChange) onCountChange(total);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setLoading(true);
    const authorName = user?.name || user?.username || 'Reader';
    const authorAvatar = user?.avatar_url || user?.avatar || null;

    const res = await addCommentApi({ blogId, text: newText.trim(), authorName, authorAvatar });
    setLoading(false);

    if (res && res.success) {
      setNewText('');
      loadComments();
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    const authorName = user?.name || user?.username || 'Reader';
    const authorAvatar = user?.avatar_url || user?.avatar || null;

    const res = await addCommentApi({ blogId, text: replyText.trim(), parentId, authorName, authorAvatar });

    if (res && res.success) {
      setReplyingId(null);
      setReplyText('');
      loadComments();
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    await editCommentApi(commentId, editText.trim());
    setEditingId(null);
    setEditText('');
    loadComments();
  };

  const handleDelete = async (commentId) => {
    await deleteCommentApi(commentId);
    loadComments();
  };

  const CommentItem = ({ item, isReply = false }) => {
    const isEditing = editingId === item.id;
    const isReplying = replyingId === item.id;
    const authorName = item.author_name || 'Reader';
    const authorAvatar = item.author_avatar;
    const firstLetter = authorName.trim().charAt(0).toUpperCase() || 'R';

    return (
      <div className={`p-4 rounded-xl bg-white border border-slate-200/90 space-y-2.5 ${isReply ? 'ml-5 sm:ml-8 border-l-2 border-l-[#ff9432]' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#ff9432] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                {firstLetter}
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-slate-900">{authorName}</span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplyingId(replyingId === item.id ? null : item.id);
                setReplyText('');
              }}
              className="text-xs text-slate-600 hover:text-[#ff9432] flex items-center gap-1 font-medium"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>

            {user && (
              <>
                <button
                  onClick={() => {
                    setEditingId(editingId === item.id ? null : item.id);
                    setEditText(item.text);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700"
                  title="Edit comment"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-slate-400 hover:text-rose-600"
                  title="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-slate-50 border border-[#ff9432] rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(item.id)}
                className="px-3 py-1 rounded-md text-xs bg-[#ff9432] hover:bg-[#e88325] text-white font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed pl-1 font-normal">{item.text}</p>
        )}

        {isReplying && (
          <div className="pt-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to ${authorName}...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-20 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff9432] focus:bg-white"
              />
              <button
                onClick={() => handleAddReply(item.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-xs font-medium bg-[#ff9432] hover:bg-[#e88325] text-white"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {item.replies && item.replies.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {item.replies.map(reply => (
              <CommentItem key={reply.id} item={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="bg-slate-50/70 rounded-xl p-6 sm:p-8 border border-slate-200/90 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#ff9432]" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Discussion ({calculateTotalCount(comments)})</h3>
        </div>
      </div>

      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Share your thoughts on this article..."
          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] resize-none shadow-xs"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white transition-all flex items-center gap-2 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </div>
      </form>

      <div className="space-y-3 pt-1">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} item={comment} />
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-4">No comments yet. Start the conversation!</p>
        )}
      </div>
    </section>
  );
}
