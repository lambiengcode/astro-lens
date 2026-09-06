'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartData, DecadalPeriod, PalaceData, StarData } from '@/types';
import {
  BRANCH_LABELS, buildBranchMap, isSoulPalace, xung, tamHop, enDash,
  decadeIndexAt, decadalMarker,
} from '@/lib/branches';
import { drawRelationships, clearOverlay } from '@/lib/rel-overlay';
import { prefersReducedMotion } from '@/lib/motion';
import { useI18n } from '@/lib/i18n/context';
import type { Domain } from '@/lib/i18n/vocabulary';

type V = (value: string | undefined | null, domain?: Domain) => string;

export interface ChartGridProps {
  palaces: PalaceData[];
  onPalaceClick: (index: number) => void;
  /** Subject details for the centre panel. Optional — omitted in previews. */
  chart?: ChartData;
  name?: string;
  /**
   * The chart's own đại vận, one segment per decade on the centre dial. Absent
   * or shorter than two decades, the dial is not drawn — see `CentreDial`.
   */
  periods?: DecadalPeriod[];
  /** Birth year, to turn the reference year into a tuổi mụ. */
  birthYear?: number;
  /** Pinned in fixture mode so the marker does not move — PLAN §10.1. */
  referenceYear?: number;
  /** `print` renders the ink-on-paper variant: same anatomy, no motion. */
  variant?: 'screen' | 'print';
}

// ============================================================
// 4×4 perimeter grid — layout unchanged
// ============================================================
//
//   Col 0    Col 1    Col 2    Col 3
//  ┌────────┬────────┬────────┬────────┐
//  │ Tỵ(5)  │ Ngọ(6) │ Mùi(7) │ Thân(8)│  Row 0
//  ├────────┼────────┴────────┼────────┤
//  │ Thìn(4)│     CENTRE      │ Dậu(9) │  Row 1
//  ├────────┤                 ├────────┤
//  │ Mão(3) │                 │Tuất(10)│  Row 2
//  ├────────┼────────┬────────┼────────┤
//  │ Dần(2) │ Sửu(1) │ Tý(0)  │ Hợi(11)│  Row 3
//  └────────┴────────┴────────┴────────┘

/** The five grades the legend names, in descending order — DESIGN.md §8.9. */
const BRIGHTNESS_SCALE = ['miếu', 'vượng', 'đắc', 'bình', 'hãm'];

const TOP_ROW = [5, 6, 7, 8];
const BOTTOM_ROW = [2, 1, 0, 11];
const LEFT_COL = [4, 3];
const RIGHT_COL = [9, 10];

function isRunningDecadal(palace: PalaceData, currentDecadalIndex: number | null): boolean {
  return currentDecadalIndex !== null && palace.index === currentDecadalIndex;
}

function MajorStar({ star, v }: { star: StarData; v: V }) {
  return (
    <div className="maj">
      <span className="nm">{v(star.name, 'majorStar')}</span>
      {star.brightness && <span className="br">{v(star.brightness, 'brightness')}</span>}
      {star.mutagen && (
        <span className={`mut${star.mutagen === 'Kỵ' ? ' ky' : ''}`}>
          {v(star.mutagen, 'mutagen')}
        </span>
      )}
    </div>
  );
}

