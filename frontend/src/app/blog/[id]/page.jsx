'use client';

import React, { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BlogCard from '../../../components/BlogCard';
import LikeButton from '../../../components/LikeButton';
import CommentButton from '../../../components/CommentButton';
import ShareButton from '../../../components/ShareButton';
import FavouriteButton from '../../../components/FavouriteButton';
import SubscribeButton from '../../../components/SubscribeButton';
import CommentSection from '../../../components/CommentSection';
import Modal from '../../../components/Modal';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  BookOpen 
} from 'lucide-react';

// Sample Detailed Post
const BLOG_POST = {
  id: 1,
  title: "Building High-Performance Full Stack Web Apps in 2026",
  coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  category: "Technology",
  publishDate: "July 24, 2026",
  readTime: "6 min read",
  author: {
    id: "author_john_smith",
    name: "John Smith",
    role: "Senior Software Architect & Tech Essayist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Passionate about full-stack engineering, web performance, and distributed backend systems."
  },
  content: [
    "Modern web application development has evolved exponentially over the past few years. Building responsive, highly interactive, and lightning-fast full stack applications requires careful architectural choices across the frontend UI, middleware, API design, and database queries.",
    "Using Next.js alongside Express and MySQL provides an unmatched developer experience paired with outstanding runtime performance. By leveraging server-side rendering, component-driven layouts, and connection pools, applications achieve sub-second page loads and seamless user engagement.",
    "State management, caching layers, and responsive CSS systems (such as Tailwind CSS and custom glassmorphism components) ensure your interface looks stunning across mobile screens, tablets, and desktop displays.",
    "In conclusion, prioritizing modular component design, resilient authentication (such as Twilio OTP and JWTs), and strict input validation empowers engineering teams to ship production-ready web apps with confidence."
  ],
  likes: 142
};

// Sample Related Blogs
const RELATED_BLOGS = [
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

export default function BlogDetailsPage({ params }) {
  const blogId = params?.id || '1';
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(2);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Header */}
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Main Blog Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Back Navigation Link */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" /> Back to All Stories
          </a>
        </div>

        {/* Article Meta Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3.5 py-1 rounded-full font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {BLOG_POST.category}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> {BLOG_POST.publishDate}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-pink-400" /> {BLOG_POST.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {BLOG_POST.title}
          </h1>

          {/* Author Card + Subscribe Feature */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={BLOG_POST.author.avatar}
                alt={BLOG_POST.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
              />
              <div>
                <p className="text-xs text-slate-400">Written by</p>
                <h4 className="text-base font-bold text-white">{BLOG_POST.author.name}</h4>
                <p className="text-[11px] text-slate-400">{BLOG_POST.author.role}</p>
              </div>
            </div>

            {/* Author Subscribe Button */}
            <div>
              <SubscribeButton authorId={BLOG_POST.author.id} compact />
            </div>
          </div>
        </div>

        {/* Blog Image */}
        <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <img
            src={BLOG_POST.coverImage}
            alt={BLOG_POST.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Action Bar (Like, Comment, Favourite, Share) */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3">
            <LikeButton initialLikes={BLOG_POST.likes} />
            <CommentButton count={commentCount} />
          </div>
          <div className="flex items-center gap-2">
            <FavouriteButton />
            <ShareButton title={BLOG_POST.title} />
          </div>
        </div>

        {/* Full Article Content */}
        <article className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6 text-slate-200 leading-relaxed text-base sm:text-lg">
          {BLOG_POST.content.map((paragraph, index) => (
            <p key={index} className="text-slate-300">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Interactive Comment Section (Add, Edit, Delete, Reply, Comment Count) */}
        <CommentSection blogId={blogId} onCountChange={(cnt) => setCommentCount(cnt)} />

        {/* Related Blogs Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Related Blogs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RELATED_BLOGS.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>

      </main>

      {/* Global Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
