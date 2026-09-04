'use client';

import { useEffect } from 'react';
import { useReducedMotion } from '@/lib/motion';

/**
 * Section reveal — PLAN.md §7.3: opacity 0→1 and 18px rise, .7s, fired once
 * per element at threshold .12. Renders nothing; it only observes the
 * `[data-rv]` elements already in the tree.
 */
export default function Reveal() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-rv]')];
    if (!els.length) return;

    if (reduced) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  return null;
}
