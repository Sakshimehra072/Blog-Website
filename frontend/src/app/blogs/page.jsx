'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard';
import CategoryScrollSection from '../../components/CategoryScrollSection';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchBlogsApi } from '../../services/blogService';
import { getSocket } from '../../services/socketService';
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
  Home,
  CheckCircle2,
  Library
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

const ITEMS_PER_PAGE = 12;

export default function BlogsPage() {
  const { isLoggedIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const [activeCategory, setActiveCategory] = useState('All');
  const [categoriesList, setCategoriesList] = useState(BASE_CATEGORIES);
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const loadBlogs = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const queryCategory = (activeCategory === 'All' || !activeCategory) ? null : activeCategory;
    const res = await fetchBlogsApi(queryCategory, 1, 200);

    if (res && res.success && Array.isArray(res.data)) {
      setBlogs(res.data);
      const countsObj = res.categoryCounts || {};

      const blogListTally = {};
      res.data.forEach(b => {
        if (b.category) {
          const cKey = b.category.trim();
          blogListTally[cKey] = (blogListTally[cKey] || 0) + 1;
        }
      });

      setCategoriesList(BASE_CATEGORIES.map(cat => {
        if (cat.id === 'All') {
          const allVal = countsObj['All'] !== undefined ? countsObj['All'] : (countsObj['all'] !== undefined ? countsObj['all'] : (res.totalBlogs || res.data.length));
          return { ...cat, count: typeof allVal === 'number' ? allVal : res.data.length };
        }

        const matchKey = Object.keys(countsObj).find(k => k.toLowerCase() === cat.name.toLowerCase());
        const tallyMatchKey = Object.keys(blogListTally).find(k => k.toLowerCase() === cat.name.toLowerCase());

        const serverCount = matchKey ? countsObj[matchKey] : 0;
        const tallyCount = tallyMatchKey ? blogListTally[tallyMatchKey] : 0;

        return {
          ...cat,
          count: Math.max(serverCount, tallyCount)
        };
      }));
    } else if (Array.isArray(res)) {
      setBlogs(res);
    } else {
      setBlogs([]);
    }
    if (showLoading) setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search') || params.get('q') || '';
      setSearchQuery(q);
      const catParam = params.get('category');
      if (catParam) setActiveCategory(catParam);
    }
  }, []);

  useEffect(() => {
    loadBlogs(true);
  }, [loadBlogs]);

  // Real-Time Socket Listener for Instant Post, Delete, Comment & Like Updates
  useEffect(() => {
    const socket = getSocket();

    const handleBlogPublished = () => {
      loadBlogs(false);
    };

    const handleBlogDeleted = () => {
      loadBlogs(false);
    };

    const handleBlogUpdated = () => {
      loadBlogs(false);
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
    socket.on('blog:deleted', handleBlogDeleted);
    socket.on('blog:updated', handleBlogUpdated);
    socket.on('comment:added', handleCommentAdded);
    socket.on('blog:liked', handleBlogLiked);

    return () => {
      socket.off('blog:published', handleBlogPublished);
      socket.off('blog:deleted', handleBlogDeleted);
      socket.off('blog:updated', handleBlogUpdated);
      socket.off('comment:added', handleCommentAdded);
      socket.off('blog:liked', handleBlogLiked);
    };
  }, [loadBlogs]);

  // Filter matching
  const filteredBlogs = blogs.filter(b => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = b.title && b.title.toLowerCase().includes(q);
    const descMatch = (b.description || b.excerpt) && (b.description || b.excerpt).toLowerCase().includes(q);
    const catMatch = b.category && b.category.toLowerCase().includes(q);
    const authorMatch = b.author?.name && b.author.name.toLowerCase().includes(q);
    return titleMatch || descMatch || catMatch || authorMatch;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = filteredBlogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Banner */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-white border border-slate-300 shadow-xs">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300">
              <Library className="w-3.5 h-3.5 text-[#ff9432]" /> All Published Stories
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore All <span className="text-[#ff9432]">Blogs & Essays</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">
              Browse through our complete catalog of engineering essays, technology guides, design thoughts, and cultural commentary published by authors worldwide.
            </p>
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

        {/* Articles Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff9432]" />
              {searchQuery ? `Search Results for "${searchQuery}"` : (activeCategory === 'All' ? 'All Articles' : `${activeCategory} Articles`)}
              <span className="text-xs font-semibold text-slate-500 font-mono">({filteredBlogs.length})</span>
            </h2>

            <div className="flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
                >
                  Clear Search: "{searchQuery}" ×
                </button>
              )}

              {activeCategory && activeCategory !== 'All' && !searchQuery && (
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setPage(1);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  Filtered: {activeCategory} × (Show All)
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">
              Loading articles...
            </div>
          ) : paginatedBlogs.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBlogs.map((post) => (
                  <BlogCard key={post.id} blog={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-300 max-w-md mx-auto my-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-[#ff9432] mx-auto shadow-xs">
                <SearchX className="w-6 h-6 text-[#ff9432]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">No articles found</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {searchQuery 
                    ? `No articles match "${searchQuery}". Please try another search term.` 
                    : `No stories found in ${activeCategory}.`}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <a
                  href="/blogs"
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs transition-all"
                >
                  Show All Articles
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
