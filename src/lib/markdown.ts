// ============================================================
// Block markdown, for both surfaces that render model output
// ============================================================
//
// The reading is a document; the chat bubble is not. They share one parser
// because two spellings of "what markdown do we support" is how the two
// surfaces quietly stop agreeing about `###`. They differ only in `variant`:
//
//   document — the paper surface. Real headings, and a `>` line becomes the
//              `.sealq` citation block D1 built.
//   bubble   — the chat message. A heading is a bold lead-in line, not an
//              `<h2>` inside a 13px bubble, and a `>` line is NOT a blockquote:
//              the answer's own citation was already peeled into the `.cite`
//              row by `splitCitation`, so a `>` still here is the model quoting
//              something and reads as prose.

export type MarkdownVariant = 'document' | 'bubble';

const INLINE: [RegExp, string][] = [
  [/\*\*(.+?)\*\*/g, '<strong>$1</strong>'],
  [/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>'],
];

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  return INLINE.reduce((acc, [re, to]) => acc.replace(re, to), escapeHtml(text));
}

/**
 * Block-level markdown, line by line. The regex chain this replaced dropped the
 * last item of any list that was not followed by a blank-line-plus-<br>, which
 * silently lost a line of the reading.
 */
export function renderMarkdown(text: string, variant: MarkdownVariant = 'document'): string {
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

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      if (variant === 'bubble') {
        out.push(`<p class="mh"><strong>${inline(heading[2])}</strong></p>`);
      } else {
        out.push(`<${heading[1].length >= 3 ? 'h3' : 'h2'}>${inline(heading[2])}</${heading[1].length >= 3 ? 'h3' : 'h2'}>`);
      }
      continue;
    }

    if (line === '---') { flush(); out.push('<hr/>'); continue; }

    const quote = /^>\s*(.*)$/.exec(line);
    if (quote) {
      if (variant === 'bubble') {
        // Not a blockquote here — see the note at the top of this file.
        flushList();
        (para ??= []).push(inline(quote[1]));
        continue;
      }
      flush();
      out.push(`<blockquote class="sealq">${inline(quote[1])}</blockquote>`);
      continue;
    }

    const item = /^(?:[-*+]|\d+\.)\s+(.*)$/.exec(line);
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
