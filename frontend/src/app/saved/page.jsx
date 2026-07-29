'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import BlogCard from '../../components/BlogCard';
import { fetchUserFavouritesApi, toggleFavouriteApi, getLocalSavedBlogIds } from '../../services/favouriteService';
import { fetchBlogsApi } from '../../services/blogService';
import { Bookmark, ArrowRight, BookOpen, Trash2 } from 'lucide-react';

export default function SavedBlogsPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeToast, setRemoveToast] = useState(false);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const loadSaved = async () => {
    setLoading(true);
    const savedIds = getLocalSavedBlogIds();
    const allBlogsRes = await fetchBlogsApi(null, 1, 100);
    let all = (allBlogsRes && allBlogsRes.success && Array.isArray(allBlogsRes.data)) ? allBlogsRes.data : [];

    let matches = all.filter(b => savedIds.includes(Number(b.id)) || savedIds.includes(String(b.id)));

    const apiRes = await fetchUserFavouritesApi();
    if (apiRes && apiRes.success && Array.isArray(apiRes.favourites) && apiRes.favourites.length > 0) {
      const combinedMap = new Map();
      matches.forEach(b => combinedMap.set(Number(b.id), b));
      apiRes.favourites.forEach(b => combinedMap.set(Number(b.id), b));
      matches = Array.from(combinedMap.values());
    }

    setSavedBlogs(matches);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  useEffect(() => {
    const handleSavedUpdate = () => {
      loadSaved();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('saved_blogs_updated', handleSavedUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('saved_blogs_updated', handleSavedUpdate);
      }
    };
  }, []);

  const handleRemove = async (blogId) => {
    await toggleFavouriteApi(blogId);
    setSavedBlogs(prev => prev.filter(b => Number(b.id) !== Number(blogId)));
    setRemoveToast(true);
    setTimeout(() => {
      setRemoveToast(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFFC5]">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-white border border-slate-300 shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300">
              <Bookmark className="w-3.5 h-3.5 text-[#ff9432]" /> Bookmarked Collection
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Saved <span className="text-[#ff9432]">Reading List</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-normal">
              Articles and engineering guides you bookmarked for later reading.
            </p>
          </div>
        </section>

        {removeToast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in">
            <span>Article removed from saved reading list.</span>
          </div>
        )}

        <section className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-500 text-xs font-medium">
              Loading your saved articles...
            </div>
          ) : savedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBlogs.map((post) => (
                <div key={post.id} className="relative">
                  <BlogCard blog={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center space-y-4 border border-slate-300 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-[#ff9432] mx-auto shadow-xs">
                <Bookmark className="w-6 h-6 text-[#ff9432]" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">No saved articles yet.</h3>
                <p className="text-xs text-slate-500 font-normal">Save articles to read later by clicking the bookmark icon on any blog card.</p>
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
