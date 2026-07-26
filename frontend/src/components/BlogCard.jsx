'use client';

import React from 'react';
import LikeButton from './LikeButton';
import CommentButton from './CommentButton';
import ShareButton from './ShareButton';
import FavouriteButton from './FavouriteButton';
import { ArrowRight, User } from 'lucide-react';

export default function BlogCard({ blog }) {
  const post = blog || {
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
  };

  const blogUrl = `/blogs/${post.id}`;

  const handleCardClick = (e) => {
    // Navigate to blog details route when user clicks on card
    if (typeof window !== 'undefined') {
      window.location.href = blogUrl;
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer"
    >
      <div className="space-y-4">
        
        {/* 1. Cover Image */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="px-5 space-y-3">
          {/* 2. Category */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {post.category}
            </span>
          </div>

          {/* 3. Blog Title */}
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {/* 4. Author Name */}
          <div className="flex items-center gap-2 pt-1">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-xs font-medium text-slate-300">{post.author?.name || "Anonymous"}</span>
          </div>

          {/* 5. Short Description */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          {/* 6. Action Bar (Like, Comment, Favourite, Share) - Stops Propagation so clicking buttons won't navigate card */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="pt-2 flex items-center justify-between border-t border-slate-800/80 cursor-default"
          >
            <div className="flex items-center gap-2">
              <LikeButton initialLikes={post.likes} />
              <CommentButton count={post.comments} />
            </div>
            <div className="flex items-center gap-1.5">
              <FavouriteButton />
              <ShareButton title={post.title} />
            </div>
          </div>

          {/* 7. Read More Button */}
          <div className="pt-2 pb-2">
            <a
              href={blogUrl}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700/80 hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 hover:text-white transition-all duration-200 group/btn"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </article>
  );
}
