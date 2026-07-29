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
      className={`group relative w-full overflow-hidden rounded-lg px-2.5 py-1.5 text-left transition-all duration-200 shadow-2xs flex items-center justify-between gap-1.5 ${
        isActive 
          ? 'bg-amber-50 border border-[#ff9432] ring-1 ring-[#ff9432]/30 shadow-xs' 
          : 'bg-white border border-slate-200 hover:border-[#ff9432] hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <div className={`w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#ff9432] transition-colors shrink-0 ${isActive ? 'text-[#ff9432] border-amber-300 bg-white' : ''}`}>
          {IconSymbol ? <IconSymbol className="w-3 h-3" /> : <span className="font-bold text-[9px]">{name.charAt(0)}</span>}
        </div>
        <h3 className={`text-[11px] font-semibold tracking-tight truncate transition-colors ${
          isActive ? 'text-amber-950 font-bold' : 'text-slate-800 group-hover:text-[#ff9432]'
        }`}>
          {name}
        </h3>
      </div>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
        isActive 
          ? 'bg-[#ff9432] text-white' 
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}>
        {count || 0}
      </span>
    </button>
  );
}
