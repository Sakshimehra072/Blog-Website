'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryCard from './CategoryCard';

export default function CategoryScrollSection({
  categories = [],
  activeCategory = null,
  onSelectCategory,
  title = "Explore Topics"
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 2;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 2;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollState();

    const handleScroll = () => checkScrollState();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollState);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollState();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollState);
      resizeObserver.disconnect();
    };
  }, [checkScrollState, categories]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <section id="categories" className="relative space-y-3 group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff9432] inline-block" />
          {title}
        </h2>
      </div>

      {/* Main Categories Row */}
      <div className="relative">
        {/* Left Navigation Edge Button */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Previous categories"
          className={`absolute left-0.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-700 flex items-center justify-center shadow-md transition-all duration-200 ${
            !canScrollLeft
              ? 'opacity-0 pointer-events-none scale-90'
              : 'opacity-100 hover:bg-slate-50 hover:text-slate-900 hover:scale-105 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Right Navigation Edge Button */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Next categories"
          className={`absolute right-0.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-700 flex items-center justify-center shadow-md transition-all duration-200 ${
            !canScrollRight
              ? 'opacity-0 pointer-events-none scale-90'
              : 'opacity-100 hover:bg-slate-50 hover:text-slate-900 hover:scale-105 active:scale-95'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Subtle Edge Fade Overlays */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-[#FEF9C3] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        <div 
          className={`absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-[#FEF9C3] to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`} 
        />

        {/* Scrollable Categories Row (8 cards per row on desktop) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scroll-smooth no-scrollbar py-0.5 px-0.5"
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex-shrink-0 w-[calc((100%-1*0.5rem)/2)] sm:w-[calc((100%-3*0.5rem)/4)] md:w-[calc((100%-5*0.5rem)/6)] lg:w-[calc((100%-7*0.5rem)/8)]"
            >
              <CategoryCard
                category={cat}
                isActive={activeCategory === cat.id}
                onClick={() => onSelectCategory && onSelectCategory(activeCategory === cat.id ? null : cat.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
