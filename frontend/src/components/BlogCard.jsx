'use client';

import React from 'react';
import LikeButton from './LikeButton';
import CommentButton from './CommentButton';
import ShareButton from './ShareButton';
import FavouriteButton from './FavouriteButton';

export default function BlogCard({ blog }) {
  if (!blog) return null;

  const blogId = blog.id;
  const title = blog.title || 'Untitled Article';
  const excerpt = blog.excerpt || blog.description || '';
  const category = blog.category || 'General';
  const coverImage = blog.coverImage || blog.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
  
  const authorName = blog.author?.name || blog.author_name || 'Anonymous Author';
  const authorAvatar = blog.author?.avatar || blog.author_avatar;
  const firstLetter = authorName.trim().charAt(0).toUpperCase() || 'A';

  const readTime = blog.readTime || blog.read_time || '5 min read';

  const likesCount = Array.isArray(blog.likes)
    ? blog.likes.length
    : (typeof blog.likes === 'number' ? blog.likes : (blog.likes_count || 0));

  const commentsCount = Array.isArray(blog.comments)
    ? blog.comments.length
    : (typeof blog.comments === 'number' ? blog.comments : (blog.comments_count || 0));
  
  const formattedDate = blog.createdAt || blog.created_at 
    ? new Date(blog.createdAt || blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const blogUrl = `/blogs/${blogId}`;

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = blogUrl;
    }
  };

  const handleCommentClick = (e) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.location.href = `${blogUrl}#discussion`;
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white border border-slate-300 shadow-sm hover:border-[#ff9432] hover:shadow-md rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer"
    >
      <div className="space-y-3">
        
        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-200">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />
        </div>

        <div className="px-4 pb-2 space-y-2.5">
          {/* Category & Read time */}
          <div className="flex items-center justify-between text-xs">
            <span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-amber-50 text-amber-900 border border-amber-300">
              {category}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{readTime}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#ff9432] transition-colors line-clamp-2 leading-snug tracking-tight">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {excerpt}
          </p>

          {/* Author info & Publish Date */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#ff9432] flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
                  {firstLetter}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{authorName}</span>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">{formattedDate}</span>
          </div>

        </div>
      </div>

      {/* Action Toolbar */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between cursor-default text-xs"
      >
        <div className="flex items-center gap-2">
          <LikeButton blogId={blogId} initialLikes={likesCount} />
          <CommentButton blogId={blogId} count={commentsCount} onClick={handleCommentClick} />
        </div>
        <div className="flex items-center gap-1.5">
          <FavouriteButton blogId={blogId} />
          <ShareButton title={title} />
        </div>
      </div>
    </article>
  );
}
