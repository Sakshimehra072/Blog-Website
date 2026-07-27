'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange && onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
              currentPage === page
                ? 'bg-[#ff9432] text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
