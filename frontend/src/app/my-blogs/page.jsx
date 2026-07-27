'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchBlogsApi } from '../../services/blogService';
import { getSocket } from '../../services/socketService';
import { BookOpen, PenTool, FolderEdit, Loader2 } from 'lucide-react';

export default function MyBlogsPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Real-Time Socket Listener for Instant My-Blogs Updates
  useEffect(() => {
    const socket = getSocket();

    const handleBlogPublished = (newBlog) => {
      if (newBlog && user && ((newBlog.author && String(newBlog.author.id) === String(user.id)) || (newBlog.author && newBlog.author.name === (user.name || user.username)))) {
        setMyBlogs(prev => [newBlog, ...prev.filter(b => b.id !== newBlog.id)]);
      } else {
        loadMyBlogs();
      }
    };

    socket.on('blog:published', handleBlogPublished);
    return () => {
      socket.off('blog:published', handleBlogPublished);
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FEF9C3]">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-white border border-slate-300 shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300">
              <FolderEdit className="w-3.5 h-3.5 text-[#ff9432]" /> Personal Portfolio
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              My Published <span className="text-[#ff9432]">Articles</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-normal">
              All stories, technical guides, and engineering essays published by you, ordered from newest to oldest.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-500 text-xs font-medium gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#ff9432]" />
              <span>Loading your published articles...</span>
            </div>
          ) : myBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBlogs.map((post) => (
                <BlogCard key={post.id} blog={post} />
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

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}
