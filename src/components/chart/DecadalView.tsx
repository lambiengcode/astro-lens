'use client';

import { useEffect, useRef, useState } from 'react';
import type { DecadalPeriod } from '@/types';
import { decadalProgress, decadeIndexAt, yearOfAge } from '@/lib/branches';
import { starsOrBorrowed } from '@/lib/chart-derived';
import type { ChartData } from '@/types';
import { useI18n } from '@/lib/i18n/context';

interface DecadalViewProps {
  periods: DecadalPeriod[];
  birthYear: number;
  /** Used to name the stars a vô chính diệu running decade borrows. */
  chart?: ChartData;
  /** Pinned in fixture mode so parity snapshots do not rot — PLAN §10.1. */
  referenceYear?: number;
}

export default function DecadalView({ periods, birthYear, chart, referenceYear }: DecadalViewProps) {
  const { t, v } = useI18n();
  const nowYear = referenceYear ?? new Date().getFullYear();
  const currentAge = nowYear - birthYear + 1; // tuổi mụ
  const tlRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  const currentIndex = decadeIndexAt(periods, currentAge);
  const current = periods[currentIndex];
  const progress = current
    ? decadalProgress(currentAge, current.range[0], current.range[1])
    : 0;
  const yearInDecade = current ? currentAge - current.range[0] + 1 : 0;

  // The bar fills to where you are in the decade — computed, never hardcoded.
  // Under reduced motion the media block pins it to --dv-progress immediately.
  useEffect(() => {
    const t = setTimeout(() => setRun(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="dv-head">
        <h3>{t.decadal.title}</h3>
        {current && (
          <span className="now">
            {t.decadal.running} · {current.range[0]}–{current.range[1]} {t.decadal.age} ·{' '}
            {v(current.palaceName, 'palace')} · {t.decadal.yearPre} {yearInDecade}{t.decadal.ofTen}
          </span>
        )}
      </div>

      <div
        className={run ? 'tl run' : 'tl'}
        ref={tlRef}
        style={{ ['--dv-progress' as string]: `${progress}%` }}
      >
        {periods.map((p, i) => {
          const [start, end] = p.range;
          const isCurrent = i === currentIndex;
          const isPast = currentAge > end;
          // The running decade names what it borrows, so the table agrees with
          // the Điểm nổi bật card. Other empty decades stay at the vcd label.
          const borrowed = isCurrent && chart && !p.majorStars.length
            ? starsOrBorrowed(chart, p.earthlyBranch)
            : null;
          const stars = p.majorStars.length
            ? p.majorStars.map((s) => v(s.name, 'majorStar')).join(' · ')
            : borrowed?.stars.length
              ? `${v('mượn', 'relation')} ${borrowed.stars.map((s) => v(s.name, 'majorStar')).join(' · ')}`
              : v('vô chính diệu', 'relation');
          const hasStars = p.majorStars.length > 0 || !!borrowed?.stars.length;

          return (
            <div
              key={`${start}-${end}`}
              className={['tl-row', isPast ? 'past' : '', isCurrent ? 'on' : ''].filter(Boolean).join(' ')}
            >
              <div className="ages">{start}–{end}</div>
              <div>
                <div className="pn">{v(p.palaceName, 'palace')}</div>
                <div className="br">{v(p.earthlyBranch, 'branch')}</div>
              </div>
              <div>
                <div className={hasStars ? 'sts' : 'sts vcd'}>{stars}</div>
                {isCurrent && <div className="bar"><i /></div>}
              </div>
              <div className="yrs">{yearOfAge(birthYear, start)}–{yearOfAge(birthYear, end)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
