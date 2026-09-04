import { describe, expect, it } from 'vitest';
import {
  VOCABULARY, conceptsIn, term, type Domain, type VocabRow,
} from '@/lib/i18n/vocabulary';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { FIXTURE_RESULT } from '@/lib/fixture';
import { BRANCH_LABELS } from '@/lib/branches';

// ============================================================
// TEST 6 — vocabulary completeness. PLAN.md §13b.7
// ============================================================
//
// "Every concept key resolves in all five locales; no empty cells, no key
// present in one locale and missing in another. Assert the table's concept
// count matches the count of palaces/stars/stems/branches actually rendered."
//
// This is a completeness test and, as PLAN.md says in the same breath, it is
// not a substitute for the terms being *correct* — that is what sourcing them
// from iztro is for. See PARITY.md §9 for the cells that depart from iztro.

const COL: Record<Locale, 1 | 2 | 3 | 4 | 5> = {
  vi: 1, 'zh-Hans': 2, 'zh-Hant': 3, ko: 4, en: 5,
};

describe('vocabulary table', () => {
  it('gives every concept a non-empty cell in all five locales', () => {
    const empties: string[] = [];
    for (const [key, row] of Object.entries(VOCABULARY)) {
      for (const locale of LOCALES) {
        const cell = row[COL[locale]];
        if (typeof cell !== 'string' || cell.trim() === '') {
          empties.push(`${key}/${locale}`);
        }
      }
    }
    expect(empties).toEqual([]);
  });

  it('has exactly six positions in every row', () => {
    for (const [key, row] of Object.entries(VOCABULARY)) {
      expect(row.length, key).toBe(6);
    }
  });

  it('covers the closed rings at their canonical sizes', () => {
    // The sizes the tradition fixes, and PLAN.md §13b.3 enumerates.
    const expected: [Domain, number][] = [
      ['palace', 14],        // 12 + Thân + Lai Nhân
      ['majorStar', 14],     // the fourteen chính tinh
      ['minorStar', 14],
      ['changsheng', 12],    // vòng Trường Sinh
      ['boshi', 12],         // vòng Bác Sĩ
      ['jiangqian', 12],
      ['brightness', 7],     // iztro's seven; the chart legend names five of them
      ['mutagen', 4],        // Lộc · Quyền · Khoa · Kỵ
      ['stem', 10],          // thiên can
      ['branch', 12],        // địa chi
      ['fiveElements', 5],   // ngũ hành cục
      ['zodiac', 12],
      ['sign', 12],
    ];
    for (const [domain, size] of expected) {
      expect(conceptsIn(domain).length, domain).toBe(size);
    }
  });

  it('keeps Traditional distinct from Simplified where the tradition does', () => {
    // DESIGN.md §15.7: Traditional is authored, never transformed. If the two
    // columns were ever generated from one another these would be equal.
    const pairs: [string, string, string][] = [
      ['soulPalace', '命宫', '命宮'],
      ['sihuaLu', '禄', '祿'],
      ['miao', '庙', '廟'],
      ['surfacePalace', '迁移', '遷移'],
      ['friendsPalace', '仆役', '僕役'],
      ['careerPalace', '官禄', '官祿'],
      ['lianzhenMaj', '廉贞', '廉貞'],
      ['qishaMaj', '七杀', '七殺'],
    ];
    for (const [key, hans, hant] of pairs) {
      const row = VOCABULARY[key] as VocabRow;
      expect(row, key).toBeDefined();
      expect(row[2], `${key} zh-Hans`).toBe(hans);
      expect(row[3], `${key} zh-Hant`).toBe(hant);
      expect(row[2]).not.toBe(row[3]);
    }
  });

  it('is the identity at vi, which is what keeps the parity baseline still', () => {
    for (const row of Object.values(VOCABULARY)) {
      expect(term(row[1], 'vi')).toBe(row[1]);
    }
    // Including a term the table has never heard of.
    expect(term('Nguyễn Minh Anh', 'vi')).toBe('Nguyễn Minh Anh');
  });
});

// ── Every value the app actually renders ─────────────────────────────────────
// The fixture is the chart the twelve parity screens are captured from, so
// "actually rendered" is exactly what it contains.

function fixtureTerms(): { value: string; domain?: Domain }[] {
  const chart = FIXTURE_RESULT.chart;
  const out: { value: string; domain?: Domain }[] = [
    { value: chart.gender, domain: 'gender' },
    { value: chart.time, domain: 'branch' },
    { value: chart.sign, domain: 'sign' },
    { value: chart.zodiac, domain: 'zodiac' },
    { value: chart.fiveElementsClass, domain: 'fiveElements' },
    { value: chart.soul, domain: 'majorStar' },
    { value: chart.body, domain: 'majorStar' },
    { value: chart.earthlyBranchOfSoulPalace, domain: 'branch' },
    { value: chart.earthlyBranchOfBodyPalace, domain: 'branch' },
  ];
  for (const part of chart.chineseDate.split(/[\s·]+/).filter(Boolean)) {
    out.push({ value: part });
  }
  for (const p of chart.palaces) {
    out.push({ value: p.name, domain: 'palace' });
    out.push({ value: p.heavenlyStem, domain: 'stem' });
    out.push({ value: p.earthlyBranch, domain: 'branch' });
    out.push({ value: p.changsheng12, domain: 'changsheng' });
    out.push({ value: p.boshi12, domain: 'boshi' });
    for (const s of p.majorStars) {
      out.push({ value: s.name, domain: 'majorStar' });
      if (s.brightness) out.push({ value: s.brightness, domain: 'brightness' });
      if (s.mutagen) out.push({ value: s.mutagen, domain: 'mutagen' });
    }
    for (const s of p.minorStars) out.push({ value: s.name, domain: 'minorStar' });
    for (const s of p.adjectiveStars) out.push({ value: s.name, domain: 'adjectiveStar' });
  }
  for (const label of BRANCH_LABELS) out.push({ value: label, domain: 'branch' });
  for (const grade of ['miếu', 'vượng', 'đắc', 'bình', 'hãm']) {
    out.push({ value: grade, domain: 'brightness' });
  }
  for (const rel of ['vô chính diệu', 'mượn', 'tam hợp', 'xung chiếu']) {
    out.push({ value: rel, domain: 'relation' });
  }
  return out.filter((t) => t.value);
}

// A Vietnamese-only letter. `ư` and `ơ` also appear in no other locale here.
const VIETNAMESE = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

describe('every term the chart renders', () => {
  const all = fixtureTerms();

  it('has something to render (the fixture is not empty)', () => {
    expect(all.length).toBeGreaterThan(80);
  });

  for (const locale of LOCALES.filter((l) => l !== 'vi')) {
    it(`resolves out of Vietnamese at ${locale}`, () => {
      const unresolved = all
        .filter(({ value, domain }) => VIETNAMESE.test(term(value, locale, domain)))
        .map(({ value }) => value);
      expect([...new Set(unresolved)]).toEqual([]);
    });
  }
});
