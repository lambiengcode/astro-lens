'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { useI18n } from '@/lib/i18n/context';

/** Figures and units are locale-independent; only the labels are translated. */
const STATS = [
  { value: 12, unit: '' },
  { value: 108, unit: '+' },
  { value: 10, unit: '×' },
  { value: 100, unit: '%' },
];

/**
 * Figures count up over 1.1s on an ease-out cubic — PLAN.md §7.3.
 * Reduced motion renders the end value directly, never the animation.
 */
function useCountUp(target: number, start: boolean, reduced: boolean) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start || reduced) return;
    const dur = 1100;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, reduced]);

  return reduced ? target : n;
}

function Stat({ value, unit, label, start, reduced }: {
  value: number; unit: string; label: string; start: boolean; reduced: boolean;
}) {
  const n = useCountUp(value, start, reduced);
  return (
    <div className="stat">
      <div className="v">{n}{unit && <em>{unit}</em>}</div>
      <div className="k">{label}</div>
    </div>
  );
}

export default function StatStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const reduced = useReducedMotion();
  const { t } = useI18n();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setStart(true);
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="stats" ref={ref}>
      {STATS.map((s, i) => (
        <Stat key={i} {...s} label={t.stats[i]} start={start} reduced={reduced} />
      ))}
    </div>
  );
}
