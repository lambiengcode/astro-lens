import type { ChartData, PalaceData, StarData } from '@/types';
import { BRANCH_LOOKUP, buildBranchMap, xung } from './branches';

/**
 * Values the interface reads off the chart. Nothing here is invented — each is
 * either a direct field or a rule the tradition already names.
 */

/** The four tứ hóa on the natal chart, in Lộc · Quyền · Khoa · Kỵ order. */
export function natalMutagens(chart: ChartData): { mutagen: string; star: string }[] {
  const order = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];
  const found: { mutagen: string; star: string }[] = [];
  for (const p of chart.palaces) {
    for (const s of [...p.majorStars, ...p.minorStars]) {
      if (s.mutagen) found.push({ mutagen: s.mutagen, star: s.name });
    }
  }
  return found.sort((a, b) => order.indexOf(a.mutagen) - order.indexOf(b.mutagen));
}

/** The palace sitting on a branch label, if the chart has one there. */
export function palaceAt(chart: ChartData, branchLabel: string): PalaceData | undefined {
  const b = BRANCH_LOOKUP[branchLabel.trim()];
  if (b === undefined) return undefined;
  return buildBranchMap(chart.palaces).get(b);
}

/**
 * Chính tinh of a palace, or — when it is vô chính diệu — the stars it borrows
 * from its xung chiếu palace (mượn sao đối cung).
 */
export function starsOrBorrowed(chart: ChartData, branchLabel: string): {
  stars: StarData[]; borrowedFrom: string | null;
} {
  const p = palaceAt(chart, branchLabel);
  if (p && p.majorStars.length) return { stars: p.majorStars, borrowedFrom: null };

  const b = BRANCH_LOOKUP[branchLabel.trim()];
  if (b === undefined) return { stars: [], borrowedFrom: null };
  const opposite = buildBranchMap(chart.palaces).get(xung(b));
  if (!opposite || !opposite.majorStars.length) return { stars: [], borrowedFrom: null };
  return { stars: opposite.majorStars, borrowedFrom: opposite.earthlyBranch };
}
