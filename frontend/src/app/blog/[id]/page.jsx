'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BlogCard from '../../../components/BlogCard';
import LikeButton from '../../../components/LikeButton';
import CommentButton from '../../../components/CommentButton';
import ShareButton from '../../../components/ShareButton';
import FavouriteButton from '../../../components/FavouriteButton';
import SubscribeButton from '../../../components/SubscribeButton';
import CommentSection from '../../../components/CommentSection';
import Modal from '../../../components/Modal';
import { fetchBlogByIdApi, fetchBlogsApi } from '../../../services/blogService';
import { getSocket } from '../../../services/socketService';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  BookOpen,
  Loader2
} from 'lucide-react';

export default function BlogDetailsPage({ params }) {
  const blogId = params?.id || '1';
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [commentCount, setCommentCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchBlogByIdApi(blogId);
      if (res && res.success && res.blog) {
        setBlog(res.blog);
        setCommentCount(res.blog.comments || 0);

        if (res.blog.category) {
          const relRes = await fetchBlogsApi(res.blog.category, 1, 4);
          if (relRes && relRes.success && Array.isArray(relRes.data)) {
            setRelatedBlogs(relRes.data.filter(b => String(b.id) !== String(blogId)));
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [blogId]);

  useEffect(() => {
    if (!blogId) return;
    const socket = getSocket();
    socket.emit('join_blog', blogId);

    const handleBlogLiked = (data) => {
      if (Number(data.blogId) === Number(blogId)) {
        setBlog(prev => prev ? { ...prev, likes: data.likesCount } : null);
      }
    };

    socket.on('blog:liked', handleBlogLiked);

    return () => {
      socket.emit('leave_blog', blogId);
      socket.off('blog:liked', handleBlogLiked);
    };
  }, [blogId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Header onOpenAuthModal={handleOpenAuthModal} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff9432]" />
          <p className="text-xs font-semibold text-slate-600">Loading article details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Header onOpenAuthModal={handleOpenAuthModal} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
          <p className="text-xs text-slate-500">The article you are looking for does not exist or has been removed.</p>
          <div>
            <a href="/" className="px-4 py-2 rounded-lg bg-[#ff9432] text-white text-xs font-semibold">
              Return Home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const authorName = blog.author?.name || 'Anonymous Author';
  const authorAvatar = blog.author?.avatar;
  const firstLetter = authorName.trim().charAt(0).toUpperCase() || 'A';
  const formattedDate = blog.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div 
        className="fixed top-0 left-0 h-0.5 bg-[#ff9432] z-50 transition-all duration-150" 
        style={{ width: `${scrollProgress}%` }}
      />

      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Stories
          </a>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2.5 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#ff9432]" /> {blog.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formattedDate}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {blog.readTime || '5 min read'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#ff9432] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {firstLetter}
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{authorName}</h4>
                <p className="text-xs text-slate-500">Registered Author</p>
              </div>
            </div>

            <SubscribeButton authorId={blog.author?.id || 'author'} compact />
          </div>
        </div>

        {blog.coverImage && (
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <LikeButton blogId={blog.id} initialLikes={blog.likes || 0} />
            <CommentButton count={commentCount} />
          </div>
          <div className="flex items-center gap-1.5">
            <FavouriteButton blogId={blog.id} />
            <ShareButton title={blog.title} />
          </div>
        </div>

        <article className="article-body py-2 text-slate-800 whitespace-pre-line">
          {blog.description}
        </article>

        <CommentSection blogId={blogId} onCountChange={(cnt) => setCommentCount(cnt)} />

        {relatedBlogs.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#ff9432]" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">More in {blog.category}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedBlogs.map((relBlog) => (
                <BlogCard key={relBlog.id} blog={relBlog} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}
