'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { INTL_LOCALE, type Locale } from '@/lib/i18n/locales';
import { renderMarkdown } from '@/lib/markdown';

/** The paper ground. Captured images and PDF pages use the same value. */
export const PAPER = '#fbf8f1';

interface InterpretationProps {
  content: string;
  name?: string;
  solarDate?: string;
  meta?: string;
  /** Generation date shown in the paper bar. Pinned in fixture mode. */
  generatedOn?: string;
  onExportPdf?: () => void;
  pdfExporting?: boolean;
}

/**
 * Words for a Latin script, characters for CJK and Hangul — a Chinese or
 * Korean reading has almost no spaces, so counting runs of them would report a
 * five-thousand-character reading as a handful of words. `字` and `자` are what
 * those readers count in, which is also what the catalogue's `paper.words`
 * says in each locale.
 */
function readingLength(text: string, locale: Locale): string {
  const body = text.trim();
  const n = locale === 'vi' || locale === 'en'
    ? body.split(/\s+/).filter(Boolean).length
    : body.replace(/\s+/g, '').length;
  return n.toLocaleString(INTL_LOCALE[locale]);
}

/**
 * The document itself. Rendered on screen and captured verbatim for the image
 * and PDF exports — DESIGN.md §5, PLAN.md §8.
 */
export function InterpretationContent({
  content, name, solarDate, meta, generatedOn, variant = 'screen',
}: {
  content: string;
  name?: string;
  solarDate?: string;
  meta?: string;
  generatedOn?: string;
  variant?: 'screen' | 'print';
}) {
  const { locale, t } = useI18n();
  const cast = generatedOn ?? new Date().toISOString().split('T')[0];
  return (
    <div className="paper-b">
      <div className="seal" aria-hidden="true">紫微<br />斗數</div>
      <div className="doc-t">{name || t.paper.docTitle}</div>
      <div className="doc-m">{meta || solarDate}</div>
      <div
        className="prose-interpretation"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
      <div className="paper-foot">
        <span>tuvi.app · {t.paper.castOn} {cast}</span>
        <span data-parity-volatile>
          {variant === 'print'
            ? t.paper.printLabel
            : `${readingLength(content, locale)} ${t.paper.words}`}
        </span>
      </div>
    </div>
  );
}

export default function Interpretation({
  content, name, solarDate, meta, generatedOn, onExportPdf, pdfExporting,
}: InterpretationProps) {
  const { locale, t } = useI18n();
  const paperRef = useRef<HTMLDivElement>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const [stamped, setStamped] = useState(false);
  const isExporting = exportingImage || !!pdfExporting;

  // The seal drops and settles once the reading arrives — PLAN §7.6.
  // Under reduced motion the media block pins it to its settled state.
  useEffect(() => {
    const drop = setTimeout(() => setStamped(true), 320);
    return () => clearTimeout(drop);
  }, []);

  const handleExportImage = useCallback(async () => {
    if (!paperRef.current || isExporting) return;
    setExportingImage(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(paperRef.current, {
        backgroundColor: PAPER,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      const datePart = solarDate || new Date().toISOString().split('T')[0];
      link.download = `tuvi${name ? `_${name}` : ''}_${datePart}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export image failed:', e);
    } finally {
      setExportingImage(false);
    }
  }, [isExporting, name, solarDate]);

  const model = 'Gemini';
  const today = generatedOn ?? new Date().toISOString().split('T')[0];

  return (
    <div className={stamped ? 'paper stamped' : 'paper'} ref={paperRef}>
      <div className="paper-bar">
        <span className="ttl">{t.paper.barTitle}</span>
        <span className="sub">
          {model} · {today} · {readingLength(content, locale)} {t.paper.words}
        </span>
        <span className="acts">
          <button type="button" className="pbtn" onClick={handleExportImage} disabled={isExporting}>
            {exportingImage ? t.paper.exporting : t.paper.downloadImage}
          </button>
          <button type="button" className="pbtn pri" onClick={onExportPdf} disabled={isExporting}>
            {pdfExporting ? t.paper.exporting : t.paper.downloadPdf}
          </button>
        </span>
      </div>
      <InterpretationContent
        content={content} name={name} solarDate={solarDate} meta={meta} generatedOn={today}
      />
    </div>
  );
}
