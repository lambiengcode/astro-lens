'use client';

import type { PalaceData } from '@/types';

interface PalaceDetailProps {
  palace: PalaceData;
  onClose: () => void;
}

export default function PalaceDetail({ palace, onClose }: PalaceDetailProps) {
  return (
    <div className="bg-[#0d1117] border border-[#3b5bdb]/30 rounded-xl p-6 sm:p-8 shadow-xl shadow-[#3b5bdb]/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-[#e8b339]">{palace.name}</h3>
            {palace.isBodyPalace && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#3b5bdb]/15 text-[#5b8af5] border border-[#3b5bdb]/30">
                Thân cung
              </span>
            )}
            {palace.isOriginalPalace && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e8b339]/15 text-[#e8b339] border border-[#e8b339]/30">
                Lai nhân cung
              </span>
            )}
          </div>
          <p className="text-sm text-[#6b7a94]">{palace.heavenlyStem} {palace.earthlyBranch}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4a5568] hover:text-[#8b9dc3] hover:bg-[#1a2236] transition-all"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Major Stars */}
        <div>
          <h4 className="text-[11px] font-semibold text-[#5b8af5] uppercase tracking-wider mb-3">Chính tinh</h4>
          {palace.majorStars.length > 0 ? (
            <div className="space-y-2">
              {palace.majorStars.map((star, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236]">
                  <div className="w-8 h-8 rounded-lg bg-[#9775cd]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#9775cd] text-sm">★</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#9775cd]">{star.name}</span>
                    {star.brightness && (
                      <span className="ml-2 text-sm text-[#4a5568]">({star.brightness})</span>
                    )}
                    {star.mutagen && (
                      <span className="ml-2 text-sm font-bold px-1.5 py-0.5 rounded bg-[#e8b339]/15 text-[#e8b339]">
                        {star.mutagen}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] text-sm text-[#3d4a5c] italic">
              Không có chính tinh (cung trống sao)
            </div>
          )}
        </div>

        {/* Minor + Adjective Stars */}
        <div>
          <h4 className="text-[11px] font-semibold text-[#5b8af5] uppercase tracking-wider mb-3">Phụ tinh & Tạp diệu</h4>
          <div className="space-y-3">
            {palace.minorStars.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {palace.minorStars.map((star, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a2236] text-[#7c8ba5] text-sm border border-[#2a3348]">
                    {star.name}
                    {star.brightness && <span className="text-[10px] text-[#4a5568]">({star.brightness})</span>}
                    {star.mutagen && <span className="text-[10px] font-bold text-[#e8b339]">{star.mutagen}</span>}
                  </span>
                ))}
              </div>
            )}
            {palace.adjectiveStars.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {palace.adjectiveStars.map((star, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#0a0e17] text-[#4a5568] text-sm border border-[#1e2538]">
                    {star.name}
                  </span>
                ))}
              </div>
            )}
            {palace.minorStars.length === 0 && palace.adjectiveStars.length === 0 && (
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] text-sm text-[#3d4a5c] italic">
                Không có phụ tinh
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#1e2538]">
        <div className="p-2.5 rounded-lg bg-[#0a0e17]">
          <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Trường sinh</span>
          <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.changsheng12 || '—'}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[#0a0e17]">
          <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Bác sĩ</span>
          <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.boshi12 || '—'}</p>
        </div>
        {palace.decadalRange && (
          <div className="p-2.5 rounded-lg bg-[#0a0e17]">
            <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Đại hạn</span>
            <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.decadalRange} tuổi</p>
          </div>
        )}
        {palace.ages.length > 0 && (
          <div className="p-2.5 rounded-lg bg-[#0a0e17]">
            <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Tiểu hạn</span>
            <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">
              {palace.ages.slice(0, 4).join(', ')}{palace.ages.length > 4 ? '...' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
