'use client';

import { useEffect, useRef } from 'react';
import { BRANCH_LABELS } from '@/lib/branches';
import { prefersReducedMotion } from '@/lib/motion';
import { useI18n } from '@/lib/i18n/context';
import { isDenseScript } from '@/lib/i18n/locales';

interface AstrolabeProps {
  /** Centre readout, chart-derived. Omitted on the loading variant. */
  soulBranch?: string;
  /** `loading` drops the pointer parallax and the centre readout. */
  variant?: 'hero' | 'loading';
}

// ============================================================
// VÒNG ĐỊA CHI — PLAN.md §5.2 geometry, §7.2 motion
// ============================================================
// 400×400 viewBox, centre c = 200. Every value below is from the spec;
// nothing here is decorative filler.

const S = 400;
const C = S / 2;

// Trig on the server and in the browser can disagree in the last binary digit,
// which React reports as a hydration mismatch on every tick and label. Three
// decimals is far finer than a 400-unit viewBox can show.
const r3 = (n: number) => Math.round(n * 1000) / 1000;

const ticks = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const long = i % 6 === 0;
  const r1 = long ? 150 : 157;
  return {
    key: i, long,
    x1: r3(C + r1 * Math.cos(a)), y1: r3(C + r1 * Math.sin(a)),
    x2: r3(C + 163 * Math.cos(a)), y2: r3(C + 163 * Math.sin(a)),
  };
});

const spokes = Array.from({ length: 12 }, (_, i) => {
  const a = ((i * 30 - 90) * Math.PI) / 180;
  return {
    key: i,
    x1: r3(C + 70 * Math.cos(a)), y1: r3(C + 70 * Math.sin(a)),
    x2: r3(C + 150 * Math.cos(a)), y2: r3(C + 150 * Math.sin(a)),
  };
});

const labels = BRANCH_LABELS.map((label, i) => {
  const a = ((i * 30 - 90) * Math.PI) / 180;
  return { key: i, label, x: r3(C + 178 * Math.cos(a)), y: r3(C + 178 * Math.sin(a)) };
});

export default function Astrolabe({ soulBranch, variant = 'hero' }: AstrolabeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { locale, t, v } = useI18n();
  // SVG text carries its size as an attribute, so the CSS floors in
  // globals.css cannot reach it. DESIGN.md §15.3's 11px minimum is applied
  // here instead — the only place in the app that needs it done by hand.
  const dense = isDenseScript(locale);

  // the dial leans toward the pointer and settles — PLAN §7.2
  useEffect(() => {
    if (variant !== 'hero') return;
    const host = hostRef.current;
    const svg = host?.querySelector('svg');
    const hero = host?.closest('.hero');
    if (!host || !svg || !hero) return;
    if (prefersReducedMotion()) return;

    const move = (e: Event) => {
      const me = e as MouseEvent;
      const r = hero.getBoundingClientRect();
      const dx = (me.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (me.clientY - (r.top + r.height / 2)) / r.height;
      svg.style.transform = `rotate(${dx * 4}deg) translate(${dx * 10}px, ${dy * 10}px)`;
    };
    const leave = () => { svg.style.transform = ''; };

    hero.addEventListener('mousemove', move);
    hero.addEventListener('mouseleave', leave);
    return () => {
      hero.removeEventListener('mousemove', move);
      hero.removeEventListener('mouseleave', leave);
    };
  }, [variant]);

  return (
    <div className="labe" ref={hostRef}>
      <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t.hero.dialAria}>
        <defs>
          <radialGradient id="labe-swp" cx="0.5" cy="0.5" r="0.5">
            <stop offset="55%" stopColor="rgba(94,201,214,0)" />
            <stop offset="100%" stopColor="rgba(94,201,214,.16)" />
          </radialGradient>
          <linearGradient id="labe-swl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(94,201,214,0)" />
            <stop offset="100%" stopColor="rgba(94,201,214,.55)" />
          </linearGradient>
        </defs>

        {/* radar sweep — 30° wedge */}
        <g className="sweep">
          <path
            d={`M ${C} ${C} L ${C + 163} ${C} A 163 163 0 0 0 ${C + 150.6} ${C - 62.4} Z`}
            fill="url(#labe-swp)"
          />
          <line x1={C} y1={C} x2={C + 163} y2={C} stroke="url(#labe-swl)" strokeWidth="1" />
        </g>

        <g className="g-draw">
          <circle className="d1" cx={C} cy={C} r="163" fill="none" stroke="var(--line2)" />
          <circle className="d2" cx={C} cy={C} r="150" fill="none" stroke="var(--line)" />
          <circle className="d3" cx={C} cy={C} r="106" fill="none" stroke="var(--line)" />
          <circle className="d4" cx={C} cy={C} r="70" fill="none" stroke="rgba(94,201,214,.28)" />
        </g>

        <g className="g-spokes">
          {spokes.map((s) => (
            <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="var(--line)" strokeWidth="1" />
          ))}
        </g>

        <g className="g-ticks">
          {ticks.map((t) => (
            <line
              key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.long ? 'var(--cyan)' : 'var(--line2)'}
              strokeWidth="1" opacity={t.long ? 0.75 : 0.5}
            />
          ))}
        </g>

        {/* labels counter-rotate against the ticks so they stay upright */}
        <g className="g-labels">
          {labels.map((l) => (
            <text
              key={l.key} x={l.x} y={l.y} fill="var(--tx3)" fontSize="11"
              fontFamily="var(--font-plex-mono), monospace"
              textAnchor="middle" dominantBaseline="middle"
            >
              {v(l.label, 'branch')}
            </text>
          ))}
        </g>

        <g className="g-tri-a">
          <polygon
            points={`${C},${C - 70} ${C + 61},${C + 35} ${C - 61},${C + 35}`}
            fill="none" stroke="rgba(94,201,214,.3)"
          />
        </g>
        <g className="g-tri-b">
          <polygon
            points={`${C},${C + 70} ${C - 61},${C - 35} ${C + 61},${C - 35}`}
            fill="none" stroke="rgba(232,178,90,.22)"
          />
        </g>

        <circle className="core" cx={C} cy={C} r="25" fill="none" stroke="var(--amber)" strokeOpacity=".5" />

        <g className="labe-txt">
          <text
            x={C} y={C - 4} fill="var(--amber)" fontSize="15"
            fontFamily="var(--font-noto-serif), serif"
            textAnchor="middle" dominantBaseline="middle"
          >
            紫微
          </text>
          {variant === 'hero' && (
            <text
              x={C} y={C + 13} fill="var(--tx3)" fontSize={dense ? 11 : 8.5}
              fontFamily="var(--font-plex-mono), monospace"
              textAnchor="middle" dominantBaseline="middle"
            >
              {soulBranch
                ? `${t.chart.menh.toUpperCase()} · ${v(soulBranch, 'branch').toUpperCase()}`
                : t.hero.dial}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
