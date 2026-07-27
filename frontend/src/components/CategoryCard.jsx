'use client';

import React from 'react';

export default function CategoryCard({ category, isActive = false, onClick }) {
  const { name, count, icon: IconSymbol } = category || {
    name: "Technology",
    count: 0
  };

  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-lg p-2 text-left transition-all duration-200 shadow-xs ${
        isActive 
          ? 'bg-amber-50 border-2 border-[#ff9432] ring-1 ring-[#ff9432]/40 shadow-sm' 
          : 'bg-white border border-slate-300 hover:border-[#ff9432] hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className={`w-6 h-6 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 group-hover:text-[#ff9432] transition-colors shrink-0 ${isActive ? 'text-[#ff9432] border-amber-300 bg-white' : ''}`}>
          {IconSymbol ? <IconSymbol className="w-3.5 h-3.5" /> : <span className="font-bold text-[10px]">{name.charAt(0)}</span>}
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
          {count}
        </span>
      </div>
      <h3 className={`mt-1.5 text-xs font-semibold tracking-tight truncate transition-colors ${
        isActive ? 'text-amber-950 font-bold' : 'text-slate-800 group-hover:text-[#ff9432]'
      }`}>
        {name}
      </h3>
    </button>
  );
}
