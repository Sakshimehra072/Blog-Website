'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import CategoryCard from '../components/CategoryCard';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { 
  Sparkles, 
  TrendingUp, 
  Search, 
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
  Camera 
} from 'lucide-react';

// Exact 16 Categories requested
const ALL_CATEGORIES = [
  { id: 'tech', name: 'Technology', count: 42, icon: Cpu, color: 'from-blue-500 to-indigo-600' },
  { id: 'programming', name: 'Programming', count: 38, icon: Code2, color: 'from-indigo-500 to-purple-600' },
  { id: 'ai', name: 'Artificial Intelligence', count: 45, icon: Bot, color: 'from-purple-500 to-pink-600' },
  { id: 'business', name: 'Business', count: 24, icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
  { id: 'finance', name: 'Finance', count: 19, icon: DollarSign, color: 'from-amber-500 to-yellow-600' },
  { id: 'travel', name: 'Travel', count: 31, icon: Plane, color: 'from-cyan-500 to-blue-600' },
  { id: 'health', name: 'Health', count: 27, icon: Activity, color: 'from-rose-500 to-red-600' },
  { id: 'education', name: 'Education', count: 22, icon: GraduationCap, color: 'from-violet-500 to-purple-600' },
  { id: 'sports', name: 'Sports', count: 18, icon: Trophy, color: 'from-orange-500 to-amber-600' },
  { id: 'food', name: 'Food', count: 29, icon: Utensils, color: 'from-lime-500 to-emerald-600' },
  { id: 'fashion', name: 'Fashion', count: 16, icon: Shirt, color: 'from-pink-500 to-rose-600' },
  { id: 'lifestyle', name: 'Lifestyle', count: 33, icon: Smile, color: 'from-teal-500 to-green-600' },
  { id: 'movies', name: 'Movies', count: 21, icon: Film, color: 'from-red-500 to-orange-600' },
  { id: 'gaming', name: 'Gaming', count: 40, icon: Gamepad2, color: 'from-fuchsia-500 to-purple-600' },
  { id: 'science', name: 'Science', count: 26, icon: Atom, color: 'from-sky-500 to-indigo-600' },
  { id: 'photography', name: 'Photography', count: 15, icon: Camera, color: 'from-indigo-500 to-blue-600' },
];

// Sample posts data
const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Building High-Performance Full Stack Web Apps in 2026",
    excerpt: "Explore the modern architecture patterns, optimization techniques, and responsive design systems that power lightning-fast web applications.",
    category: "Technology",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    likes: 142,
    comments: 28
  },
  {
    id: 2,
    title: "The Next Era of Artificial Intelligence: Agentic Systems",
    excerpt: "How autonomous agent workflows are reinventing software engineering, data synthesis, and human-computer interfaces.",
    category: "Artificial Intelligence",
    author: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    likes: 215,
    comments: 42
  },
  {
    id: 3,
    title: "Mastering Clean Code & Refactoring in Modern JavaScript",
    excerpt: "Delight your visitors and maintain code scalability with proven design patterns and functional modularity.",
    category: "Programming",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    likes: 98,
    comments: 14
  }
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState(1);

  const scrollToSearch = () => {
    const blogsEl = document.getElementById('blogs');
    if (blogsEl) blogsEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Header */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} onFocusSearch={scrollToSearch} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-16">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-14 glass-panel border border-indigo-500/20 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> BlogVerse Publishing Network
            </div>
            
            {/* Website Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Discover, Create & Share <span className="gradient-text">World-Class Stories</span>.
            </h1>

            {/* Short Description */}
            <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl">
              BlogVerse is your destination for inspiring blogs across technology, programming, design, lifestyle, and global insights. Engage with authors, save your favorites, and share your voice.
            </p>

            {/* Search Blogs Button */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button 
                onClick={scrollToSearch}
                className="px-6 py-3.5 rounded-xl text-sm font-semibold gradient-btn flex items-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4" /> Search Blogs
              </button>
              
              <a 
                href="#categories"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                Explore Categories
              </a>
            </div>
          </div>
        </section>

        {/* BLOG CATEGORIES SECTION (16 Cards Grid) */}
        <section id="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 inline-block" />
              Blog Categories
            </h2>
            <span className="text-xs font-semibold text-slate-400">16 Topics Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {ALL_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              />
            ))}
          </div>
        </section>

        {/* LATEST BLOGS SECTION */}
        <section id="blogs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Latest Blogs
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              >
                Filtered: Clear Selection ×
              </button>
            )}
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_POSTS.map((post) => (
              <BlogCard key={post.id} blog={post} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination currentPage={page} totalPages={5} onPageChange={(p) => setPage(p)} />
        </section>

        {/* SAVED FAVOURITES SECTION ANCHOR */}
        <section id="favourites" className="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Your Saved Favourites</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the bookmark icon on any blog card to keep track of your favorite articles here.
          </p>
        </section>

      </main>

      {/* Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
