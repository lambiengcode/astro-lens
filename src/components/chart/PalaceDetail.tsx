'use client';

import type { PalaceData, StarData } from '@/types';
import { BRANCH_LABELS, BRANCH_LOOKUP, buildBranchMap, xung, tamHop } from '@/lib/branches';
import { useI18n } from '@/lib/i18n/context';
import type { Domain } from '@/lib/i18n/vocabulary';

type V = (value: string | undefined | null, domain?: Domain) => string;

function starLine(v: V, domain: Domain) {
  return function line(s: StarData, i: number) {
    return (
      <div className="li" key={i}>
        <span className="star-a">{v(s.name, domain)}</span>
        {s.brightness && <span className="bl">{v(s.brightness, 'brightness')}</span>}
        {s.mutagen && (
          <span className={`mut${s.mutagen === 'Kỵ' ? ' ky' : ''}`}>{v(s.mutagen, 'mutagen')}</span>
        )}
      </div>
    );
  };
}

function describe(v: V, noData: string, p: PalaceData | undefined, branch: number): string {
  if (!p) return `${v(BRANCH_LABELS[branch], 'branch')} — ${noData}`;
  const stars = p.majorStars.length
    ? p.majorStars
        .map((s) => [v(s.name, 'majorStar'), v(s.brightness, 'brightness')].filter(Boolean).join(' '))
        .join(' · ')
    : v('vô chính diệu', 'relation');
  return `${v(p.name, 'palace')} (${v(p.earthlyBranch, 'branch')}) — ${stars}`;
}

/** One line naming both trine palaces, so it sits on a single row. */
function trineLine(v: V, map: Map<number, PalaceData>, branches: number[]): string {
  if (!branches.length) return '—';
  return branches
    .map((b) => {
      const p = map.get(b);
      return p
        ? `${v(p.name, 'palace')} (${v(p.earthlyBranch, 'branch')})`
        : v(BRANCH_LABELS[b], 'branch');
    })
    .join(' · ');
}

interface PalaceDetailProps {
  palace: PalaceData;
  /** Full palace list — the relationship column is computed from it. */
  palaces: PalaceData[];
  onClose: () => void;
}

export default function PalaceDetail({ palace, palaces, onClose }: PalaceDetailProps) {
  const { t, v } = useI18n();
  const branchMap = buildBranchMap(palaces);
  const branch = BRANCH_LOOKUP[palace.earthlyBranch.trim()];
  const hasBranch = branch !== undefined;

  const xungBranch = hasBranch ? xung(branch) : null;
  const hopBranches = hasBranch ? tamHop(branch) : [];

  const meta = [
    `${v(palace.heavenlyStem, 'stem')} ${v(palace.earthlyBranch, 'branch')}`,
    palace.decadalRange ? `${palace.decadalRange} ${t.palace.age}` : null,
    v(palace.changsheng12, 'changsheng') || null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="drawer">
      <div className="drawer-h">
        <span className="bx">{v(palace.earthlyBranch, 'branch')}</span>
        <h3>{t.palace.titlePre} {v(palace.name, 'palace')}</h3>
        <span className="bl">{meta}</span>
        {palace.isBodyPalace && (
          <span className="bl" style={{ color: 'var(--cyan)' }}>{t.chart.thanMark}</span>
        )}
        <button type="button" className="x" onClick={onClose} aria-label={t.palace.close}>✕</button>
      </div>

      <div className="drawer-b">
        <div className="dcol">
          <h5>{t.palace.majorStars}</h5>
          {palace.majorStars.length > 0
            ? palace.majorStars.map(starLine(v, 'majorStar'))
            : (
              <div className="li g" style={{ fontStyle: 'italic' }}>
                {v('vô chính diệu', 'relation')}
              </div>
            )}
        </div>

        <div className="dcol">
          <h5>{t.palace.minorStars}</h5>
          {palace.minorStars.length > 0
            ? palace.minorStars.map((s, i) => (
                <div className="li" key={i}>
                  <span className="star-c">{v(s.name, 'minorStar')}</span>
                  {s.brightness && <span className="bl">{v(s.brightness, 'brightness')}</span>}
                  {s.mutagen && (
                    <span className={`mut${s.mutagen === 'Kỵ' ? ' ky' : ''}`}>
                      {v(s.mutagen, 'mutagen')}
                    </span>
                  )}
                </div>
              ))
            : <div className="li g">{t.palace.none}</div>}
        </div>

        <div className="dcol">
          <h5>{t.palace.adjectiveStars}</h5>
          <div className="li g">
            {palace.adjectiveStars.length > 0
              ? palace.adjectiveStars.map((s) => v(s.name, 'adjectiveStar')).join(' · ')
              : t.palace.none}
          </div>
        </div>

        {/* The relationship view mirrored as text — DESIGN.md §9.3 keyboard parity */}
        <div className="dcol">
          <h5>{t.palace.opposite}</h5>
          <div className="li q">
            {xungBranch !== null
              ? describe(v, t.palace.noData, branchMap.get(xungBranch), xungBranch)
              : '—'}
          </div>
          <h5 style={{ marginTop: 12 }}>{t.palace.trine}</h5>
          <div className="li q">{trineLine(v, branchMap, hopBranches)}</div>
        </div>
      </div>
    </div>
  );
}
