import fs from 'node:fs';
import path from 'node:path';
import type { BirthInput, ChartData } from '@/types';
import { FIXTURE_INPUT, FIXTURE_RESULT } from '@/lib/fixture';
import type { StructureExpectation } from './checks';

// ============================================================
// GOLDEN CHARTS — P6 Part A
// ============================================================
//
// Two charts, not one: a single chart cannot tell a reading that handles vô
// chính diệu well from one that never met it. Both are FROZEN — `generateChart`
// calls `astrolabe.horoscope(today)`, so a live chart drifts with the calendar,
// and two runs being compared must see byte-identical input or the comparison
// means nothing.

export interface GoldenChart {
  id: string;
  title: string;
  chart: ChartData;
  input: BirthInput;
  expect: StructureExpectation;
  /** What makes this chart worth having in the set. */
  shape: string;
}

const b = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, 'chart-b.json'), 'utf8'),
) as { input: BirthInput; chart: ChartData };

export const GOLDEN_CHARTS: GoldenChart[] = [
  {
    id: 'a-tuvi-ty',
    title: 'Tử Vi tại Tỵ — the textbook chart',
    chart: FIXTURE_RESULT.chart,
    input: FIXTURE_INPUT,
    // The fixture carries no Bazi and the input no self-description, so the
    // prompt's own rule says sections 10 and 11 must be skipped.
    expect: { bazi: false, selfDescription: false },
    shape: 'Giáp year, 3 vô chính diệu palaces, tứ hóa on Liêm Trinh / Phá Quân / '
         + 'Vũ Khúc / Thái Dương. No Bazi, no self-description — sections 10 and 11 '
         + 'must be absent.',
  },
  {
    id: 'b-vcd-tan',
    title: 'Tân year, four vô chính diệu',
    chart: b.chart,
    input: { ...b.input, selfDescription: SELF_DESCRIPTION_B() },
    // Real iztro output, so it has Bazi; and the input supplies a
    // self-description. Both conditional sections are required here.
    expect: { bazi: true, selfDescription: true },
    shape: 'Tân year, 4 vô chính diệu palaces (Nô Bộc, Thiên Di, Tật Ách, Tử Nữ), '
         + 'tứ hóa on Thái Dương / Cự Môn / Văn Khúc / Văn Xương, Bazi present, '
         + 'self-description supplied — sections 10 and 11 are required.',
  },
];

/**
 * Between them the two charts exercise every branch of the output template:
 * chart A must omit sections 10 and 11, chart B must write both.
 */
function SELF_DESCRIPTION_B(): string {
  return 'Tôi làm kỹ thuật, hay nhận việc khó rồi ôm một mình. Ngại nhờ người khác. '
       + 'Đang phân vân giữa ở lại công ty cũ và tự mở dịch vụ riêng.';
}

export function goldenById(id: string): GoldenChart | undefined {
  return GOLDEN_CHARTS.find((c) => c.id === id);
}
