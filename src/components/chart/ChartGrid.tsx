'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartData, PalaceData, StarData } from '@/types';
import {
  BRANCH_LABELS, buildBranchMap, isSoulPalace, xung, tamHop, enDash,
} from '@/lib/branches';
import { drawRelationships, clearOverlay } from '@/lib/rel-overlay';
import { prefersReducedMotion } from '@/lib/motion';
import { useI18n } from '@/lib/i18n/context';
import type { Domain } from '@/lib/i18n/vocabulary';

type V = (value: string | undefined | null, domain?: Domain) => string;

export interface ChartGridProps {
  palaces: PalaceData[];
  activePalace: number | null;
  onPalaceClick: (index: number) => void;
  /** Subject details for the centre panel. Optional — omitted in previews. */
  chart?: ChartData;
  name?: string;
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

export default function ChartGrid({
  palaces, activePalace, onPalaceClick, chart, name, variant = 'screen',
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

  const activeName = activePalace !== null
    ? v(palaces.find((p) => p.index === activePalace)?.name, 'palace') || undefined
    : undefined;

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
          <span className="ring r1" />
          <span className="ring r2" />
          <div className="cn">{t.chart.centre}</div>
          <div className="han">紫微斗數</div>
          {chart && (
            <div className="who">
              {name && <div className="nm">{name}</div>}
              <div className="dl">
                {chart.solarDate} · {t.chart.hour} {v(chart.time, 'branch')}<br />
                {v(chart.gender, 'gender')} · {v(chart.fiveElementsClass, 'fiveElements')}<br />
                {t.chart.menh} {v(chart.earthlyBranchOfSoulPalace, 'branch')} · {t.chart.than}{' '}
                {v(chart.earthlyBranchOfBodyPalace, 'branch')}
              </div>
            </div>
          )}
          {!isPrint && (
            <div className="hint">
              {activeName ? `${t.chart.hintActivePre} ${activeName}` : t.chart.hint}
            </div>
          )}
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
