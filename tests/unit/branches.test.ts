import { describe, it, expect } from 'vitest';
import {
  BRANCH_LABELS, xung, tamHop, tamHopGroup, buildBranchMap, decadalProgress, yearOfAge, enDash,
} from '@/lib/branches';
import type { PalaceData } from '@/types';
import { FIXTURE_RESULT } from '@/lib/fixture';

const nameOf = (b: number) => BRANCH_LABELS[b];

// The four canonical tam hợp groups, by name.
const CANONICAL: string[][] = [
  ['Thân', 'Tý', 'Thìn'],
  ['Tỵ', 'Dậu', 'Sửu'],
  ['Dần', 'Ngọ', 'Tuất'],
  ['Hợi', 'Mão', 'Mùi'],
];

const sortedNames = (names: string[]) => [...names].sort();

describe('xung chiếu — all twelve branches', () => {
  for (let b = 0; b < 12; b++) {
    it(`${nameOf(b)} opposes ${nameOf((b + 6) % 12)}`, () => {
      expect(xung(b)).toBe((b + 6) % 12);
    });
  }

  it('is an involution: xung(xung(b)) === b', () => {
    for (let b = 0; b < 12; b++) expect(xung(xung(b))).toBe(b);
  });

  it('yields exactly six opposing pairs', () => {
    const pairs = new Set<string>();
    for (let b = 0; b < 12; b++) pairs.add([b, xung(b)].sort((x, y) => x - y).join('-'));
    expect(pairs.size).toBe(6);
  });
});

describe('tam hợp — all twelve branches', () => {
  for (let b = 0; b < 12; b++) {
    it(`${nameOf(b)} trines ${nameOf((b + 4) % 12)} and ${nameOf((b + 8) % 12)}`, () => {
      expect(tamHop(b)).toEqual([(b + 4) % 12, (b + 8) % 12]);
    });
  }

  for (let b = 0; b < 12; b++) {
    it(`${nameOf(b)} belongs to its canonical group, asserted by name`, () => {
      const names = sortedNames(tamHopGroup(b).map(nameOf));
      const expected = CANONICAL.find((g) => g.includes(nameOf(b)));
      expect(expected, `no canonical group contains ${nameOf(b)}`).toBeDefined();
      expect(names).toEqual(sortedNames(expected!));
    });
  }

  it('produces exactly the four canonical groups', () => {
    const groups = new Set<string>();
    for (let b = 0; b < 12; b++) groups.add(tamHopGroup(b).join('-'));
    expect(groups.size).toBe(4);
    const asNames = [...groups].map((g) => sortedNames(g.split('-').map((n) => nameOf(+n))).join(' '));
    expect(asNames.sort()).toEqual(CANONICAL.map((g) => sortedNames(g).join(' ')).sort());
  });

  it('never includes the xung palace', () => {
    for (let b = 0; b < 12; b++) expect(tamHop(b)).not.toContain(xung(b));
  });
});

describe('buildBranchMap', () => {
  const palaces = FIXTURE_RESULT.chart.palaces;

  it('maps every Vietnamese branch label for a complete chart', () => {
    const map = buildBranchMap(palaces);
    expect(map.size).toBe(12);
    const snapshot = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([b, p]) => `${b}:${nameOf(b)}=${p.name}(${p.earthlyBranch})`);
    expect(snapshot).toEqual([
      '0:Tý=Điền Trạch(Tý)',
      '1:Sửu=Quan Lộc(Sửu)',
      '2:Dần=Nô Bộc(Dần)',
      '3:Mão=Thiên Di(Mão)',
      '4:Thìn=Tật Ách(Thìn)',
      '5:Tỵ=Tài Bạch(Tỵ)',
      '6:Ngọ=Tử Tức(Ngọ)',
      '7:Mùi=Phu Thê(Mùi)',
      '8:Thân=Huynh Đệ(Thân)',
      '9:Dậu=Mệnh(Dậu)',
      '10:Tuất=Phụ Mẫu(Tuất)',
      '11:Hợi=Phúc Đức(Hợi)',
    ]);
  });

  it('maps Chinese branch characters too', () => {
    const cn = palaces.map((p, i) => ({
      ...p,
      earthlyBranch: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i],
    }));
    const map = buildBranchMap(cn);
    expect(map.size).toBe(12);
    expect(map.get(9)!.name).toBe('Mệnh');
  });

  it('trims whitespace around the branch', () => {
    const padded = palaces.map((p) => ({ ...p, earthlyBranch: `  ${p.earthlyBranch} ` }));
    expect(buildBranchMap(padded).size).toBe(12);
  });

  // The iztro fallback: palaces arrive in order starting from 寅 (Dần, index 2).
  it('falls back to iztro ordering when the branch labels are unrecognised', () => {
    const unlabelled: PalaceData[] = palaces.map((p) => ({ ...p, earthlyBranch: '???' }));
    const map = buildBranchMap(unlabelled);
    expect(map.size).toBe(12);
    for (let i = 0; i < 12; i++) {
      expect(map.get((i + 2) % 12)).toBe(unlabelled[i]);
    }
  });

  it('fills only the gaps when the mapping is partial', () => {
    const partial = palaces.map((p, i) => (i < 6 ? p : { ...p, earthlyBranch: '???' }));
    const map = buildBranchMap(partial);
    expect(map.size).toBe(12);
    // recognised entries keep their real branch
    expect(map.get(0)!.name).toBe('Điền Trạch');
    expect(map.get(5)!.name).toBe('Tài Bạch');
  });

  it('does not invent palaces when fewer than twelve are supplied', () => {
    const short = palaces.slice(0, 5).map((p) => ({ ...p, earthlyBranch: '???' }));
    expect(buildBranchMap(short).size).toBe(0);
  });
});

describe('đại vận progress', () => {
  // A 24–33 decade is ten years. Progress counts the current year as elapsed,
  // so the bar always agrees with the "năm N/10" readout beside it.
  it('is 10% in the first year of the decade', () => {
    expect(decadalProgress(24, 24, 33)).toBe(10);
  });

  it('is 100% in the last year of the decade', () => {
    expect(decadalProgress(33, 24, 33)).toBe(100);
  });

  it('is 50% at the midpoint', () => {
    expect(decadalProgress(28, 24, 33)).toBe(50);
  });

  it('tracks the year index exactly', () => {
    for (let year = 1; year <= 10; year++) {
      expect(decadalProgress(24 + year - 1, 24, 33)).toBeCloseTo(year * 10, 6);
    }
  });

  it('clamps outside the decade rather than overflowing its track', () => {
    expect(decadalProgress(10, 24, 33)).toBe(0);
    expect(decadalProgress(99, 24, 33)).toBe(100);
  });

  it('handles a single-year range without dividing by zero', () => {
    expect(decadalProgress(30, 30, 30)).toBe(100);
  });
});

describe('yearOfAge', () => {
  it('maps tuổi mụ to the calendar year', () => {
    expect(yearOfAge(1994, 4)).toBe(1997);
    expect(yearOfAge(1994, 24)).toBe(2017);
    expect(yearOfAge(1994, 33)).toBe(2026);
  });
});

describe('enDash', () => {
  it('sets a range with an en dash', () => {
    expect(enDash('24-33')).toBe('24–33');
    expect(enDash('114-123')).toBe('114–123');
  });
  it('leaves an empty range alone', () => {
    expect(enDash('')).toBe('');
  });
});