function PalaceCell({
  palace, branch, branchLabel, isMenh, isDv, relClass, relTag, borrowFrom,
  interactive, onActivate, onDeactivate, onClick, t, v,
}: {
  palace: PalaceData | undefined;
  t: ReturnType<typeof useI18n>['t'];
  v: V;
  branch: number;
  branchLabel: string;
  isMenh: boolean;
  isDv: boolean;
  relClass: string;
  relTag: string;
  /** Branch label a vô chính diệu palace borrows its stars from. */
  borrowFrom: string | null;
  interactive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onClick: () => void;
}) {
  if (!palace) {
    return (
      <div className="pal void" data-b={branch}>
        <div className="pal-b">
          <div className="empty">{t.chart.noData}</div>
        </div>
        <div className="pal-f">
          <div className="lf" />
          <div className="ct"><div className="pn">—</div></div>
          <div className="rt">{branchLabel}</div>
        </div>
      </div>
    );
  }

  const cls = ['pal', isMenh ? 'menh' : '', isDv ? 'dv' : '', relClass].filter(Boolean).join(' ');
  const body = (
    <>
      <span className="rel-tag">{relTag}</span>
      <div className="pal-b">
        <div className="majors">
          {palace.majorStars.length > 0
            ? palace.majorStars.map((s, i) => <MajorStar key={i} star={s} v={v} />)
            : (
              <>
                <div className="empty">{v('vô chính diệu', 'relation')}</div>
                {borrowFrom && (
                  <div style={{ marginTop: 4 }}>
                    <span className="borrow">{v('mượn', 'relation')} {borrowFrom}</span>
                  </div>
                )}
              </>
            )}
        </div>
        {palace.minorStars.length > 0 && (
          <div className="minors">
            {palace.minorStars.map((s, i) => <span key={i}>{v(s.name, 'minorStar')}</span>)}
          </div>
        )}
        {palace.adjectiveStars.length > 0 && (
          <div className="adjs">
            {palace.adjectiveStars.map((s, i) => <span key={i}>{v(s.name, 'adjectiveStar')}</span>)}
          </div>
        )}
      </div>
      <div className="pal-f">
        <div className="lf">
          {v(palace.changsheng12, 'changsheng')}<br />{v(palace.boshi12, 'boshi')}
        </div>
        <div className="ct">
          <div className="pn">{v(palace.name, 'palace')}</div>
          {palace.isBodyPalace && <div className="than">{t.chart.thanMark}</div>}
          {palace.decadalRange && <div className="dr">{enDash(palace.decadalRange)}</div>}
        </div>
        <div className="rt">
          {v(palace.heavenlyStem, 'stem')}<br />{v(palace.earthlyBranch, 'branch')}
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return <div className={cls} data-b={branch}>{body}</div>;
  }

  return (
    <button
      type="button"
      className={cls}
      data-b={branch}
      onClick={onClick}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      aria-label={`${t.chart.cellAriaPre} ${v(palace.name, 'palace')}, ${t.chart.cellAriaBranch} ${v(palace.earthlyBranch, 'branch')}`}
    >
      {body}
    </button>
  );
}

// ============================================================
// CENTRE — the đại vận life dial
// ============================================================
//
// One arc segment per decade of THIS chart's đại vận: lived decades dim, the
// running one lit, a marker at the current year's position inside it. Every
// number comes from `decadalPeriods`; nothing about ten decades, or where a
// decade starts, is assumed.
//
// The geometry lives in one 380×344 viewBox — the centre cell's own size in
// the reference mockup — and scales with the cell, so the arcs stay circular
// at any width.

const DIAL_CX = 190;
const DIAL_CY = 172;
const DIAL_R = 148;        /* the arc ring                       */
const DIAL_LABEL_R = 166;  /* age labels, just outside it        */
const DIAL_GAP = 2.6;      /* degrees of air between two decades */

/** Point on the dial, degrees clockwise from noon. */
function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [DIAL_CX + r * Math.cos(a), DIAL_CY + r * Math.sin(a)];
}

