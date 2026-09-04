'use client';

import type { ChartData } from '@/types';
import { useI18n } from '@/lib/i18n/context';

interface ChartSummaryProps {
  chart: ChartData;
  name?: string;
}

/**
 * A lá số summary is a table of readings, so it looks like one — DESIGN.md §8.6.
 * `mono` follows the rule in §6.2: a position, a cycle or a quantity is monospaced.
 */
export default function ChartSummary({ chart }: ChartSummaryProps) {
  const { t, v } = useI18n();
  // Dates and the can chi run stay as the chart produced them apart from the
  // stems and branches themselves, which are vocabulary — DESIGN.md §15.2.
  const canChi = chart.chineseDate.split(/(\s+|·)/).map((p) => v(p)).join('');
  const rows: { k: string; v: string; mono?: boolean }[] = [
    { k: t.summary.solarDate, v: chart.solarDate, mono: true },
    { k: t.summary.lunarDate, v: chart.lunarDate, mono: true },
    { k: t.summary.chineseDate, v: canChi },
    { k: t.summary.birthHour, v: `${v(chart.time, 'branch')} · ${chart.timeRange}`, mono: true },
    { k: t.summary.sign, v: v(chart.sign, 'sign') },
    { k: t.summary.zodiac, v: v(chart.zodiac, 'zodiac') },
    { k: t.summary.fiveElements, v: v(chart.fiveElementsClass, 'fiveElements') },
    { k: t.summary.soulBody, v: `${v(chart.soul)} / ${v(chart.body)}` },
  ];

  return (
    <div className="card">
      <div className="card-h">
        <span className="ix" aria-hidden="true">☰</span>
        <h3>{t.summary.title}</h3>
      </div>
      <div className="card-b" style={{ paddingTop: 4 }}>
        <div className="kv">
          {rows.map((r) => (
            <div key={r.k}>
              <div className="k">{r.k}</div>
              <div className={r.mono ? 'v mono' : 'v'}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
