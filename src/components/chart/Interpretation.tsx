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

export function InterpretationContent({ content, name, solarDate }: { content: string; name?: string; solarDate?: string }) {
  const html = renderMarkdown(content);
  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gold flex items-center gap-2">
          <span>✦</span> Luận Giải Chi Tiết
        </h2>
        {(name || solarDate) && (
          <span className="text-xs text-[#4a5568]">
            {name && <span>{name}</span>}
            {name && solarDate && <span> | </span>}
            {solarDate && <span>{solarDate}</span>}
          </span>
        )}
      </div>
      <div
        className="prose-interpretation text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#131c30] border border-[#1e2538] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#3b5bdb]/50 hover:bg-[#1a2540] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#131c30] border border-[#1e2538] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#3b5bdb]/50 hover:bg-[#1a2540] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
