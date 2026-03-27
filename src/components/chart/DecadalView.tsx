'use client';

import { useState } from 'react';
import type { DecadalPeriod } from '@/types';

interface DecadalViewProps {
  periods: DecadalPeriod[];
  birthYear: number;
}

function getAgeNow(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

function PeriodCard({ period, birthYear, isExpanded, onToggle }: {
  period: DecadalPeriod;
  birthYear: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [start, end] = period.range;
  const calendarStart = birthYear + start;
  const calendarEnd = birthYear + end;
  const currentAge = getAgeNow(birthYear);
  const isCurrent = currentAge >= start && currentAge <= end;
  const isPast = currentAge > end;
  const isFuture = currentAge < start;

  // Progress within period
  const progress = isCurrent
    ? Math.min(100, Math.max(0, ((currentAge - start) / (end - start)) * 100))
    : isPast ? 100 : 0;

  return (
    <div className={`
      rounded-xl border transition-all
      ${isCurrent
        ? 'border-[#3b5bdb]/60 bg-[#131c30] shadow-lg shadow-[#3b5bdb]/10'
        : isPast
          ? 'border-[#1e2538] bg-[#0d1117]/60 opacity-70'
          : 'border-[#1e2538] bg-[#0d1117]'
      }
    `}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Period label + palace name */}
            <div className="flex items-center gap-2 flex-wrap">
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-[#3b5bdb]/20 text-[#5b8af5] text-[10px] font-bold uppercase tracking-wider border border-[#3b5bdb]/30">
                  Hiện tại
                </span>
              )}
              <h3 className={`text-sm sm:text-base font-bold ${isCurrent ? 'text-[#e8b339]' : 'text-[#8b9dc3]'}`}>
                {period.palaceName}
              </h3>
              <span className="text-xs text-[#4a5568]">
                {period.heavenlyStem} {period.earthlyBranch}
              </span>
            </div>

            {/* Age range + calendar years */}
            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <span className={isCurrent ? 'text-[#5b8af5] font-semibold' : 'text-[#6b7a94]'}>
                {start} – {end} tuổi
              </span>
              <span className="text-[#3d4a5c]">
                ({calendarStart} – {calendarEnd})
              </span>
            </div>

            {/* Progress bar */}
            {(isCurrent || isPast) && (
              <div className="mt-2.5 h-1 rounded-full bg-[#1a2236] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#3b5bdb] to-[#5b8af5]'
                      : 'bg-[#2a3348]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Major stars summary (always shown) */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {period.majorStars.map((star, i) => (
                <span
                  key={i}
                  className={`
                    inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] border
                    ${star.mutagen
                      ? 'bg-[#e8b339]/10 border-[#e8b339]/30 text-[#e8b339]'
                      : 'bg-[#9775cd]/10 border-[#9775cd]/20 text-[#9775cd]'
                    }
                  `}
                >
                  {star.name}
                  {star.brightness && <span className="text-[9px] opacity-60">{star.brightness}</span>}
                  {star.mutagen && <span className="text-[9px] font-bold">{star.mutagen}</span>}
                </span>
              ))}
              {period.majorStars.length === 0 && (
                <span className="text-[11px] text-[#3d4a5c] italic">Cung trống chính tinh</span>
              )}
            </div>
          </div>

          {/* Expand arrow */}
          <div className={`text-[#4a5568] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#1e2538] pt-4 space-y-4">
          {/* Mutagens */}
          {period.mutagen.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#5b8af5] uppercase tracking-wider mb-2">Tứ hóa đại hạn</h4>
              <div className="flex flex-wrap gap-2">
                {period.mutagen.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#e8b339]/10 border border-[#e8b339]/25 text-[#e8b339] text-xs font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Minor stars */}
          {period.minorStars.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#5b8af5] uppercase tracking-wider mb-2">Phụ tinh</h4>
              <div className="flex flex-wrap gap-1.5">
                {period.minorStars.map((star, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#1a2236] border border-[#2a3348] text-[#7c8ba5]">
                    {star.name}
                    {star.brightness && <span className="text-[9px] ml-0.5 opacity-60">{star.brightness}</span>}
                    {star.mutagen && <span className="text-[9px] ml-0.5 font-bold text-[#e8b339]">{star.mutagen}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Adjective stars */}
          {period.adjectiveStars.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#5b8af5] uppercase tracking-wider mb-2">Tạp diệu</h4>
              <div className="flex flex-wrap gap-1.5">
                {period.adjectiveStars.map((star, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[#0d1117] border border-[#1e2538] text-[#4a5568]">
                    {star.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary box */}
          <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#3d4a5c] uppercase tracking-wider">Cung</span>
                <p className="text-[#8b9dc3] font-medium mt-0.5">{period.palaceName}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#3d4a5c] uppercase tracking-wider">Can Chi</span>
                <p className="text-[#8b9dc3] font-medium mt-0.5">{period.heavenlyStem} {period.earthlyBranch}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#3d4a5c] uppercase tracking-wider">Tuổi</span>
                <p className="text-[#8b9dc3] font-medium mt-0.5">{start} – {end}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#3d4a5c] uppercase tracking-wider">Năm</span>
                <p className="text-[#8b9dc3] font-medium mt-0.5">{calendarStart} – {calendarEnd}</p>
              </div>
            </div>
          </div>

          {/* Interpretation hint */}
          {isFuture && (
            <p className="text-[11px] text-[#3d4a5c] italic">
              Giai đoạn này chưa đến. Thông tin mang tính tham khảo cho kế hoạch dài hạn.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DecadalView({ periods, birthYear }: DecadalViewProps) {
  const currentAge = getAgeNow(birthYear);
  const currentIdx = periods.findIndex((p) => currentAge >= p.range[0] && currentAge <= p.range[1]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(currentIdx >= 0 ? currentIdx : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#e8b339] flex items-center gap-2">
            <span>☰</span> Đại Vận (Đại Hạn)
          </h2>
          <p className="text-xs text-[#4a5568] mt-1">
            Phân tích chi tiết 12 giai đoạn lớn trong cuộc đời — mỗi giai đoạn kéo dài 10 năm
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#4a5568]">Tuổi hiện tại</div>
          <div className="text-lg font-bold text-[#5b8af5]">{currentAge}</div>
        </div>
      </div>

      {/* Timeline overview */}
      <div className="p-4 rounded-xl bg-[#0d1117] border border-[#1e2538]">
        <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden">
          {periods.map((period, i) => {
            const isCurrent = currentAge >= period.range[0] && currentAge <= period.range[1];
            const isPast = currentAge > period.range[1];
            return (
              <button
                key={i}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className={`
                  flex-1 relative group transition-all cursor-pointer
                  ${isCurrent
                    ? 'bg-[#3b5bdb]'
                    : isPast
                      ? 'bg-[#1a2236]'
                      : 'bg-[#111822] hover:bg-[#1a2236]'
                  }
                  ${expandedIdx === i ? 'ring-1 ring-[#5b8af5] ring-offset-1 ring-offset-[#0d1117]' : ''}
                `}
                title={`${period.palaceName}: ${period.range[0]}-${period.range[1]} tuổi`}
              >
                <span className={`
                  absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-medium
                  ${isCurrent ? 'text-white' : 'text-[#4a5568] group-hover:text-[#6b7a94]'}
                `}>
                  {period.range[0]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-[#3d4a5c]">
          <span>{periods[0]?.range[0]} tuổi</span>
          <span>{periods[periods.length - 1]?.range[1]} tuổi</span>
        </div>
      </div>

      {/* Period cards */}
      <div className="space-y-2">
        {periods.map((period, i) => (
          <PeriodCard
            key={i}
            period={period}
            birthYear={birthYear}
            isExpanded={expandedIdx === i}
            onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] flex flex-wrap gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#3b5bdb]" />
          <span className="text-[#6b7a94]">Đại hạn hiện tại</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#1a2236]" />
          <span className="text-[#6b7a94]">Đã qua</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#111822]" />
          <span className="text-[#6b7a94]">Chưa đến</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#9775cd] font-semibold">★</span>
          <span className="text-[#6b7a94]">Chính tinh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#e8b339] font-semibold">★</span>
          <span className="text-[#6b7a94]">Hóa tinh</span>
        </div>
      </div>
    </div>
  );
}
