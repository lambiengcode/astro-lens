import type { PalaceData } from '@/types';

// ============================================================
// ĐỊA CHI — branch index, lookup and palace relationships
// ============================================================
//
// Branch index b: Tý = 0 … Hợi = 11.
//
//   Xung chiếu (opposition) = (b + 6) % 12       — one palace
//   Tam hợp    (trine)      = (b + 4) % 12, (b + 8) % 12
//
// These yield the canonical groups Thân Tý Thìn · Tỵ Dậu Sửu ·
// Dần Ngọ Tuất · Hợi Mão Mùi and the six opposing pairs.
// DESIGN.md §9.1 — asserted for all twelve branches in tests.

export const BRANCH_LABELS = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
] as const;

export const BRANCH_LOOKUP: Record<string, number> = {
  '子': 0, 'Tý': 0, 'tý': 0,
  '丑': 1, 'Sửu': 1, 'sửu': 1,
  '寅': 2, 'Dần': 2, 'dần': 2,
  '卯': 3, 'Mão': 3, 'mão': 3,
  '辰': 4, 'Thìn': 4, 'thìn': 4,
  '巳': 5, 'Tỵ': 5, 'tỵ': 5,
  '午': 6, 'Ngọ': 6, 'ngọ': 6,
  '未': 7, 'Mùi': 7, 'mùi': 7,
  '申': 8, 'Thân': 8, 'thân': 8,
  '酉': 9, 'Dậu': 9, 'dậu': 9,
  '戌': 10, 'Tuất': 10, 'tuất': 10,
  '亥': 11, 'Hợi': 11, 'hợi': 11,
};

/** The palace directly opposite — xung chiếu / đối cung. */
export function xung(b: number): number {
  return (b + 6) % 12;
}

/** The two other corners of the tam hợp triangle, in order. */
export function tamHop(b: number): [number, number] {
  return [(b + 4) % 12, (b + 8) % 12];
}

/** The full tam hợp group including `b` itself, ascending. */
export function tamHopGroup(b: number): number[] {
  return [b, ...tamHop(b)].sort((x, y) => x - y);
}

/**
 * Map branch index → palace. Behaviour is intentionally unchanged from the
 * original ChartGrid implementation, fallback path included: iztro returns
 * palaces in order starting from 寅 (Dần, index 2).
 */
export function buildBranchMap(palaces: PalaceData[]): Map<number, PalaceData> {
  const map = new Map<number, PalaceData>();
  for (const palace of palaces) {
    const branch = palace.earthlyBranch.trim();
    const idx = BRANCH_LOOKUP[branch];
    if (idx !== undefined) {
      map.set(idx, palace);
    }
  }
  // Fallback: iztro returns palaces in order starting from 寅(2)
  if (map.size < 12 && palaces.length === 12) {
    for (let i = 0; i < 12; i++) {
      const branchIdx = (i + 2) % 12;
      if (!map.has(branchIdx)) map.set(branchIdx, palaces[i]);
    }
  }
  return map;
}

export function isSoulPalace(palace: PalaceData): boolean {
  const n = palace.name.toLowerCase();
  return n.includes('mệnh') || n === '命宫' || n === '命宮';
}

/**
 * Position within the running đại vận, 0–100, counting the current year as
 * elapsed — so year 1 of 10 reads 10% and year 10 reads 100%, and the bar
 * always agrees with the "năm N/10" readout beside it. `age` outside the
 * decade clamps to the nearest end so a caller never renders a bar past its
 * track. DESIGN.md §8.11 — computed, never hardcoded.
 */
export function decadalProgress(age: number, start: number, end: number): number {
  const years = end - start + 1;
  if (years <= 0) return 0;
  return Math.min(100, Math.max(0, ((age - start + 1) / years) * 100));
}

/**
 * Calendar year a given tuổi falls in. Tuổi mụ is 1-based: a person born in
 * 1994 is 4 tuổi in 1997.
 */
export function yearOfAge(birthYear: number, age: number): number {
  return birthYear + age - 1;
}

/** "24-33" → "24–33". The data carries a hyphen; a range is set with an en dash. */
export function enDash(range: string): string {
  return range.replace('-', '–');
}
