'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import BlogCard from '../../components/BlogCard';
import { useAuth } from '../../context/AuthContext';
import { createBlogApi } from '../../services/blogService';
import { 
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
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Route Guard: Prompt login modal if user visits /write directly without authenticating
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setIsAuthModalOpen(true);
    }
  }, [authLoading, isLoggedIn]);

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setPreviewImage(base64Data);
      setCoverImageUrl(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!title || !title.trim()) {
      setErrorMsg('Please enter an article title.');
      return false;
    }
    if (!category) {
      setErrorMsg('Please select a category.');
      return false;
    }
    if (!description || !description.trim()) {
      setErrorMsg('Please write article content.');
      return false;
    }
    if (description.trim().length < 20) {
      setErrorMsg('Article content should be at least 20 characters long.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      category,
      coverImage: coverImageUrl || previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description.trim(),
      authorId: user?.id || null,
      authorName: user?.name || user?.username || user?.email || 'Registered Author',
      authorAvatar: user?.avatar_url || user?.profile_image || null
    };

    const res = await createBlogApi(payload);
    setLoading(false);

    if (res && (res.success || res.blog)) {
      setSuccessMsg('🎉 Blog published successfully! Redirecting to Home...');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/?published=true#blogs';
        }
      }, 500);
    } else {
      setErrorMsg(res.message || 'Failed to publish article. Please try again.');
    }
  };

  const previewPostData = {
    id: 'preview',
    title: title || 'Your Article Title Preview',
    excerpt: description || 'Your article description and content preview...',
    category: category || 'Technology',
    author: {
      name: user?.name || user?.username || 'Registered Author',
      avatar: user?.avatar_url || null
    },
    coverImage: coverImageUrl || previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    likes: 0,
    comments: 0
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Header onOpenAuthModal={handleOpenAuthModal} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        {/* Editorial Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-300">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Draft New Article</h1>
            <p className="text-xs text-slate-500 mt-1">Share knowledge, tutorials, and engineering essays.</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" /> {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center gap-1.5 shadow-xs transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Publish <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-slate-700"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {isPreviewMode ? (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff9432]" /> Card Preview
              </h3>
              <button onClick={() => setIsPreviewMode(false)} className="text-xs text-[#ff9432] font-semibold hover:underline">Back to Editor</button>
            </div>
            <div className="max-w-md mx-auto">
              <BlogCard blog={previewPostData} />
            </div>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 space-y-5 shadow-xs">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your article..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ff9432] focus:bg-white appearance-none font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Cover Image
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 border border-dashed border-slate-300 hover:border-slate-400 cursor-pointer transition-colors text-center space-y-1.5">
                  <Upload className="w-5 h-5 text-[#ff9432]" />
                  <span className="text-xs font-semibold text-slate-700">Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-col justify-center space-y-1.5">
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Or paste an image web URL</p>
                </div>
              </div>

              {(coverImageUrl || previewImage) && (
                <div className="relative aspect-[16/7] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-300 mt-2">
                  <img
                    src={coverImageUrl || previewImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Article Content
              </label>
              <textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your article content here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff9432] focus:bg-white leading-relaxed font-sans"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs"
              >
                Preview Card
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center gap-1.5 shadow-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Publish Story <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>

          </form>
        )}

      </main>

      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
        message="Please sign in or create an account to write and publish a blog."
        redirectUrl="/write"
      />
      <Footer />
    </div>
  );
}
