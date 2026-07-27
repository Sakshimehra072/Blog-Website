'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import { fetchUserFavouritesApi, toggleFavouriteApi } from '../../services/favouriteService';
import { Bookmark, ArrowRight, Clock, Calendar, BookOpen, Trash2 } from 'lucide-react';

export default function FavouritesPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeToast, setRemoveToast] = useState(false);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

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
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-white border border-slate-200/90 shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
              <Bookmark className="w-3.5 h-3.5 text-[#ff9432]" /> Bookmarked Collection
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Saved <span className="text-[#ff9432]">Reading List</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
              Articles and engineering guides you bookmarked for later reading.
            </p>
          </div>
        </section>

        {removeToast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in">
            <span>Article removed from saved list.</span>
          </div>
        )}

        <section className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
              Loading your saved articles...
            </div>
          ) : savedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBlogs.map((post) => (
                <article key={post.id} className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200">
                  <div className="space-y-3">
                    
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-md font-medium text-[11px] bg-amber-50 text-amber-900 border border-amber-200">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date || 'Jul 24, 2026'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime || '5 min read'}</span>
                        </div>
                      </div>

                      <a href={`/blogs/${post.id}`}>
                        <h3 className="text-base font-semibold text-slate-900 hover:text-[#ff9432] transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </a>

                      <p className="text-xs font-medium text-slate-600">
                        By {post.author?.name || 'Anonymous Author'}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <a
                          href={`/blogs/${post.id}`}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-[#ff9432] hover:bg-[#e88325] text-white transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemove(post.id)}
                          className="py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:text-rose-600 hover:border-rose-300 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-10 text-center space-y-4 border border-slate-200 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#ff9432] mx-auto">
                <Bookmark className="w-6 h-6 text-[#ff9432]" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">No saved articles yet.</h3>
                <p className="text-xs text-slate-500">Save articles to read later by clicking the bookmark icon.</p>
              </div>

              <div className="pt-2">
                <a
                  href="/#blogs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white shadow-xs transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Explore Articles
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
