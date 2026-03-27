'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ChartGrid from '@/components/chart/ChartGrid';
import ChartSummary from '@/components/chart/ChartSummary';
import PalaceDetail from '@/components/chart/PalaceDetail';
import Interpretation from '@/components/chart/Interpretation';
import DecadalView from '@/components/chart/DecadalView';
import ChatPanel from '@/components/chat/ChatPanel';
import type { AnalysisResult, BirthInput } from '@/types';

type TabId = 'overview' | 'chart' | 'daivan' | 'interpretation' | 'horoscope';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [input, setInput] = useState<BirthInput | null>(null);
  const [activePalace, setActivePalace] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('tuvi_result');
    const storedInput = sessionStorage.getItem('tuvi_input');

    if (!stored) {
      router.push('/');
      return;
    }

    setResult(JSON.parse(stored));
    if (storedInput) setInput(JSON.parse(storedInput));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060a13]">
        <div className="animate-float text-3xl">✦</div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: '☰' },
    { id: 'chart', label: '12 Cung', icon: '◇' },
    { id: 'daivan', label: 'Đại Vận', icon: '⟳' },
    { id: 'interpretation', label: 'Luận giải', icon: '✦' },
    { id: 'horoscope', label: 'Vận hạn', icon: '☯' },
  ];

  const selectedPalace = activePalace !== null
    ? result.chart.palaces.find((p) => p.index === activePalace)
    : null;

  const birthYear = parseInt(result.chart.solarDate.split('-')[0], 10);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-12 relative">
        {/* Subtle background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3b5bdb]/[0.02] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#9775cd]/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Page header */}
          <div className="mb-8 animate-fade-in-up">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-[#4a5568] hover:text-[#8b9dc3] transition-colors mb-4 inline-flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Lập lá số mới
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0]">
              Lá Số Tử Vi {input?.name && (
                <span className="bg-gradient-to-r from-[#5b8af5] to-[#e8b339] bg-clip-text text-transparent">
                  — {input.name}
                </span>
              )}
            </h1>
            <p className="text-[#6b7a94] mt-1">
              {result.chart.solarDate} | {result.chart.time} ({result.chart.timeRange}) | {result.chart.zodiac} | {result.chart.fiveElementsClass}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-[#1e2538] animate-fade-in-up stagger-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? 'border-[#3b5bdb] text-[#5b8af5] text-glow-accent'
                    : 'border-transparent text-[#4a5568] hover:text-[#8b9dc3] hover:border-[#2a3348]'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content with animation */}
          <div className="animate-fade-in-up stagger-2">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSummary chart={result.chart} name={input?.name} />
                <div className="bg-[#0d1117] border border-[#1e2538] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#e8b339] text-glow-gold mb-4">Điểm nổi bật</h3>
                  <div className="space-y-3">
                    {(() => {
                      const soulPalace = result.chart.palaces.find((p) =>
                        p.name.toLowerCase().includes('mệnh') || p.name === '命宫'
                      );
                      if (!soulPalace) return null;
                      return (
                        <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] hover:border-[#2a3348] transition-colors">
                          <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Mệnh cung</span>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {soulPalace.majorStars.length > 0 ? (
                              soulPalace.majorStars.map((s, i) => (
                                <span key={i} className="text-sm font-medium text-[#9775cd]">
                                  {s.name}
                                  {s.brightness && <span className="text-[#4a5568] text-xs"> ({s.brightness})</span>}
                                  {s.mutagen && <span className="text-[#e8b339] text-xs"> {s.mutagen}</span>}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-[#3d4a5c]">Cung trống sao</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] hover:border-[#2a3348] transition-colors">
                      <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Ngũ hành cục</span>
                      <p className="text-sm font-medium text-[#8b9dc3] mt-1">{result.chart.fiveElementsClass}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1a2236] hover:border-[#2a3348] transition-colors">
                      <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Mệnh chủ / Thân chủ</span>
                      <p className="text-sm font-medium text-[#8b9dc3] mt-1">{result.chart.soul} / {result.chart.body}</p>
                    </div>

                    {result.decadalPeriods && result.decadalPeriods.length > 0 && (() => {
                      const current = result.decadalPeriods.find((p) => p.isCurrentDecadal);
                      if (!current) return null;
                      return (
                        <div className="p-3 rounded-lg bg-[#131c30] border border-[#3b5bdb]/30 glow-accent">
                          <span className="text-[10px] text-[#5b8af5] uppercase tracking-wider">Đại hạn hiện tại</span>
                          <p className="text-sm font-medium text-[#8b9dc3] mt-1">
                            {current.palaceName} ({current.range[0]}–{current.range[1]} tuổi)
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {current.majorStars.map((s, i) => (
                              <span key={i} className="text-xs text-[#9775cd]">{s.name}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="space-y-6">
                <ChartGrid
                  palaces={result.chart.palaces}
                  activePalace={activePalace}
                  onPalaceClick={(idx) =>
                    setActivePalace(activePalace === idx ? null : idx)
                  }
                />
                {selectedPalace && (
                  <div className="animate-scale-in">
                    <PalaceDetail
                      palace={selectedPalace}
                      onClose={() => setActivePalace(null)}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'daivan' && result.decadalPeriods && (
              <DecadalView
                periods={result.decadalPeriods}
                birthYear={birthYear}
              />
            )}

            {activeTab === 'interpretation' && (
              <Interpretation content={result.interpretation} />
            )}

            {activeTab === 'horoscope' && (
              <div className="space-y-6">
                {result.chart.horoscope ? (
                  <>
                    {[
                      { key: 'decadal', title: 'Đại Hạn Hiện Tại', data: result.chart.horoscope.decadal },
                      { key: 'yearly', title: `Lưu Niên (${new Date().getFullYear()})`, data: result.chart.horoscope.yearly },
                      { key: 'monthly', title: 'Lưu Nguyệt', data: result.chart.horoscope.monthly },
                    ].map(({ key, title, data }) => (
                      <div key={key} className="bg-[#0d1117] border border-[#1e2538] rounded-xl p-6 hover:border-[#2a3348] transition-colors">
                        <h3 className="text-lg font-bold text-[#e8b339] mb-4">{title}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Cung</span>
                            <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{data.name}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Can Chi</span>
                            <p className="text-sm font-medium text-[#8b9dc3] mt-0.5">{data.heavenlyStem} {data.earthlyBranch}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">Tứ hóa</span>
                            <p className="text-sm font-medium text-[#e8b339] mt-0.5">
                              {data.mutagen.join(', ') || 'Không có'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-[#0d1117] border border-[#1e2538] rounded-xl p-6 text-center text-[#4a5568]">
                    Không có dữ liệu vận hạn cho lá số này.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Chat FAB */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#3b5bdb] to-[#9775cd] text-white flex items-center justify-center shadow-lg shadow-[#3b5bdb]/30 hover:shadow-[0_0_30px_rgba(59,91,219,0.4)] hover:scale-110 active:scale-95 transition-all animate-fade-in group"
          title="Hỏi chuyên gia Tử Vi"
        >
          <span className="text-xl group-hover:animate-float">✦</span>
          {/* Ping dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8b339] opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#e8b339] border-2 border-[#060a13]" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      <ChatPanel
        chart={result.chart}
        name={input?.name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}
