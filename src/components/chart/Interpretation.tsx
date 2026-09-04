'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { INTL_LOCALE, type Locale } from '@/lib/i18n/locales';

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

const INLINE: [RegExp, string][] = [
  [/\*\*(.+?)\*\*/g, '<strong>$1</strong>'],
  [/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>'],
];

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  return INLINE.reduce((acc, [re, to]) => acc.replace(re, to), escapeHtml(text));
}

/**
 * Block-level markdown, line by line. The previous regex chain dropped the last
 * item of any list that was not followed by a blank-line-plus-<br>, which silently
 * lost a line of the reading.
 */
function renderMarkdown(text: string): string {
  const out: string[] = [];
  let list: string[] | null = null;
  let para: string[] | null = null;

  const flushList = () => {
    if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
  };
  const flushPara = () => {
    if (para) { out.push(`<p>${para.join('<br/>')}</p>`); para = null; }
  };
  const flush = () => { flushList(); flushPara(); };

  for (const raw of text.split('\n')) {
    const line = raw.trim();

    if (!line) { flush(); continue; }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const tag = heading[1].length >= 3 ? 'h3' : 'h2';
      out.push(`<${tag}>${inline(heading[2])}</${tag}>`);
      continue;
    }

    if (line === '---') { flush(); out.push('<hr/>'); continue; }

    const quote = /^>\s*(.*)$/.exec(line);
    if (quote) {
      flush();
      out.push(`<blockquote class="sealq">${inline(quote[1])}</blockquote>`);
      continue;
    }

    const item = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (item) {
      flushPara();
      (list ??= []).push(`<li>${inline(item[1])}</li>`);
      continue;
    }

    flushList();
    (para ??= []).push(inline(line));
  }

  flush();
  return out.join('');
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
