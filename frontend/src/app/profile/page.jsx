'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogCard from '../../components/BlogCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { fetchUserFavouritesApi } from '../../services/favouriteService';
import { 
  User, 
  Phone, 
  Calendar, 
  BookOpen, 
  Users, 
  UserCheck, 
  Bookmark, 
  Heart, 
  Edit3, 
  CheckCircle2, 
  Camera, 
  Loader2 
} from 'lucide-react';

// Sample User Liked Blogs Data
const LIKED_BLOGS = [
  {
    id: 1,
    title: "Building High-Performance Full Stack Web Apps in 2026",
    excerpt: "Explore modern architecture patterns, optimization techniques, and responsive design systems.",
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
    excerpt: "How autonomous agent workflows are reinventing software engineering and human-computer interfaces.",
    category: "Artificial Intelligence",
    author: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    likes: 215,
    comments: 42
  }
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'liked'
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Fallback Current Profile Data
  const profile = {
    username: user?.username || 'alexmorgan',
    phoneNumber: user?.phone_number || '+1 (555) 019-2834',
    joinedDate: 'July 2026',
    avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    stats: {
      blogsCount: 12,
      followersCount: 348,
      followingCount: 192
    }
  };

  useEffect(() => {
    if (user) {
      setEditUsername(user.username || '');
      setEditAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadSaved() {
      const res = await fetchUserFavouritesApi();
      if (res && res.success && res.favourites) {
        setSavedBlogs(res.favourites);
      }
      setLoadingSaved(false);
    }
    loadSaved();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');

    try {
      if (updateProfile) {
        await updateProfile({
          username: editUsername,
          avatar_url: editAvatarUrl
        });
      }
      setUpdateMsg('✅ Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setUpdateMsg('');
      }, 1200);
    } catch (err) {
      setUpdateMsg('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Header */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Main Profile Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* PROFILE HEADER HERO CARD */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 glass-panel border border-indigo-500/20 shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Left: Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Photo */}
              <div className="relative group">
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-500/40 shadow-xl"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-transform active:scale-95"
                  title="Edit Profile Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {/* Username */}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {profile.username}
                </h1>

                {/* Phone Number & Joined Date */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" /> {profile.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> Joined {profile.joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Edit Profile Button */}
            <div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold gradient-btn flex items-center gap-2 shadow-lg"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>

          </div>

          {/* STATISTICS BAR */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center max-w-2xl">
            {/* Number of Blogs */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-lg sm:text-2xl font-extrabold text-white">{profile.stats.blogsCount}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Blogs</p>
            </div>

            {/* Followers */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-purple-400">
                <Users className="w-4 h-4" />
                <span className="text-lg sm:text-2xl font-extrabold text-white">{profile.stats.followersCount}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Followers</p>
            </div>

            {/* Following */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-pink-400">
                <UserCheck className="w-4 h-4" />
                <span className="text-lg sm:text-2xl font-extrabold text-white">{profile.stats.followingCount}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Following</p>
            </div>
          </div>

        </section>

        {/* TABS SECTION: SAVED BLOGS vs LIKED BLOGS */}
        <section className="space-y-6">
          {/* Tab Navigation Controls */}
          <div className="flex border-b border-slate-800 gap-6">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${
                activeTab === 'saved' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Saved Blogs ({savedBlogs.length})
            </button>

            <button
              onClick={() => setActiveTab('liked')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${
                activeTab === 'liked' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" /> Liked Blogs ({LIKED_BLOGS.length})
            </button>
          </div>

          {/* TAB 1: SAVED BLOGS GRID */}
          {activeTab === 'saved' && (
            <div>
              {loadingSaved ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading saved articles...</div>
              ) : savedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
                  No saved blogs found. Bookmark articles on the homepage to access them here!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIKED BLOGS GRID */}
          {activeTab === 'liked' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIKED_BLOGS.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/70 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {updateMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{updateMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. alexmorgan"
                  required
                  className="w-full bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Profile Photo (Image URL)</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold gradient-btn flex items-center gap-1.5"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
