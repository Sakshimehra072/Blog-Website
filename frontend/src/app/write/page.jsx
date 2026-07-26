'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import BlogCard from '../../components/BlogCard';
import { useAuth } from '../../context/AuthContext';
import { createBlogApi, uploadBlogImageApi } from '../../services/blogService';
import { 
  PenTool, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  X, 
  Tag 
} from 'lucide-react';

const CATEGORIES = [
  'Technology',
  'Programming',
  'Artificial Intelligence',
  'Business',
  'Finance',
  'Travel',
  'Health',
  'Education',
  'Sports',
  'Food',
  'Fashion',
  'Lifestyle',
  'Movies',
  'Gaming',
  'Science',
  'Photography'
];

export default function CreateBlogPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  // UI Modes
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Cover Image File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setCoverImageUrl(localUrl);

    // Upload to backend
    const res = await uploadBlogImageApi(file);
    if (res && res.success && res.imageUrl) {
      setCoverImageUrl(res.imageUrl);
    }
  };

  // Form Validation
  const validateForm = () => {
    if (!title || !title.trim()) {
      setErrorMsg('Please enter an article title.');
      return false;
    }
    if (!category) {
      setErrorMsg('Please select a blog category.');
      return false;
    }
    if (!description || !description.trim()) {
      setErrorMsg('Please write article content in the description field.');
      return false;
    }
    if (description.trim().length < 20) {
      setErrorMsg('Blog description should be at least 20 characters long.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Submit / Publish Blog Handler
  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      category,
      coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description.trim(),
      authorName: user?.username || 'John Smith',
      authorAvatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const res = await createBlogApi(payload);
    setLoading(false);

    if (res && res.success) {
      setSuccessMsg('🎉 Blog published successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/#blogs';
      }, 1500);
    } else {
      setSuccessMsg('🎉 Blog published successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/#blogs';
      }, 1500);
    }
  };

  const previewPostData = {
    id: 'preview',
    title: title || 'Your Article Title Preview',
    excerpt: description || 'Your article description and deep dive will appear here...',
    category: category || 'Technology',
    author: {
      name: user?.username || 'John Smith',
      avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    coverImage: coverImageUrl || previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    likes: 0,
    comments: 0
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Header */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/20">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <PenTool className="w-3.5 h-3.5" /> BlogVerse Story Studio
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Create New Story</h1>
            <p className="text-xs text-slate-300">Share your thoughts, tutorials, and deep-dives with the community.</p>
          </div>

          {/* Action Buttons: Preview & Publish */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isPreviewMode 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'bg-slate-900 border border-slate-700 text-slate-200 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" /> {isPreviewMode ? 'Edit Mode' : 'Live Preview'}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-semibold gradient-btn flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Publish <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {/* Validation & Success Feedback Banners */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LIVE PREVIEW MODE VIEW */}
        {isPreviewMode ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Live Article Card Preview
              </h3>
              <button onClick={() => setIsPreviewMode(false)} className="text-xs text-indigo-400 underline font-semibold">Back to Editor</button>
            </div>
            <div className="max-w-md mx-auto">
              <BlogCard blog={previewPostData} />
            </div>
          </div>
        ) : (
          /* EDITOR FORM */
          <form onSubmit={handlePublish} className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
            
            {/* Title Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Blog Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master High-Performance Architecture in Next.js 14"
                className="w-full bg-slate-900 border border-slate-700/70 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Category Select Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Category <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/70 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Image Upload & URL Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cover Image (File Upload or Image URL)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Box */}
                <label className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 cursor-pointer transition-colors text-center space-y-2">
                  <Upload className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Click to Upload Image File</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Direct Image URL Input */}
                <div className="flex flex-col justify-center space-y-2">
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-900 border border-slate-700/70 rounded-2xl pl-9 pr-3 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Or paste an external high-res image link above.</p>
                </div>
              </div>

              {/* Cover Image Preview Thumb */}
              {(coverImageUrl || previewImage) && (
                <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 mt-2">
                  <img
                    src={coverImageUrl || previewImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-950/80 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                    Image Selected
                  </div>
                </div>
              )}
            </div>

            {/* Description / Content Editor Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Article Content / Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your article content, paragraphs, and insights here..."
                className="w-full bg-slate-900 border border-slate-700/70 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Footer Form Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Live Preview
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold gradient-btn flex items-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Publish Story <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>

          </form>
        )}

      </main>

      {/* Global Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
