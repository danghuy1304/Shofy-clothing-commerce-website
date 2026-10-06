'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AiStylistFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip Label */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-800 animate-in fade-in slide-in-from-right-2">
        <span>🤖 Tư vấn trang phục AI Stylist</span>
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
      </div>

      {/* Floating Action Button */}
      <Link
        href="/ai-stylist"
        className="flex items-center justify-center w-14 h-14 rounded-full green-gradient-bg text-white shadow-2xl shadow-emerald-900/40 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-300 relative"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping" />
        <Sparkles className="w-7 h-7 fill-white text-white relative z-10" />
      </Link>
    </div>
  );
}
