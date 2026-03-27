'use client';

import type { ChartData } from '@/types';

interface ChartSummaryProps {
  chart: ChartData;
  name?: string;
}

export default function ChartSummary({ chart, name }: ChartSummaryProps) {
  const items = [
    { label: 'Ngày dương', value: chart.solarDate },
    { label: 'Ngày âm', value: chart.lunarDate },
    { label: 'Can Chi', value: chart.chineseDate },
    { label: 'Giờ sinh', value: `${chart.time} (${chart.timeRange})` },
    { label: 'Cung giáp', value: chart.sign },
    { label: 'Con giáp', value: chart.zodiac },
    { label: 'Ngũ hành cục', value: chart.fiveElementsClass },
    { label: 'Mệnh chủ', value: chart.soul },
    { label: 'Thân chủ', value: chart.body },
    { label: 'Giới tính', value: chart.gender },
  ];

  return (
    <div className="bg-[#0d1117] border border-[#1e2538] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#131c30] border border-[#3b5bdb]/30 flex items-center justify-center">
          <span className="text-[#5b8af5] text-lg">☰</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {name || 'Lá Số Tử Vi'}
          </h2>
          <p className="text-sm text-[#4a5568]">Thông tin tổng quan</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">{item.label}</span>
            <span className="text-sm font-medium text-[#8b9dc3]">{item.value}</span>
          </div>
        ))}
      </div>

      {chart.horoscope && (
        <div className="mt-5 pt-5 border-t border-[#1e2538]">
          <h3 className="text-sm font-semibold text-[#5b8af5] mb-3">Vận hạn hiện tại</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Đại hạn</span>
              <span className="text-sm font-medium text-[#8b9dc3]">
                {chart.horoscope.decadal.name} ({chart.horoscope.decadal.heavenlyStem} {chart.horoscope.decadal.earthlyBranch})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Lưu niên</span>
              <span className="text-sm font-medium text-[#8b9dc3]">
                {chart.horoscope.yearly.name} ({chart.horoscope.yearly.heavenlyStem} {chart.horoscope.yearly.earthlyBranch})
              </span>
            </div>
            {chart.horoscope.decadal.mutagen.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Tứ hóa đại hạn</span>
                <span className="text-sm font-medium text-[#e8b339]">
                  {chart.horoscope.decadal.mutagen.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
