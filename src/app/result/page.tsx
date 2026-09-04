'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ChartGrid from '@/components/chart/ChartGrid';
import ChartSummary from '@/components/chart/ChartSummary';
import PalaceDetail from '@/components/chart/PalaceDetail';
import Interpretation, { InterpretationContent, PAPER } from '@/components/chart/Interpretation';
import DecadalView from '@/components/chart/DecadalView';
import ChatPanel from '@/components/chat/ChatPanel';
import { isSoulPalace } from '@/lib/branches';
import { natalMutagens, palaceAt, starsOrBorrowed } from '@/lib/chart-derived';
import { loadFixture, FIXTURE_REFERENCE_YEAR, FIXTURE_REFERENCE_DATE, FIXTURE_ID } from '@/lib/fixture';
import type { AnalysisResult, BirthInput, ChartData, HoroscopeItem, StarData } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import type { Domain } from '@/lib/i18n/vocabulary';

type V = (value: string | undefined | null, domain?: Domain) => string;

type TabId = 'overview' | 'chart' | 'daivan' | 'interpretation' | 'horoscope';

// ─── EXPORT ──────────────────────────────────────────────────────────────────
// The captured document is the paper surface. A dark PDF is an unreadable
// printed document — PLAN.md §8.

async function captureElement(el: HTMLElement) {
  const { default: html2canvas } = await import('html2canvas-pro');
  return html2canvas(el, {
    backgroundColor: PAPER,
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

function addCanvasToPdf(
  pdf: InstanceType<typeof import('jspdf').default>,
  canvas: HTMLCanvasElement,
  margin: number,
  contentWidth: number,
  isFirstSection: boolean,
) {
  const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  const scaledHeight = (canvas.height * contentWidth) / canvas.width;

  if (!isFirstSection) pdf.addPage();

  // No page fill: the paper capture already carries the ground, and letting the
  // white page show prints identically.
  if (scaledHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, scaledHeight);
    return;
  }

  const totalPages = Math.ceil(scaledHeight / pageHeight);
  const sliceHeightPx = (pageHeight / scaledHeight) * canvas.height;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    const thisSliceH = Math.min(sliceHeightPx, canvas.height - i * sliceHeightPx);
    sliceCanvas.height = thisSliceH;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, i * sliceHeightPx, canvas.width, thisSliceH, 0, 0, canvas.width, thisSliceH);

    const sliceScaledH = (thisSliceH * contentWidth) / canvas.width;
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceScaledH);
  }
}

// ─── HOROSCOPE CARD ──────────────────────────────────────────────────────────

function mutagenChips(mutagen: string[], none: string, v: V) {
  if (!mutagen.length) return <span style={{ color: 'var(--tx4)' }}>{none}</span>;
  return mutagen.map((m, i) => {
    // Each entry is "<tứ hóa> <star>", both vocabulary — DESIGN.md §15.2.
    const [tag, ...rest] = m.split(' ');
    const isKy = tag === 'Kỵ' || m.startsWith('Kỵ');
    return (
      <span key={i}>
        {i > 0 && ' · '}
        <span className={isKy ? 'mut ky' : 'mut'}>{v(tag, 'mutagen')}</span>
        {rest.length > 0 && ` ${v(rest.join(' '))}`}
      </span>
    );
  });
}

