'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import { fetchUserFavouritesApi, toggleFavouriteApi } from '../../services/favouriteService';
import { Bookmark, ArrowRight, Clock, Calendar, BookOpen, Trash2 } from 'lucide-react';

export default function FavouritesPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeToast, setRemoveToast] = useState(false);

  useEffect(() => {
    async function loadSaved() {
      const res = await fetchUserFavouritesApi();
      if (res && res.success && res.favourites) {
        setSavedBlogs(res.favourites);
      }
      setLoading(false);
    }
    loadSaved();
  }, []);

  const handleRemove = async (blogId) => {
    await toggleFavouriteApi(blogId);
    setSavedBlogs(prev => prev.filter(b => b.id !== blogId));
    setRemoveToast(true);
    setTimeout(() => {
      setRemoveToast(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Header */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel border border-indigo-500/20 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Bookmark className="w-3.5 h-3.5" /> Bookmarked Collection
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Saved <span className="gradient-text">Blogs</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              All the stories and guides you bookmarked for easy access anytime.
            </p>
          </div>
        </section>

        {/* Toast Removal Feedback */}
        {removeToast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl glass-panel border border-rose-500/40 bg-slate-950/90 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <span>✅ Blog removed from Saved Blogs.</span>
          </div>
        )}

        {/* Saved Blogs Grid / Empty State */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
              Loading your saved blogs...
            </div>
          ) : savedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBlogs.map((post) => (
                <article key={post.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300">
                  <div className="space-y-3">
                    
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 space-y-3">
                      {/* Category & Meta */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-3 py-1 rounded-full font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-purple-400" /> {post.date || 'Jul 24, 2026'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-pink-400" /> {post.readTime || '5 min read'}</span>
                        </div>
                      </div>

                      {/* Blog Title */}
                      <a href={`/blogs/${post.id}`}>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </a>

                      {/* Author Name */}
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 pt-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" /> By {post.author?.name || 'Anonymous Author'}
                      </p>

                      {/* Actions Footer */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={`/blogs/${post.id}`}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700/80 hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <span>Read More</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemove(post.id)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* EXACT EMPTY STATE UI */
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                <Bookmark className="w-8 h-8 text-indigo-400" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">No saved blogs yet.</h3>
                <p className="text-xs text-slate-400">Save your favorite blogs by clicking the bookmark icon.</p>
              </div>

              <div className="pt-3">
                <a
                  href="/#blogs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold gradient-btn shadow-lg"
                >
                  <BookOpen className="w-4 h-4" /> Browse Blogs
                </a>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Global Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
