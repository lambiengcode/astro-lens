'use client';

import { useState } from 'react';
import type { RectificationCandidate } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { getProfile } from '@/lib/i18n/profiles';

interface Props {
  candidates: RectificationCandidate[];
  solarDate: string;
  gender: 'male' | 'female';
  name?: string;
  onSelect: (timeIndex: number) => void;
  onBack: () => void;
}

/**
 * No mockup section. Per PLAN.md §11 D2 this reuses the palace-cell visual
 * language as a card grid at reduced density: the same three-tier star
 * hierarchy, the same footer split, the same hairline structure.
 */
export default function CandidateSelection({ candidates, solarDate, gender, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { locale, t, v } = useI18n();

  return (
    <div>
      <div className="cand-head">
        <h3>{t.candidates.head}</h3>
        <p>
          {t.candidates.intro}{' '}
          <span className="mono" style={{ color: 'var(--tx2)' }}>{solarDate}</span> ·{' '}
          <span className="mono" style={{ color: 'var(--tx2)' }}>
            {gender === 'male' ? t.form.male : t.form.female}
          </span>
        </p>
      </div>

      <div className="cand-grid" role="radiogroup" aria-label={t.candidates.groupLabel}>
        {candidates.map((c) => {
          const [archetype, tags, , ] = getProfile(locale, c.menhMajorStars);
          const isSelected = selected === c.timeIndex;
          return (
            <button
              type="button"
              key={c.timeIndex}
              role="radio"
              aria-checked={isSelected}
              className={isSelected ? 'cand on' : 'cand'}
              onClick={() => setSelected(c.timeIndex)}
            >
              <div className="cand-b">
                <div className="majors">
                  {c.menhMajorStars.length > 0
                    ? c.menhMajorStars.map((s) => (
                        <div className="maj" key={s}>
                          <span className="nm">{v(s, 'majorStar')}</span>
                        </div>
                      ))
                    : <div className="empty">{v('vô chính diệu', 'relation')}</div>}
                </div>
                <div className="arch">{archetype}</div>
                <div className="tags">
                  {tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <div className="cand-f">
                <div className="hr">{v(c.hourBranch, 'branch')} · {c.hourRange}</div>
                <div className="rt">
                  {t.candidates.menh}<br />{v(c.menhEarthlyBranch, 'branch')}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="cand-acts">
        <button type="button" className="btn" onClick={onBack}>{t.candidates.back}</button>
        <button
          type="button"
          className="btn pri"
          style={{ flex: 1 }}
          disabled={selected === null}
          onClick={() => selected !== null && onSelect(selected)}
        >
          {t.candidates.confirm}
        </button>
      </div>

      <p className="hint-note" style={{ marginTop: 12, marginBottom: 0 }}>
        {t.candidates.hint}
      </p>
    </div>
  );
}