function HoroscopeCard({ glyph, title, meta, item, chart, stars: mode = 'natal' }: {
  glyph: string; title: string; meta?: string; item: HoroscopeItem; chart: ChartData;
  /**
   * `borrow` — a ten-year window over a vô chính diệu palace reads the stars of
   *   its đối cung, which is how đại vận is read.
   * `natal`  — a one-year window names the palace as it stands.
   * `none`   — lưu nguyệt carries no star reading of its own.
   */
  stars?: 'borrow' | 'natal' | 'none';
}) {
  const natal = mode === 'none' ? null : palaceAt(chart, item.earthlyBranch);
  const borrowed = mode === 'borrow' && natal && !natal.majorStars.length
    ? starsOrBorrowed(chart, item.earthlyBranch)
    : null;
  const stars = borrowed?.stars ?? natal?.majorStars ?? [];
  const borrowedFrom = borrowed?.borrowedFrom ?? null;
  const showEmpty = mode !== 'none' && !stars.length;
  const { t, v } = useI18n();
  return (
    <div className="card">
      <div className="card-h">
        <span className="ix" aria-hidden="true">{glyph}</span>
        <h3>{title}</h3>
        {meta && <span className="sp">{meta}</span>}
      </div>
      <div className="card-b">
        <div className="kv">
          <div>
            <div className="k">{t.result.kvPalace}</div>
            <div className="v">
              {v(item.name, 'palace')}
              {borrowedFrom && ` · ${v('vô chính diệu', 'relation')}`}
            </div>
          </div>
          <div>
            <div className="k">{t.result.kvCanChi}</div>
            <div className="v mono">
              {v(item.heavenlyStem, 'stem')} {v(item.earthlyBranch, 'branch')}
            </div>
          </div>
          {/* rows the item has nothing to say in are left out entirely */}
          {(stars.length > 0 || showEmpty) && (
            <div>
              <div className="k">{borrowedFrom ? t.result.kvBorrowedStars : t.result.kvMajorStars}</div>
              <div className="v">
                {stars.length
                  ? stars.map((s, i) => (
                      <span key={i}>
                        {i > 0 && ' · '}
                        <span className="star-a">{v(s.name, 'majorStar')}</span>
                        {s.mutagen && <> <span className={s.mutagen === 'Kỵ' ? 'mut ky' : 'mut'}>{v(s.mutagen, 'mutagen')}</span></>}
                      </span>
                    ))
                  : <span style={{ color: 'var(--tx4)', fontStyle: 'italic' }}>{v('Vô chính diệu', 'relation')}</span>}
              </div>
            </div>
          )}
          {item.mutagen.length > 0 && (
            <div>
              <div className="k">{t.result.kvMutagen}</div>
              <div className="v">{mutagenChips(item.mutagen, t.result.none, v)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

function ResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [input, setInput] = useState<BirthInput | null>(null);
  const [activePalace, setActivePalace] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const { t, v } = useI18n();

  const isFixture = searchParams.get('fixture') === FIXTURE_ID;

  const pdfSummaryRef = useRef<HTMLDivElement>(null);
  const pdfChartRef = useRef<HTMLDivElement>(null);
  const pdfInterpretationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fixture = loadFixture(searchParams.get('fixture'));
    if (fixture) {
      setResult(fixture.result);
      setInput(fixture.input);
      return;
    }

    const stored = sessionStorage.getItem('tuvi_result');
    const storedInput = sessionStorage.getItem('tuvi_input');
    if (!stored) {
      router.push('/');
      return;
    }
    setResult(JSON.parse(stored));
    if (storedInput) setInput(JSON.parse(storedInput));
  }, [router, searchParams]);

  // the tab is part of the address so parity captures can target one directly
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'chart', 'daivan', 'interpretation', 'horoscope'].includes(tab)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  const handleExportPdf = useCallback(async () => {
    if (pdfExporting || !result) return;
    setPdfExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdfWidth = 595.28;
      const margin = 30;
      const contentWidth = pdfWidth - margin * 2;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      const captures = await Promise.all([
        pdfSummaryRef.current ? captureElement(pdfSummaryRef.current) : null,
        pdfChartRef.current ? captureElement(pdfChartRef.current) : null,
        pdfInterpretationRef.current ? captureElement(pdfInterpretationRef.current) : null,
      ]);

      let isFirst = true;
      for (const canvas of captures) {
        if (!canvas) continue;
        addCanvasToPdf(pdf, canvas, margin, contentWidth, isFirst);
        isFirst = false;
      }

      const datePart = result.chart.solarDate || new Date().toISOString().split('T')[0];
      pdf.save(`tuvi${input?.name ? `_${input.name}` : ''}_${datePart}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setPdfExporting(false);
    }
  }, [pdfExporting, result, input?.name]);

  if (!result) {
    return (
      <main className="flex-1 grid place-items-center">
        <p className="mono" style={{ color: 'var(--tx3)', fontSize: 12 }}>{t.result.loading}</p>
      </main>
    );
  }

  const { chart, decadalPeriods } = result;
  const tabs: { id: TabId; label: string; glyph: string }[] = [
    { id: 'overview', label: t.result.tabs.overview, glyph: '☰' },
    { id: 'chart', label: t.result.tabs.chart, glyph: '◇' },
    { id: 'daivan', label: t.result.tabs.daivan, glyph: '⟳' },
    { id: 'interpretation', label: t.result.tabs.interpretation, glyph: '✦' },
    { id: 'horoscope', label: t.result.tabs.horoscope, glyph: '☯' },
  ];

  const selectedPalace = activePalace !== null
    ? chart.palaces.find((p) => p.index === activePalace) ?? null
    : null;

  const birthYear = parseInt(chart.solarDate.split('-')[0], 10);
  const referenceYear = isFixture ? FIXTURE_REFERENCE_YEAR : undefined;
  const nowYear = referenceYear ?? new Date().getFullYear();
  const nowMonth = isFixture ? 9 : new Date().getMonth() + 1;

  const soulPalace = chart.palaces.find(isSoulPalace);
  const currentDecadal = decadalPeriods?.find((p) => p.isCurrentDecadal);
  const mutagens = natalMutagens(chart);
  const yearStem = chart.chineseDate.split(/[\s·]+/)[0] || '';
  const decadalStars = currentDecadal
    ? starsOrBorrowed(chart, currentDecadal.earthlyBranch)
    : { stars: [], borrowedFrom: null };

  const docMeta = [
    chart.solarDate,
    v(chart.time, 'branch'),
    v(chart.gender, 'gender'),
    v(chart.fiveElementsClass, 'fiveElements'),
    `${t.result.menhAt} ${v(chart.earthlyBranchOfSoulPalace, 'branch')}`,
  ].join(' · ');

  const starList = (stars: StarData[]) =>
    stars.map((s, i) => (
      <span key={i}>
        {i > 0 && <>&nbsp;</>}
        <span className="star-a">{v(s.name, 'majorStar')}</span>
        {s.brightness && <> <span className="bl">{v(s.brightness, 'brightness')}</span></>}
        {s.mutagen && <> <span className={s.mutagen === 'Kỵ' ? 'mut ky' : 'mut'}>{v(s.mutagen, 'mutagen')}</span></>}
      </span>
    ));

  return (
    <>
      <div className="app">
      <Header
        actions={
          <button type="button" className="btn" onClick={() => router.push('/')}>{t.result.newChart}</button>
        }
        primary={
          <button type="button" className="btn gh" onClick={handleExportPdf} disabled={pdfExporting}>
            {pdfExporting ? t.result.exporting : t.result.exportPdf}
          </button>
        }
      />

      <main className="flex-1">
        <div className="res-head">
          <button type="button" className="back" onClick={() => router.push('/')}>{t.result.backNewChart}</button>
          <h1>{t.result.title} {input?.name && <em>— {input.name}</em>}</h1>
          <div className="metaline">
            <span>{chart.solarDate}</span><s>|</s>
            <span>{v(chart.time, 'branch')} ({chart.timeRange})</span><s>|</s>
            <span>{v(chart.zodiac, 'zodiac')}</span><s>|</s>
            <span>{v(chart.fiveElementsClass, 'fiveElements')}</span><s>|</s>
            <span>{v(chart.gender, 'gender')}</span>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? 'on' : ''}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="g" aria-hidden="true">{t.glyph}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="res-body">
          {activeTab === 'overview' && (
            <div className="res-cols">
              <ChartSummary chart={chart} name={input?.name} />
              <div className="card">
                <div className="card-h">
                  <span className="ix" aria-hidden="true">◈</span>
                  <h3>{t.result.highlights}</h3>
                </div>
                <div className="card-b">
                  {soulPalace && (
                    <div className="hl">
                      <div className="k">{t.result.menhPalace} · {v(soulPalace.earthlyBranch, 'branch')}</div>
                      <div className="v">
                        {soulPalace.majorStars.length
                          ? starList(soulPalace.majorStars)
                          : <span className="empty">{v('vô chính diệu', 'relation')}</span>}
                      </div>
                    </div>
                  )}
                  {mutagens.length > 0 && (
                    <div className="hl">
                      <div className="k">{t.result.mutagenOfYear} {v(yearStem, 'stem')}</div>
                      <div className="v">
                        {mutagens.map((m, i) => (
                          <span key={i}>
                            {i > 0 && ' · '}
                            <span className={m.mutagen === 'Kỵ' ? 'mut ky' : 'mut'}>{v(m.mutagen, 'mutagen')}</span>
                            {' '}{v(m.star)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentDecadal && (
                    <div className="hl cy">
                      <div className="k">
                        {t.result.currentDecadal} · {currentDecadal.range[0]}–{currentDecadal.range[1]} {t.result.age}
                      </div>
                      <div className="v">
                        {v(currentDecadal.palaceName, 'palace')} ({v(currentDecadal.earthlyBranch, 'branch')}) —{' '}
                        {decadalStars.stars.length && decadalStars.borrowedFrom
                          ? <span className="borrow">
                              {v('vô chính diệu', 'relation')}, {v('mượn', 'relation')}{' '}
                              {v(decadalStars.borrowedFrom, 'branch')}
                            </span>
                          : starList(currentDecadal.majorStars)}
                      </div>
                    </div>
                  )}
                  {chart.horoscope && (
                    <div className="hl cy" style={{ marginBottom: 0 }}>
                      <div className="k">
                        {t.result.yearly} {nowYear} · {v(chart.horoscope.yearly.heavenlyStem, 'stem')} {v(chart.horoscope.yearly.earthlyBranch, 'branch')}
                      </div>
                      <div className="v">
                        {v(chart.horoscope.yearly.name, 'palace')} ({v(chart.horoscope.yearly.earthlyBranch, 'branch')})
                        {currentDecadal && (
                          <> · <span className="bl">
                            {t.result.yearOfDecadalPre} {nowYear - birthYear + 1 - currentDecadal.range[0] + 1} {t.result.yearOfDecadalPost}
                          </span></>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <>
              <ChartGrid
                palaces={chart.palaces}
                activePalace={activePalace}
                onPalaceClick={(idx) => setActivePalace(activePalace === idx ? null : idx)}
                chart={chart}
                name={input?.name}
              />
              {selectedPalace && (
                <PalaceDetail
                  palace={selectedPalace}
                  palaces={chart.palaces}
                  onClose={() => setActivePalace(null)}
                />
              )}
            </>
          )}

          {activeTab === 'daivan' && decadalPeriods && (
            <DecadalView periods={decadalPeriods} birthYear={birthYear} chart={chart} referenceYear={referenceYear} />
          )}

          {activeTab === 'interpretation' && (
            <Interpretation
              content={result.interpretation}
              name={input?.name}
              solarDate={chart.solarDate}
              meta={docMeta}
              generatedOn={isFixture ? FIXTURE_REFERENCE_DATE : undefined}
              onExportPdf={handleExportPdf}
              pdfExporting={pdfExporting}
            />
          )}

          {activeTab === 'horoscope' && (
            <div className="res-cols" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,440px)', gap: 22, alignItems: 'start' }}>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {chart.horoscope ? (
                  <>
                    <HoroscopeCard
                      glyph="⟳" title={t.result.decadalNow}
                      meta={currentDecadal ? `${currentDecadal.range[0]}–${currentDecadal.range[1]}` : undefined}
                      item={chart.horoscope.decadal}
                      chart={chart}
                      stars="borrow"
                    />
                    <HoroscopeCard
                      glyph="☯" title={`${t.result.yearly} ${nowYear}`}
                      item={chart.horoscope.yearly}
                      chart={chart}
                    />
                    <HoroscopeCard
                      glyph="☾" title={t.result.monthly} meta={`${t.result.month} ${nowMonth}`}
                      item={chart.horoscope.monthly}
                      chart={chart}
                      stars="none"
                    />
                  </>
                ) : (
                  <div className="card">
                    <div className="card-b" style={{ color: 'var(--tx3)', fontSize: 13 }}>
                      {t.result.noHoroscope}
                    </div>
                  </div>
                )}
              </div>
              <ChatPanel chart={chart} name={input?.name} variant="inline" />
            </div>
          )}
        </div>
      </main>
      </div>
      <Footer />

      {/* ── Off-screen paper sections for image and PDF capture ── */}
      <div
        aria-hidden
        className="fixed pointer-events-none"
        style={{ left: '-9999px', top: 0, width: '900px' }}
      >
        <div ref={pdfSummaryRef} className="paper print" style={{ background: PAPER, padding: '34px 38px 30px' }}>
          <div className="print-head">
            <div>
              <div className="t">{t.result.title}{input?.name ? ` — ${input.name}` : ''}</div>
              <div className="m">{docMeta}</div>
            </div>
            <div className="sl">紫微<br />斗數</div>
          </div>
          <div className="print-lab">{t.result.printPage1}</div>
          <ChartSummary chart={chart} name={input?.name} />
          <div className="print-foot"><span>tuvi.app</span><span>1</span></div>
        </div>

        <div ref={pdfChartRef} className="paper print" style={{ background: PAPER, padding: '34px 38px 30px' }}>
          <div className="print-head">
            <div>
              <div className="t">{t.result.title}{input?.name ? ` — ${input.name}` : ''}</div>
              <div className="m">{docMeta}</div>
            </div>
            <div className="sl">紫微<br />斗數</div>
          </div>
          <div className="print-lab">{t.result.printPage2}</div>
          <ChartGrid
            palaces={chart.palaces}
            activePalace={null}
            onPalaceClick={() => {}}
            chart={chart}
            name={input?.name}
            variant="print"
          />
          <div className="print-foot"><span>tuvi.app</span><span>2</span></div>
        </div>

        <div ref={pdfInterpretationRef} className="paper print" style={{ background: PAPER }}>
          <InterpretationContent
            content={result.interpretation}
            name={input?.name}
            solarDate={chart.solarDate}
            meta={docMeta}
            generatedOn={isFixture ? FIXTURE_REFERENCE_DATE : undefined}
            variant="print"
          />
        </div>
      </div>

      {activeTab !== 'horoscope' && !chatOpen && (
        <button
          type="button"
          className="fab"
          onClick={() => setChatOpen(true)}
          title={t.result.askFab}
          aria-label={t.result.askFabAria}
        >
          ✦
        </button>
      )}

      {activeTab !== 'horoscope' && chatOpen && (
        <ChatPanel chart={chart} name={input?.name} variant="floating" onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <ResultView />
    </Suspense>
  );
}
