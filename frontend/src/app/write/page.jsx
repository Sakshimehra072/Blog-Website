'use client';

import React, { useState } from 'react';
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
  Tag,
  PenTool,
  Home,
  BookOpen
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
  
  // Publish Success Modal state
  const [publishedBlog, setPublishedBlog] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  const resetForm = () => {
    setTitle('');
    setCategory('Technology');
    setCoverImageUrl('');
    setDescription('');
    setSelectedFile(null);
    setPreviewImage('');
    setIsPreviewMode(false);
    setErrorMsg('');
    setIsSuccessModalOpen(false);
  };

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      category,
      coverImage: coverImageUrl || previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description.trim(),
      authorName: user?.name || user?.username || 'Registered Author',
      authorAvatar: user?.avatar_url || null
    };

    const res = await createBlogApi(payload);
    setLoading(false);

    if (res && (res.success || res.blog)) {
      const blogObj = res.blog || {
        id: Date.now(),
        ...payload
      };
      setPublishedBlog(blogObj);
      setIsSuccessModalOpen(true);
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
    <div className="min-h-screen flex flex-col justify-between bg-[#FEF9C3]">
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

      {/* Publish Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 text-center space-y-5 shadow-xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 text-[#ff9432] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-[#ff9432]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Blog Published Successfully!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-normal">
                Your article is now live on BlogVerse and instantly visible to all readers.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              {publishedBlog?.id && (
                <a
                  href={`/blogs/${publishedBlog.id}`}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#ff9432] hover:bg-[#e88325] text-white flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <BookOpen className="w-4 h-4" /> View Blog
                </a>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#ff9432]" /> Write Another
                </button>

                <a
                  href="/#blogs"
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5 text-slate-500" /> Go to Home
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      <Footer />
    </div>
  );
}
