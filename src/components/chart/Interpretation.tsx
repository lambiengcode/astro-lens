'use client';

import { useRef, useState, useCallback } from 'react';

interface InterpretationProps {
  content: string;
  name?: string;
  solarDate?: string;
  onExportPdf?: () => void;
  pdfExporting?: boolean;
}

type ExportType = 'image' | null;

function renderMarkdown(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr class="border-border my-4"/>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul>$1</ul>');
  html = html.replace(/<\/li><br\/><li>/g, '</li><li>');
  html = html.replace(/<\/li><br\/><\/ul>/g, '</li></ul>');

  return `<p>${html}</p>`;
}

const CATEGORIES = ['Tính cách', 'Sự nghiệp', 'Tình duyên', 'Tài chính', 'Vận hạn'];

function getSections(content: string) {
  const matches = [...content.matchAll(/^#{1,3}\s*(.+)$/gm)];
  const sections = CATEGORIES.map((category, i) => {
    const match = matches.find((item) => item[1].toLowerCase().includes(category.toLowerCase()));
    const start = match?.index ?? -1;
    const next = start >= 0 ? matches.find((item) => (item.index ?? 0) > start)?.index : undefined;
    const body = start >= 0 ? content.slice(start, next) : '';
    return { category, body: body || (i === 0 ? content.slice(0, Math.min(content.length, 900)) : 'Nội dung đang được tổng hợp từ toàn bộ lá số của bạn.') };
  });
  const plain = content.replace(/[#*_>-]/g, '').replace(/\s+/g, ' ').trim();
  return { sections, quote: plain.slice(0, 190) + (plain.length > 190 ? '…' : '') };
}

export function InterpretationContent({ content, name, solarDate }: { content: string; name?: string; solarDate?: string }) {
  const { sections, quote } = getSections(content);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const active = sections.find((section) => section.category === activeCategory) || sections[0];
  const citations = active.body.match(/\*\*([^*]+)\*\*/g)?.slice(0, 3).map((item) => item.replace(/\*/g, '')) || ['Lá số tổng thể', 'Ngũ hành', 'Cung Mệnh'];
  const influence = Math.min(92, Math.max(58, 62 + citations.length * 8));
  return (
    <div className="space-y-4">
      <div className="glass-strong glass-gold-edge rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full bg-[#ef8fe0]/10 blur-3xl pointer-events-none" />
        <p className="text-[10px] uppercase tracking-[.2em] text-[#ef8fe0] mb-4">Chân dung năng lượng · {name || 'Lá số của bạn'}</p>
        <blockquote className="display-font text-2xl sm:text-3xl leading-tight text-[#f3f6fd] max-w-3xl">“{quote}”</blockquote>
        <div className="flex flex-wrap gap-2 mt-5">
          {citations.map((citation) => <span key={citation} className="chip-glass px-3 py-1.5 text-xs text-[#f7c4ef]">✦ {citation}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['Điểm mạnh', 'Khả năng thích nghi và nhìn thấu vấn đề', '#5fe0a8'],
          ['Điều cần lưu ý', 'Giữ nhịp nghỉ ngơi khi vận khí biến động', '#f3c97f'],
          ['Thời điểm thuận lợi', 'Tập trung vào chu kỳ đang mở ra', '#7c96ff'],
        ].map(([label, value, color]) => <div key={label} className="glass-1 rounded-2xl p-4"><span className="text-[10px] uppercase tracking-wider" style={{ color }}>{label}</span><p className="text-xs text-[#a4afd0] mt-2 leading-relaxed">{value}</p></div>)}
      </div>

      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gold flex items-center gap-2"><span>✦</span> Luận Giải Chi Tiết</h2>
          <span className="text-xs text-[#4a5568]">{solarDate}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {CATEGORIES.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`chip-glass press-spring shrink-0 px-3 py-2 text-xs ${activeCategory === category ? 'text-[#f7c4ef] border-[#ef8fe0]/40 bg-[#ef8fe0]/10' : 'text-[#6b7a94]'}`}>{category}</button>)}
        </div>
        <div className="flex items-center justify-between text-xs mb-2"><span className="text-[#a4afd0]">Mức ảnh hưởng</span><span className="text-[#ef8fe0] font-semibold">{influence}%</span></div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6"><div className="h-full rounded-full bg-gradient-to-r from-[#7c96ff] via-[#bd93ff] to-[#ef8fe0]" style={{ width: `${influence}%` }} /></div>
        <div className="prose-interpretation text-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(active.body) }} />
      </div>
    </div>
  );
}

export default function Interpretation({ content, name, solarDate, onExportPdf, pdfExporting }: InterpretationProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exportingType, setExportingType] = useState<ExportType>(null);

  const isExporting = exportingType !== null || pdfExporting;

  const handleExportImage = useCallback(async () => {
    if (!contentRef.current || isExporting) return;
    setExportingType('image');
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#060a13',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      const datePart = solarDate || new Date().toISOString().split('T')[0];
      const namePart = name ? `_${name}` : '';
      link.download = `tuvi${namePart}_${datePart}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export image failed:', e);
    } finally {
      setExportingType(null);
    }
  }, [isExporting, name, solarDate]);

  return (
    <div>
      {/* Export buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="glass press-spring pill inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#8b9dc3] hover:text-[#e2e8f0] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportingType === 'image' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xuất...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Xuất ảnh
            </>
          )}
        </button>
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="glass-gold-edge glass press-spring pill inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#e8b339] hover:text-[#f5cc5c] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfExporting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xuất...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Xuất PDF
            </>
          )}
        </button>
      </div>

      {/* Capturable content area */}
      <div ref={contentRef}>
        <InterpretationContent content={content} name={name} solarDate={solarDate} />
      </div>
    </div>
  );
}
