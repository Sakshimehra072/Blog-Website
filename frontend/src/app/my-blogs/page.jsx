'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchBlogsApi, deleteBlogApi } from '../../services/blogService';
import { getSocket } from '../../services/socketService';
import { 
  BookOpen, 
  PenTool, 
  FolderEdit, 
  Loader2, 
  Trash2, 
  CheckSquare, 
  Square, 
  X, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function MyBlogsPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk Selection & Deletion States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBlogIds, setSelectedBlogIds] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccessToast, setDeleteSuccessToast] = useState('');

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const loadMyBlogs = async () => {
    setLoading(true);
    const res = await fetchBlogsApi(null, 1, 100);
    if (res && res.success && Array.isArray(res.data)) {
      const userArticles = res.data.filter(b => 
        (user && b.author && String(b.author.id) === String(user.id)) ||
        (user && b.author && b.author.name === (user.name || user.username))
      );
      // Sort latest first
      userArticles.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      setMyBlogs(userArticles);
    } else {
      setMyBlogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMyBlogs();
  }, [user]);

  // Real-Time Socket Listener for Instant My-Blogs Updates & Deletions
  useEffect(() => {
    const socket = getSocket();

    const handleBlogPublished = (newBlog) => {
      if (newBlog && user && ((newBlog.author && String(newBlog.author.id) === String(user.id)) || (newBlog.author && newBlog.author.name === (user.name || user.username)))) {
        setMyBlogs(prev => [newBlog, ...prev.filter(b => String(b.id) !== String(newBlog.id))]);
      } else {
        loadMyBlogs();
      }
    };

    const handleBlogDeleted = (data) => {
      if (data && data.blogId) {
        setMyBlogs(prev => prev.filter(b => String(b.id) !== String(data.blogId)));
        setSelectedBlogIds(prev => prev.filter(id => String(id) !== String(data.blogId)));
      }
    };

    socket.on('blog:published', handleBlogPublished);
    socket.on('blog:deleted', handleBlogDeleted);

    return () => {
      socket.off('blog:published', handleBlogPublished);
      socket.off('blog:deleted', handleBlogDeleted);
    };
  }, [user]);

  // Selection Handlers
  const toggleSelectBlog = (blogId) => {
    const stringId = String(blogId);
    setSelectedBlogIds(prev => {
      if (prev.includes(stringId)) {
        return prev.filter(id => id !== stringId);
      } else {
        return [...prev, stringId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBlogIds.length === myBlogs.length) {
      setSelectedBlogIds([]);
    } else {
      setSelectedBlogIds(myBlogs.map(b => String(b.id)));
    }
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedBlogIds([]);
    } else {
      setIsSelectionMode(true);
    }
  };

  // Bulk Deletion Process
  const promptDeleteSelected = () => {
    if (selectedBlogIds.length === 0 || isDeleting) return;
    setDeleteError('');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBlogIds.length === 0 || isDeleting) return;

    setIsDeleting(true);
    setDeleteError('');

    const idsToDelete = [...selectedBlogIds];
    const successfulDeletions = [];
    const failedDeletions = [];

    for (const id of idsToDelete) {
      try {
        const res = await deleteBlogApi(id);
        if (res && res.success) {
          successfulDeletions.push(id);
        } else {
          failedDeletions.push(id);
        }
      } catch (err) {
        failedDeletions.push(id);
      }
    }

    setIsDeleting(false);
    setIsConfirmModalOpen(false);

    if (successfulDeletions.length > 0) {
      // Optimistically remove deleted blogs from UI immediately
      setMyBlogs(prev => prev.filter(b => !successfulDeletions.includes(String(b.id))));
      
      const count = successfulDeletions.length;
      setDeleteSuccessToast(`🎉 Successfully deleted ${count} article${count > 1 ? 's' : ''}.`);
      setTimeout(() => {
        setDeleteSuccessToast('');
      }, 4000);
    }

    if (failedDeletions.length > 0) {
      // Keep failed items selected and display appropriate error
      setSelectedBlogIds(failedDeletions);
      setDeleteError(`Failed to delete ${failedDeletions.length} article(s). Please try again.`);
    } else {
      // Clear selection upon complete success
      setSelectedBlogIds([]);
      setIsSelectionMode(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      {/* Toast Notification */}
      {deleteSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#ff9432] shrink-0" />
          <span>{deleteSuccessToast}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner Header */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-white border border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300">
              <FolderEdit className="w-3.5 h-3.5 text-[#ff9432]" /> Personal Portfolio
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              My Published <span className="text-[#ff9432]">Articles</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-normal">
              Manage all stories, technical guides, and engineering essays published by you.
            </p>
          </div>

          {/* Action Header Button */}
          {myBlogs.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleToggleSelectionMode}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                  isSelectionMode
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelectionMode ? (
                  <>
                    <X className="w-4 h-4 text-amber-900" /> Cancel Selection
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 text-[#ff9432]" /> Select Articles
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Toolbar & Error Message */}
        {deleteError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{deleteError}</span>
            </div>
            <button onClick={() => setDeleteError('')} className="hover:opacity-80">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Bulk Operation Action Bar */}
        {isSelectionMode && myBlogs.length > 0 && (
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
              >
                {selectedBlogIds.length === myBlogs.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-[#ff9432]" /> Select All ({myBlogs.length})
                  </>
                )}
              </button>

              <span className="text-xs font-medium text-slate-500">
                {selectedBlogIds.length} of {myBlogs.length} selected
              </span>
            </div>

            {/* Delete Selected Button */}
            {selectedBlogIds.length > 0 && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={promptDeleteSelected}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Selected ({selectedBlogIds.length})
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Articles List */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-500 text-xs font-medium gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#ff9432]" />
              <span>Loading your published articles...</span>
            </div>
          ) : myBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBlogs.map((post) => (
                <BlogCard
                  key={post.id}
                  blog={post}
                  selectable={isSelectionMode}
                  isSelected={selectedBlogIds.includes(String(post.id))}
                  onSelectToggle={toggleSelectBlog}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center space-y-4 border border-slate-300 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-[#ff9432] mx-auto shadow-xs">
                <FolderEdit className="w-6 h-6 text-[#ff9432]" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">No published articles yet.</h3>
                <p className="text-xs text-slate-500 font-normal">You haven't written any blog posts yet. Share your first article today!</p>
              </div>

              <div className="pt-2">
                <a
                  href="/write"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs transition-all"
                >
                  <PenTool className="w-3.5 h-3.5" /> Write First Article
                </a>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete Selected Articles</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete the selected blog(s)? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 flex items-center justify-between">
              <span>Articles to delete:</span>
              <span className="font-extrabold text-[#ff9432]">{selectedBlogIds.length} article(s)</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete ({selectedBlogIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}

