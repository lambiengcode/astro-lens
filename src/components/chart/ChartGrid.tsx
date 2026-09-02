'use client';

import type { PalaceData } from '@/types';

interface ChartGridProps {
  palaces: PalaceData[];
  activePalace: number | null;
  onPalaceClick: (index: number) => void;
}

// ============================================================
// ZIWEI.PUB STYLE — Traditional 4×4 perimeter grid
// ============================================================
//
//   Col 0    Col 1    Col 2    Col 3
//  ┌────────┬────────┬────────┬────────┐
//  │ 巳(5)  │ 午(6)  │ 未(7)  │ 申(8)  │  Row 0
//  ├────────┼────────┴────────┼────────┤
//  │ 辰(4)  │     CENTER     │ 酉(9)  │  Row 1
//  ├────────┤     INFO       ├────────┤
//  │ 卯(3)  │                │ 戌(10) │  Row 2
//  ├────────┼────────┬────────┼────────┤
//  │ 寅(2)  │ 丑(1)  │ 子(0)  │ 亥(11) │  Row 3
//  └────────┴────────┴────────┴────────┘

const BRANCH_LOOKUP: Record<string, number> = {
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

const BRANCH_LABELS = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Perimeter cells: [row, col, branchIndex]
const TOP_ROW = [5, 6, 7, 8];
const BOTTOM_ROW = [2, 1, 0, 11];
const LEFT_COL = [4, 3];   // row 1, row 2
const RIGHT_COL = [9, 10]; // row 1, row 2

function buildBranchMap(palaces: PalaceData[]): Map<number, PalaceData> {
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

function isSoulPalace(palace: PalaceData): boolean {
  const n = palace.name.toLowerCase();
  return n.includes('mệnh') || n === '命宫' || n === '命宮';
}

const RING_POSITION: Record<number, [number, number]> = {
  5: [12.5, 12.5], 6: [37.5, 12.5], 7: [62.5, 12.5], 8: [87.5, 12.5],
  4: [12.5, 37.5], 3: [12.5, 62.5], 9: [87.5, 37.5], 10: [87.5, 62.5],
  2: [12.5, 87.5], 1: [37.5, 87.5], 0: [62.5, 87.5], 11: [87.5, 87.5],
};

// ============================================================
// STAR RENDERING (ziwei.pub style)
// ============================================================
// Major stars: large, bold, purple (#531dab)
// Mutagen stars: gold badge
// Minor stars: small, blue-tinted
// Adjective stars: small, muted

function StarBadge({ star, size }: { star: { name: string; brightness?: string; mutagen?: string }; size: 'lg' | 'sm' }) {
  const isBig = size === 'lg';
  const hasMutagen = !!star.mutagen;

  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      <span className={`
        ${isBig ? 'text-[12px] sm:text-[13px] font-semibold' : 'text-[10px] sm:text-[11px]'}
        ${hasMutagen ? 'text-[#e8b339]' : isBig ? 'text-[#9775cd]' : 'text-[#7c8ba5]'}
        leading-none whitespace-nowrap
      `}>
        {star.name}
      </span>
      {star.brightness && (
        <span className="text-[8px] sm:text-[9px] text-[#5a6577] leading-none">{star.brightness}</span>
      )}
      {star.mutagen && (
        <span className="text-[9px] sm:text-[10px] font-bold text-[#e8b339] leading-none">{star.mutagen}</span>
      )}
    </span>
  );
}

// ============================================================
// PALACE CELL (ziwei.pub style)
// ============================================================

function PalaceCell({
  palace,
  branchLabel,
  isActive,
  isDimmed,
  onClick,
}: {
  palace: PalaceData | undefined;
  branchLabel: string;
  isActive: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  if (!palace) {
    return (
      <div className="glass-1 min-h-[140px] sm:min-h-[170px] flex items-center justify-center">
        <span className="text-[10px] text-[#2a3348]">{branchLabel}</span>
      </div>
    );
  }

  const isMenh = isSoulPalace(palace);

  return (
    <button
      onClick={onClick}
      className={`
        press-spring relative w-full text-left cursor-pointer
        min-h-[140px] sm:min-h-[170px] flex flex-col
        ${isActive
          ? 'glass-strong glow-accent z-10'
          : isMenh
            ? 'glass-1 glass-gold-edge'
            : 'glass-1'
        }
        ${isDimmed ? 'opacity-30 saturate-50' : ''}
      `}
    >
      {/* Mệnh cung top indicator */}
      {isMenh && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e8b339] to-transparent" />
      )}

      {/* Main content area */}
      <div className="flex-1 p-1.5 sm:p-2 space-y-1">
        {/* Major stars */}
        <div className="space-y-0.5">
          {palace.majorStars.map((star, i) => (
            <div key={i}>
              <StarBadge star={star} size="lg" />
            </div>
          ))}
          {palace.majorStars.length === 0 && (
            <span className="text-[10px] text-[#2a3348] italic">—</span>
          )}
        </div>

        {/* Minor stars */}
        {palace.minorStars.length > 0 && (
          <div className="flex flex-wrap gap-x-1 gap-y-0">
            {palace.minorStars.map((star, i) => (
              <StarBadge key={i} star={star} size="sm" />
            ))}
          </div>
        )}

        {/* Adjective stars */}
        {palace.adjectiveStars.length > 0 && (
          <div className="flex flex-wrap gap-x-1 gap-y-0">
            {palace.adjectiveStars.map((star, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] text-[#3d4a5c] leading-none whitespace-nowrap">
                {star.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: changsheng | palace name + branch | decadal */}
      <div className="border-t border-[#1e2538] grid grid-cols-3 items-end">
        {/* Left: changsheng12 + boshi12 */}
        <div className="p-1 sm:p-1.5 text-left space-y-0">
          <div className="text-[9px] sm:text-[10px] text-[#4a5568] leading-tight">{palace.changsheng12}</div>
          <div className="text-[9px] sm:text-[10px] text-[#4a5568] leading-tight">{palace.boshi12}</div>
        </div>

        {/* Center: palace name + body indicator */}
        <div className="p-1 sm:p-1.5 text-center">
          <div className={`text-[11px] sm:text-[12px] font-bold leading-tight ${isMenh ? 'text-[#e8b339]' : 'text-[#8b9dc3]'}`}>
            {palace.name}
          </div>
          {palace.isBodyPalace && (
            <div className="text-[8px] sm:text-[9px] text-[#3b82f6] leading-tight">[ Thân ]</div>
          )}
          {palace.decadalRange && (
            <div className="text-[8px] sm:text-[9px] text-[#3b5bdb] leading-tight mt-0.5">
              {palace.decadalRange}
            </div>
          )}
        </div>

        {/* Right: heavenly stem + earthly branch */}
        <div className="p-1 sm:p-1.5 text-right">
          <div className="text-[10px] sm:text-[11px] text-[#6b7a94] leading-tight">
            {palace.heavenlyStem}{palace.earthlyBranch}
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// MAIN GRID COMPONENT
// ============================================================

export default function ChartGrid({ palaces, activePalace, onPalaceClick }: ChartGridProps) {
  const branchMap = buildBranchMap(palaces);
  const activeBranch = activePalace === null ? null : [...branchMap.entries()].find(([, palace]) => palace.index === activePalace)?.[0] ?? null;
  const trineBranches = activeBranch === null ? [] : [(activeBranch + 4) % 12, (activeBranch + 8) % 12];
  const oppositeBranch = activeBranch === null ? null : (activeBranch + 6) % 12;
  const relatedBranches = new Set(activeBranch === null ? [] : [activeBranch, ...trineBranches, oppositeBranch]);
  const names = (branches: number[]) => branches.map((branch) => branchMap.get(branch)?.name).filter(Boolean).join(' · ');

  const missing: string[] = [];
  for (let i = 0; i < 12; i++) {
    if (!branchMap.has(i)) missing.push(BRANCH_LABELS[i]);
  }

  const renderCell = (branch: number) => {
    const palace = branchMap.get(branch);
    return (
      <PalaceCell
        key={`b-${branch}`}
        palace={palace}
        branchLabel={BRANCH_LABELS[branch]}
        isActive={palace ? activePalace === palace.index : false}
        isDimmed={activeBranch !== null && !relatedBranches.has(branch)}
        onClick={() => palace && onPalaceClick(palace.index)}
      />
    );
  };

  return (
    <div className="w-full">
      {missing.length > 0 && (
        <div className="mb-3 p-2.5 rounded bg-[#2a1a1a] border border-[#5c2828] text-[#ef4444] text-xs">
          Thiếu cung: {missing.join(', ')}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="relative min-w-[620px] sm:min-w-[740px] border border-[#1e2538] bg-[#0a0e17] rounded-lg overflow-hidden">
          {activeBranch !== null && RING_POSITION[activeBranch] && (
            <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {trineBranches.map((branch) => RING_POSITION[branch] && (
                <line key={`trine-${branch}`} x1={RING_POSITION[activeBranch][0]} y1={RING_POSITION[activeBranch][1]} x2={RING_POSITION[branch][0]} y2={RING_POSITION[branch][1]} stroke="#7c96ff" strokeWidth="0.7" opacity="0.8" />
              ))}
              {oppositeBranch !== null && RING_POSITION[oppositeBranch] && (
                <line x1={RING_POSITION[activeBranch][0]} y1={RING_POSITION[activeBranch][1]} x2={RING_POSITION[oppositeBranch][0]} y2={RING_POSITION[oppositeBranch][1]} stroke="#ef8fe0" strokeWidth="0.7" strokeDasharray="2 1.5" opacity="0.9" />
              )}
            </svg>
          )}
          {/* Row 0: top 4 */}
          <div className="grid grid-cols-4">
            {TOP_ROW.map(renderCell)}
          </div>

          {/* Rows 1-2: left | center | right */}
          <div className="grid grid-cols-4">
            {/* Left column */}
            <div className="col-span-1 flex flex-col">
              {LEFT_COL.map(renderCell)}
            </div>

            {/* Center 2×2 */}
            <div className="glass-1 col-span-2 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] relative">
              {/* Decorative circles */}
              <div className="absolute inset-6 sm:inset-10 rounded-full border border-[#1a2236] opacity-60" />
              <div className="absolute inset-12 sm:inset-16 rounded-full border border-[#1a2236] opacity-30" />

              <div className="relative z-10 text-center px-4">
                <div className="text-3xl sm:text-4xl mb-3 animate-float select-none">✦</div>
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#9775cd] to-[#e8b339] bg-clip-text text-transparent">
                  Tử Vi Đẩu Số
                </h3>
                <p className="text-[10px] sm:text-xs text-[#3d4a5c] mt-1">紫微斗數</p>

                <div className="mt-4 space-y-1 text-[10px] sm:text-xs text-[#3d4a5c]">
                  <p>{palaces.length}/12 cung</p>
                  <p className="text-[#3b5bdb]/60">Nhấn vào cung để xem chi tiết</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-1 flex flex-col">
              {RIGHT_COL.map(renderCell)}
            </div>
          </div>

          {/* Row 3: bottom 4 */}
          <div className="grid grid-cols-4">
            {BOTTOM_ROW.map(renderCell)}
          </div>
        </div>
      </div>
      {activeBranch !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b7a94]">
          <span className="text-[#7c96ff]">Tam hợp: {names(trineBranches) || '—'}</span>
          <span className="text-[#ef8fe0]">Đối cung: {oppositeBranch === null ? '—' : (branchMap.get(oppositeBranch)?.name || '—')}</span>
        </div>
      )}
    </div>
  );
}
