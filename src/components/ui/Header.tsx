'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b5bdb] to-[#9775cd] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(59,91,219,0.4)] transition-shadow">
            <span className="text-white text-sm font-bold">✦</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#5b8af5] to-[#e8b339] bg-clip-text text-transparent">
            Tử Vi Đẩu Số
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[#6b7a94] hover:text-[#e2e8f0] transition-colors">
            Trang chủ
          </Link>
          <Link
            href="/#lap-la-so"
            className="px-4 py-2 rounded-lg bg-[#3b5bdb]/10 border border-[#3b5bdb]/30 text-[#5b8af5] hover:bg-[#3b5bdb]/20 hover:border-[#3b5bdb]/50 transition-all"
          >
            Lập lá số
          </Link>
        </nav>
      </div>
    </header>
  );
}
