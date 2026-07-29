'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFavouritesApi } from '../../services/favouriteService';
import { fetchBlogsApi } from '../../services/blogService';
import {
  Mail,
  Calendar,
  BookOpen,
  Users,
  UserCheck,
  Bookmark,
  Edit3,
  CheckCircle2,
  Camera,
  Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [activeTab, setActiveTab] = useState('saved');

  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [myBlogs, setMyBlogs] = useState([]);
  const [loadingMyBlogs, setLoadingMyBlogs] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const displayName = user?.name || user?.username || 'Registered Author';
  const displayEmail = user?.email || 'author@example.com';
  const displayAvatar = user?.avatar_url || user?.avatar;
  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'A';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('edit') === 'true') {
        setIsEditModalOpen(true);
      }
      if (searchParams.get('tab') === 'my-blogs') {
        setActiveTab('my-blogs');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name || user.username || '');
      setEditAvatarUrl(user.avatar_url || user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadData() {
      // Saved blogs
      setLoadingSaved(true);
      const favRes = await fetchUserFavouritesApi();
      if (favRes && favRes.success && Array.isArray(favRes.favourites)) {
        setSavedBlogs(favRes.favourites);
      } else {
        setSavedBlogs([]);
      }
      setLoadingSaved(false);

      // User's own published blogs
      setLoadingMyBlogs(true);
      const blogsRes = await fetchBlogsApi(null, 1, 50);
      if (blogsRes && blogsRes.success && Array.isArray(blogsRes.data)) {
        const userArticles = blogsRes.data.filter(b =>
          (user && b.author && String(b.author.id) === String(user.id)) ||
          (user && b.author && b.author.name === (user.name || user.username))
        );
        setMyBlogs(userArticles);
      } else {
        setMyBlogs([]);
      }
      setLoadingMyBlogs(false);
    }
    loadData();
  }, [user]);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');

    try {
      if (updateProfile) {
        await updateProfile({
          name: editName,
          username: editName,
          avatar_url: editAvatarUrl
        });
      }
      setUpdateMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setUpdateMsg('');
      }, 1000);
    } catch (err) {
      setUpdateMsg('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFFC5]">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">

        {/* Profile Card Header */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative group">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#ff9432]/40"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ff9432] text-white flex items-center justify-center text-2xl font-bold border-2 border-[#ff9432]/40 shadow-xs">
                    {firstLetter}
                  </div>
                )}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#ff9432] text-white hover:bg-[#e88325] transition-transform"
                  title="Change Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {displayName}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                    <Mail className="w-3 h-3 text-slate-400" /> {displayEmail}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" /> Member since July 2026
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

          </div>

          {/* Stats Row */}
          <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center max-w-lg">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-[#ff9432]" />
                <span className="text-base font-bold text-slate-900">{myBlogs.length}</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Articles</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-700">
                <Users className="w-3.5 h-3.5 text-[#ff9432]" />
                <span className="text-base font-bold text-slate-900">0</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Followers</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-[#ff9432]" />
                <span className="text-base font-bold text-slate-900">0</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Following</p>
            </div>
          </div>

        </section>

        {/* Tabs */}
        <section className="space-y-6">
          <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors relative ${activeTab === 'saved' ? 'text-[#ff9432] border-b-2 border-[#ff9432]' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Saved Articles ({savedBlogs.length})
            </button>

            <button
              onClick={() => setActiveTab('my-blogs')}
              className={`pb-2.5 flex items-center gap-1.5 transition-colors relative ${activeTab === 'my-blogs' ? 'text-[#ff9432] border-b-2 border-[#ff9432]' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> My Articles ({myBlogs.length})
            </button>
          </div>

          {activeTab === 'saved' && (
            <div>
              {loadingSaved ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading saved articles...</div>
              ) : savedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 shadow-xs">
                  No saved articles found. Bookmark stories to access them here.
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-blogs' && (
            <div>
              {loadingMyBlogs ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading your articles...</div>
              ) : myBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 shadow-xs">
                  You have not published any articles yet. Click "Write Article" to publish your first story!
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {updateMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{updateMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center gap-1.5 shadow-xs"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}
