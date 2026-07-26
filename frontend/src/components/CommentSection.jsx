'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, Reply, Check, X, CornerDownRight, User } from 'lucide-react';
import { fetchCommentsApi, addCommentApi, editCommentApi, deleteCommentApi } from '../services/commentService';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ blogId = 1, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  // Default mock initial comments
  const defaultComments = [
    {
      id: 1,
      blog_id: String(blogId),
      author_name: 'Elena Rostova',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Outstanding article! The breakdown of Next.js with Express and MySQL performance is super helpful.',
      created_at: 'July 24, 2026',
      replies: [
        {
          id: 2,
          blog_id: String(blogId),
          author_name: 'Marcus Chen',
          author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          text: 'Agreed! The connection pool settings really make a difference.',
          created_at: 'July 25, 2026',
          replies: []
        }
      ]
    }
  ];

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

  useEffect(() => {
    async function loadComments() {
      const res = await fetchCommentsApi(blogId);
      if (res && res.success && res.comments && res.comments.length > 0) {
        setComments(res.comments);
        if (onCountChange) onCountChange(calculateTotalCount(res.comments));
      } else {
        setComments(defaultComments);
        if (onCountChange) onCountChange(calculateTotalCount(defaultComments));
      }
    }
    loadComments();
  }, [blogId]);

  const updateCountNotify = (list) => {
    const total = calculateTotalCount(list);
    if (onCountChange) onCountChange(total);
  };

  // Add Top Level Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setLoading(true);
    const authorName = user?.username || 'Guest Reader';
    const authorAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const res = await addCommentApi({ blogId, text: newText.trim(), authorName, authorAvatar });
    setLoading(false);

    const newCommentObj = (res && res.success && res.comment) ? res.comment : {
      id: Date.now(),
      blog_id: String(blogId),
      author_name: authorName,
      author_avatar: authorAvatar,
      text: newText.trim(),
      created_at: 'Just now',
      replies: []
    };

    const updated = [newCommentObj, ...comments];
    setComments(updated);
    setNewText('');
    updateCountNotify(updated);
  };

  // Add Reply
  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    const authorName = user?.username || 'Guest Reader';
    const authorAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const res = await addCommentApi({ blogId, text: replyText.trim(), parentId, authorName, authorAvatar });

    const replyObj = (res && res.success && res.comment) ? res.comment : {
      id: Date.now(),
      blog_id: String(blogId),
      author_name: authorName,
      author_avatar: authorAvatar,
      text: replyText.trim(),
      created_at: 'Just now',
      replies: []
    };

    const addReplyRecursive = (list) => {
      return list.map(item => {
        if (Number(item.id) === Number(parentId)) {
          return { ...item, replies: [...(item.replies || []), replyObj] };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: addReplyRecursive(item.replies) };
        }
        return item;
      });
    };

    const updated = addReplyRecursive(comments);
    setComments(updated);
    setReplyingId(null);
    setReplyText('');
    updateCountNotify(updated);
  };

  // Edit Comment
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    await editCommentApi(commentId, editText.trim());

    const updateRecursive = (list) => {
      return list.map(item => {
        if (Number(item.id) === Number(commentId)) {
          return { ...item, text: editText.trim() };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: updateRecursive(item.replies) };
        }
        return item;
      });
    };

    const updated = updateRecursive(comments);
    setComments(updated);
    setEditingId(null);
    setEditText('');
  };

  // Delete Comment
  const handleDelete = async (commentId) => {
    await deleteCommentApi(commentId);

    const deleteRecursive = (list) => {
      return list.filter(item => Number(item.id) !== Number(commentId)).map(item => {
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: deleteRecursive(item.replies) };
        }
        return item;
      });
    };

    const updated = deleteRecursive(comments);
    setComments(updated);
    updateCountNotify(updated);
  };

  // Recursive Comment Component Item
  const CommentItem = ({ item, isReply = false }) => {
    const isEditing = editingId === item.id;
    const isReplying = replyingId === item.id;

    return (
      <div className={`p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 ${isReply ? 'ml-6 sm:ml-10 border-l-2 border-l-indigo-500/50' : ''}`}>

        {/* Comment Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {item.author_avatar ? (
              <img src={item.author_avatar} alt={item.author_name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-slate-100">{item.author_name}</span>
              <span className="text-[10px] text-slate-400 block">{item.created_at}</span>
            </div>
          </div>

          {/* Action Buttons: Edit & Delete */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplyingId(replyingId === item.id ? null : item.id);
                setReplyText('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>

            <button
              onClick={() => {
                setEditingId(editingId === item.id ? null : item.id);
                setEditText(item.text);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              title="Edit comment"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDelete(item.id)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comment Text / Edit Input */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-slate-950 border border-indigo-500 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(item.id)}
                className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed pl-1">{item.text}</p>
        )}

        {/* Reply Input Box */}
        {isReplying && (
          <div className="pt-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to ${item.author_name}...`}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3 pr-20 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAddReply(item.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-semibold gradient-btn"
              >
                Post Reply
              </button>
            </div>
          </div>
        )}

        {/* Child Replies */}
        {item.replies && item.replies.length > 0 && (
          <div className="space-y-3 pt-2">
            {item.replies.map(reply => (
              <CommentItem key={reply.id} item={reply} isReply={true} />
            ))}
          </div>
        )}

      </div>
    );
  };

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">

      {/* Header with Comment Count */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">Comments ({calculateTotalCount(comments)})</h3>
        </div>
      </div>

      {/* New Top Level Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Share your thoughts or feedback on this article..."
          className="w-full bg-slate-900 border border-slate-700/70 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold gradient-btn flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.map((comment) => (
          <CommentItem key={comment.id} item={comment} />
        ))}
      </div>

    </section>
  );
}
