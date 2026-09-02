'use client';

import type { PalaceData } from '@/types';

interface PalaceDetailProps {
  palace: PalaceData;
  onClose: () => void;
}

export default function PalaceDetail({ palace, onClose }: PalaceDetailProps) {
  return (
    <div className="glass-strong rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-[#e8b339]">{palace.name}</h3>
            {palace.isBodyPalace && (
              <span className="chip-glass text-[11px] px-2 py-0.5 text-[#5b8af5]">
                Thân cung
              </span>
            )}
            {palace.isOriginalPalace && (
              <span className="chip-glass text-[11px] px-2 py-0.5 text-[#e8b339]">
                Lai nhân cung
              </span>
            )}
          </div>
          <p className="text-sm text-[#6b7a94]">{palace.heavenlyStem} {palace.earthlyBranch}</p>
        </div>
        <button
          onClick={onClose}
          className="chip-glass press-spring w-8 h-8 rounded-full flex items-center justify-center text-[#4a5568] hover:text-[#8b9dc3] transition-colors"
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
                <div key={i} className="glass-1 flex items-center gap-3 p-3 rounded-lg">
                  <div className="chip-glass w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#9775cd] text-sm">★</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#9775cd]">{star.name}</span>
                    {star.brightness && (
                      <span className="ml-2 text-sm text-[#4a5568]">({star.brightness})</span>
                    )}
                    {star.mutagen && (
                      <span className="chip-glass ml-2 text-sm font-bold px-1.5 py-0.5 text-[#e8b339]">
                        {star.mutagen}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-1 p-3 rounded-lg text-sm text-[#3d4a5c] italic">
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
                  <span key={i} className="chip-glass inline-flex items-center gap-1 px-2.5 py-1 text-[#7c8ba5] text-sm">
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
                  <span key={i} className="chip-glass px-2.5 py-1 text-[#4a5568] text-sm">
                    {star.name}
                  </span>
                ))}
              </div>
            )}
            {palace.minorStars.length === 0 && palace.adjectiveStars.length === 0 && (
              <div className="glass-1 p-3 rounded-lg text-sm text-[#3d4a5c] italic">
                Không có phụ tinh
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#1e2538]">
        <div className="glass-1 p-2.5 rounded-lg">
          <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Trường sinh</span>
          <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.changsheng12 || '—'}</p>
        </div>
        <div className="glass-1 p-2.5 rounded-lg">
          <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Bác sĩ</span>
          <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.boshi12 || '—'}</p>
        </div>
        {palace.decadalRange && (
          <div className="glass-1 p-2.5 rounded-lg">
            <span className="text-[9px] text-[#3d4a5c] uppercase tracking-wider">Đại hạn</span>
            <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{palace.decadalRange} tuổi</p>
          </div>
        )}
        {palace.ages.length > 0 && (
          <div className="glass-1 p-2.5 rounded-lg">
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
