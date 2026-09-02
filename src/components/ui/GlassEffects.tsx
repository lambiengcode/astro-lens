'use client';

import { useEffect } from 'react';

export default function GlassEffects() {
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const glass = target?.closest<HTMLElement>('.glass, .glass-1, .glass-2, .glass-3, .glass-strong');
      if (!glass) return;
      const rect = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      glass.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, []);
  return null;
}
