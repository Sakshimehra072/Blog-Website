'use client';

import React from 'react';

export default function CategoryCard({ category, isActive = false, onClick }) {
  const { name, count, icon: IconSymbol, color = "from-indigo-500 to-purple-500" } = category || {
    name: "Technology",
    count: 24,
    color: "from-indigo-500 to-purple-500"
  };

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 text-left glass-card transition-all duration-300 ${
        isActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {IconSymbol ? <IconSymbol className="w-5 h-5" /> : <span className="font-bold">{name.charAt(0)}</span>}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
          {count} posts
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
        {name}
      </h3>
    </button>
  );
}
