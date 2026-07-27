'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import CategoryScrollSection from '../components/CategoryScrollSection';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { fetchBlogsApi } from '../services/blogService';
import { getSocket } from '../services/socketService';
import { 
  TrendingUp, 
  Search, 
  ArrowRight,
  PenTool,
  LayoutGrid,
  Cpu, 
  Code2, 
  Bot, 
  Briefcase, 
  DollarSign, 
  Plane, 
  Activity, 
  GraduationCap, 
  Trophy, 
  Utensils, 
  Shirt, 
  Smile, 
  Film, 
  Gamepad2, 
  Atom, 
  Camera,
  BookOpen,
  SearchX,
  Home
} from 'lucide-react';

const BASE_CATEGORIES = [
  { id: 'All', name: 'All', count: 0, icon: LayoutGrid },
  { id: 'Technology', name: 'Technology', count: 0, icon: Cpu },
  { id: 'Programming', name: 'Programming', count: 0, icon: Code2 },
  { id: 'Artificial Intelligence', name: 'Artificial Intelligence', count: 0, icon: Bot },
  { id: 'Business', name: 'Business', count: 0, icon: Briefcase },
  { id: 'Finance', name: 'Finance', count: 0, icon: DollarSign },
  { id: 'Travel', name: 'Travel', count: 0, icon: Plane },
  { id: 'Health', name: 'Health', count: 0, icon: Activity },
  { id: 'Education', name: 'Education', count: 0, icon: GraduationCap },
  { id: 'Sports', name: 'Sports', count: 0, icon: Trophy },
  { id: 'Food', name: 'Food', count: 0, icon: Utensils },
  { id: 'Fashion', name: 'Fashion', count: 0, icon: Shirt },
  { id: 'Lifestyle', name: 'Lifestyle', count: 0, icon: Smile },
  { id: 'Movies', name: 'Movies', count: 0, icon: Film },
  { id: 'Gaming', name: 'Gaming', count: 0, icon: Gamepad2 },
  { id: 'Science', name: 'Science', count: 0, icon: Atom },
  { id: 'Photography', name: 'Photography', count: 0, icon: Camera },
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categoriesList, setCategoriesList] = useState(BASE_CATEGORIES);
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search') || params.get('q') || '';
      setSearchQuery(q);
    }
  }, []);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const loadBlogs = async () => {
    setLoading(true);
    const queryCategory = (activeCategory === 'All' || !activeCategory) ? null : activeCategory;
    const res = await fetchBlogsApi(queryCategory, page, 50);
    if (res && res.success && Array.isArray(res.data)) {
      setBlogs(res.data);
      if (res.categoryCounts) {
        setCategoriesList(BASE_CATEGORIES.map(cat => ({
          ...cat,
          count: res.categoryCounts[cat.name] || (cat.id === 'All' ? (res.categoryCounts['All'] || 0) : 0)
        })));
      }
    } else if (Array.isArray(res)) {
      setBlogs(res);
    } else {
      setBlogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, [activeCategory, page]);

  // Real-Time Socket Listener for Instant Post, Comment & Like Updates
  useEffect(() => {
    const socket = getSocket();

    const handleBlogPublished = () => {
      loadBlogs();
    };

    const handleCommentAdded = (data) => {
      setBlogs(prev => prev.map(blog => {
        if (String(blog.id) === String(data.blogId)) {
          const prevCount = typeof blog.comments === 'number' ? blog.comments : 0;
          return {
            ...blog,
            comments: prevCount + 1,
            comments_count: prevCount + 1
          };
        }
        return blog;
      }));
    };

    const handleBlogLiked = (data) => {
      setBlogs(prev => prev.map(blog => {
        if (Number(blog.id) === Number(data.blogId)) {
          return {
            ...blog,
            likes: data.likesCount,
            likes_count: data.likesCount
          };
        }
        return blog;
      }));
    };

    socket.on('blog:published', handleBlogPublished);
    socket.on('comment:added', handleCommentAdded);
    socket.on('blog:liked', handleBlogLiked);

    return () => {
      socket.off('blog:published', handleBlogPublished);
      socket.off('comment:added', handleCommentAdded);
      socket.off('blog:liked', handleBlogLiked);
    };
  }, [activeCategory]);

  const scrollToSearch = () => {
    const blogsEl = document.getElementById('blogs');
    if (blogsEl) blogsEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Search Filter Matching Logic
  const filteredBlogs = blogs.filter(b => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = b.title && b.title.toLowerCase().includes(q);
    const descMatch = (b.description || b.excerpt) && (b.description || b.excerpt).toLowerCase().includes(q);
    const catMatch = b.category && b.category.toLowerCase().includes(q);
    const authorMatch = b.author?.name && b.author.name.toLowerCase().includes(q);
    return titleMatch || descMatch || catMatch || authorMatch;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FEF9C3]">
      <Header onOpenAuthModal={handleOpenAuthModal} onFocusSearch={scrollToSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-14">
        
        {/* Editorial Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl p-8 sm:p-12 bg-white border border-slate-200/90 shadow-xs">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              Live Real-Time Publishing Platform
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Stories, Insights & <span className="text-[#ff9432]">Engineering Essays</span>.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              BlogVerse is an independent platform for registered authors sharing genuine perspectives on tech, code, design, and culture.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/write"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white transition-all shadow-xs flex items-center gap-2"
              >
                <PenTool className="w-3.5 h-3.5" /> Write Article
              </a>
              
              <a 
                href="#blogs"
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
              >
                Explore Recent Uploads <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </section>

        {/* Scrollable Categories Carousel */}
        <CategoryScrollSection
          categories={categoriesList}
          activeCategory={activeCategory}
          onSelectCategory={(catId) => {
            setActiveCategory(catId || 'All');
            setPage(1);
          }}
        />

        {/* Recent Uploads & Search Results Section */}
        <section id="blogs" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff9432]" />
              {searchQuery ? `Search Results for "${searchQuery}"` : (activeCategory === 'All' ? 'Recent Uploads' : `${activeCategory} Articles`)}
            </h2>

            <div className="flex items-center gap-2">
              {searchQuery && (
                <a
                  href="/"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  Clear Search: "{searchQuery}" ×
                </a>
              )}

              {activeCategory && activeCategory !== 'All' && !searchQuery && (
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setPage(1);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
                >
                  Filtered: {activeCategory} × (Show All)
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">
              Loading recent articles...
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((post) => (
                <BlogCard key={post.id} blog={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-300 max-w-md mx-auto my-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-[#ff9432] mx-auto shadow-xs">
                <SearchX className="w-6 h-6 text-[#ff9432]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Content not available</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {searchQuery 
                    ? `No articles found matching "${searchQuery}". Please try searching with another keyword or explore all articles.` 
                    : (activeCategory !== 'All' ? `No stories found in ${activeCategory}.` : 'Be the first registered author to write and publish an essay!')}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs transition-all"
                >
                  <Home className="w-3.5 h-3.5" /> Go to Home
                </a>
              </div>
            </div>
          )}

          {filteredBlogs.length >= 20 && (
            <Pagination currentPage={page} totalPages={Math.ceil(filteredBlogs.length / 20) + 1} onPageChange={(p) => setPage(p)} />
          )}
        </section>

      </main>

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}
