'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 header-glass ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3b5bdb] to-[#9775cd] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_20px_rgba(59,91,219,0.4)] transition-shadow">
            <span className="text-white text-sm font-bold">✦</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#5b8af5] to-[#e8b339] bg-clip-text text-transparent">
            Tử Vi Đẩu Số
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-[#6b7a94] hover:text-[#e2e8f0] transition-colors px-2">
            Trang chủ
          </Link>
          <Link
            href="/#lap-la-so"
            className="pill press-spring px-4 py-2 chip-glass text-[#5b8af5] hover:text-[#8fb0ff] hover:border-[#3b5bdb]/40"
          >
            Lập lá số
          </Link>
        </nav>
      </div>
    </header>
  );
}