function arcPath(r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

function CentreDial({ periods, current, marker }: {
  periods: DecadalPeriod[];
  /** Index of the running decade, or −1 when the age falls outside them all. */
  current: number;
  /** Position of the year marker inside the running decade, 0–1. */
  marker: number;
}) {
  const seg = 360 / periods.length;
  return (
    <svg className="dial" viewBox="0 0 380 344" aria-hidden="true">
      {periods.map((p, i) => {
        const a0 = i * seg + DIAL_GAP / 2;
        const a1 = (i + 1) * seg - DIAL_GAP / 2;
        const [lx, ly] = polar(DIAL_LABEL_R, i * seg + seg / 2);
        const state = i === current ? 'now' : current >= 0 && i < current ? 'past' : 'fut';
        return (
          <g key={p.range[0]} className={state}>
            <path d={arcPath(DIAL_R, a0, a1)} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">{p.range[0]}</text>
          </g>
        );
      })}
      {current >= 0 && (() => {
        const a0 = current * seg + DIAL_GAP / 2;
        const a1 = (current + 1) * seg - DIAL_GAP / 2;
        const [mx, my] = polar(DIAL_R, a0 + (a1 - a0) * marker);
        return <circle className="mk" cx={mx} cy={my} r={4.5} />;
      })()}
      <circle className="rg" cx={DIAL_CX} cy={DIAL_CY} r={118} />
      <circle className="rg2" cx={DIAL_CX} cy={DIAL_CY} r={96} />
    </svg>
  );
}

export default function ChartGrid({
  palaces, onPalaceClick, chart, name,
  periods, birthYear, referenceYear, variant = 'screen',
}: ChartGridProps) {
  const { t, v } = useI18n();
  const isPrint = variant === 'print';
  const chartRef = useRef<HTMLDivElement>(null);
  const ovRef = useRef<SVGSVGElement>(null);
  const [relBranch, setRelBranch] = useState<number | null>(null);
  const [lit, setLit] = useState(isPrint);
  const [scan, setScan] = useState(false);

  const branchMap = buildBranchMap(palaces);
  const missing: string[] = [];
  for (let i = 0; i < 12; i++) if (!branchMap.has(i)) missing.push(v(BRANCH_LABELS[i], 'branch'));

  const currentDecadalIndex = chart?.horoscope?.decadal.index ?? null;

  // The dial needs at least two decades to be a dial. A chart with a missing
  // or one-entry đại vận keeps the plain identity panel rather than drawing a
  // ring that claims a whole life is one segment.
  const dial = periods && periods.length >= 2 && birthYear ? periods : null;
  const age = (referenceYear ?? new Date().getFullYear()) - (birthYear ?? 0) + 1; // tuổi mụ
  const runningDecade = dial ? decadeIndexAt(dial, age) : -1;
  const running = dial && runningDecade >= 0 ? dial[runningDecade] : null;
  const marker = running ? decadalMarker(age, running.range[0], running.range[1]) : 0;

  // arrival: scan line crosses, then the cells resolve behind it — PLAN §7.4
  // Under reduced motion these classes are inert: the media block forces the
  // cells, the rules and the scan to their final state regardless.
  useEffect(() => {
    if (isPrint) return;
    const kick = requestAnimationFrame(() => setScan(true));
    const settle = setTimeout(() => setLit(true), 260);
    return () => { cancelAnimationFrame(kick); clearTimeout(settle); };
  }, [isPrint]);

  // relationship linework, recomputed on every activation
  useEffect(() => {
    const ov = ovRef.current;
    const el = chartRef.current;
    if (!ov || !el || isPrint) return;
    if (relBranch === null) { clearOverlay(ov); return; }
    drawRelationships(el, ov, relBranch, prefersReducedMotion());
  }, [relBranch, isPrint]);

  // the grid box moves inside its scroller — never cache the base rect
  useEffect(() => {
    if (isPrint) return;
    const drop = () => setRelBranch(null);
    window.addEventListener('resize', drop);
    return () => window.removeEventListener('resize', drop);
  }, [isPrint]);

  const relatives = relBranch === null
    ? null
    : { xung: xung(relBranch), hop: tamHop(relBranch) };

  const renderCell = (branch: number) => {
    const palace = branchMap.get(branch);
    let relClass = '';
    let relTag = '';
    if (relatives) {
      if (branch === relBranch) relClass = 'self';
      else if (branch === relatives.xung) { relClass = 'xung'; relTag = t.chart.tagXung; }
      else if (relatives.hop.includes(branch)) { relClass = 'hop'; relTag = t.chart.tagHop; }
    }
    return (
      <PalaceCell
        key={`b-${branch}`}
        palace={palace}
        branch={branch}
        t={t}
        v={v}
        branchLabel={v(BRANCH_LABELS[branch], 'branch')}
        isMenh={!!palace && isSoulPalace(palace)}
        isDv={!!palace && isRunningDecadal(palace, currentDecadalIndex)}
        relClass={relClass}
        relTag={relTag}
        borrowFrom={
          // Vô chính diệu mượn sao đối cung: the borrowed stars come from the
          // xung chiếu palace — the tradition's own rule, DESIGN.md §12.
          palace && palace.majorStars.length === 0
            ? v(BRANCH_LABELS[xung(branch)], 'branch')
            : null
        }
        interactive={!isPrint && !!palace}
        onActivate={() => setRelBranch(branch)}
        onDeactivate={() => setRelBranch(null)}
        onClick={() => palace && onPalaceClick(palace.index)}
      />
    );
  };

  const chartCls = [
    'chart',
    isPrint ? 'print lit' : '',
    !isPrint && lit ? 'lit' : '',
    !isPrint && scan ? 'scan' : '',
    relBranch !== null ? 'rel' : '',
  ].filter(Boolean).join(' ');

  const grid = (
    <div
      className={chartCls}
      ref={chartRef}
      onMouseLeave={isPrint ? undefined : () => setRelBranch(null)}
    >
      <div className="crow">{TOP_ROW.map(renderCell)}</div>
      <div className="cmid">
        <div className="col">{LEFT_COL.map(renderCell)}</div>
        <div className="centre">
          {dial
            ? <CentreDial periods={dial} current={runningDecade} marker={marker} />
            : <><span className="ring r1" /><span className="ring r2" /></>}
          <div className="core">
            {name && <div className="nm">{name}</div>}
            {chart && (
              <div className="sub">
                {chart.solarDate} · {t.chart.hour} {v(chart.time, 'branch')}<br />
                {v(chart.gender, 'gender')} · {v(chart.fiveElementsClass, 'fiveElements')}
              </div>
            )}
            {running && (
              <div className="now">
                {t.chart.dialDecadal} {enDash(`${running.range[0]}-${running.range[1]}`)} ·{' '}
                {t.decadal.yearPre} {age - running.range[0] + 1}{t.decadal.ofTen}
              </div>
            )}
            <div className="han">紫微斗數</div>
          </div>
        </div>
        <div className="col">{RIGHT_COL.map(renderCell)}</div>
      </div>
      <div className="crow">{BOTTOM_ROW.map(renderCell)}</div>
      {!isPrint && <svg className="rel-ov" ref={ovRef} aria-hidden="true" />}
    </div>
  );

  return (
    <div className="w-full">
      {missing.length > 0 && (
        <div className="err">{t.chart.missing} {missing.join(', ')}</div>
      )}

      {isPrint ? grid : <div className="chart-scroll">{grid}</div>}

      {!isPrint && (
        <div className="legend">
          <span><i className="sw" style={{ background: 'var(--amber)' }} />{t.chart.legendMajor}</span>
          <span><i className="sw" style={{ background: 'var(--cyan)' }} />{t.chart.legendMinor}</span>
          <span><i className="sw" style={{ background: 'var(--tx4)' }} />{t.chart.legendAdjective}</span>
          <span><i className="sw" style={{ background: 'var(--sig)' }} />{t.chart.legendKy}</span>
          <span className="mono" style={{ color: 'var(--tx4)' }}>
            {BRIGHTNESS_SCALE.map((b) => v(b, 'brightness')).join(' · ')}
          </span>
        </div>
      )}
    </div>
  );
}
