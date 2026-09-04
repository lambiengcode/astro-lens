// ============================================================
// D1 — the citation line
// ============================================================
//
// The reading carries its citations inline: `renderMarkdown` turns a `>` line
// into the `.sealq` block P0-P4 built. A chat answer cannot, because the chat
// bubble has no blockquote renderer and its own surface for this — the `.cite`
// row under the message — was built and left unpopulated. So the answer's
// citation is peeled off here and handed over separately.

/**
 * Peel the trailing citation line off a chat answer — D1.
 *
 * The answer ends with one `> cung · sao` line. It is separated here rather
 * than left in the prose because the surface for it already exists: ChatPanel
 * renders `cite` as its own `.cite` row under the message, and the message
 * body has no blockquote renderer, so a `>` left inline would show as a
 * literal angle bracket.
 *
 * Only a TRAILING citation is taken, and only the last one. A `>` in the
 * middle of an answer is the model quoting something, not citing.
 */
export function splitCitation(text: string): { reply: string; cite?: string } {
  const lines = text.trimEnd().split('\n');
  let end = lines.length;
  const cites: string[] = [];
  while (end > 0) {
    const line = lines[end - 1].trim();
    if (!line) { end -= 1; continue; }
    const m = /^>[ \t]*(.+)$/.exec(line);
    if (!m) break;
    cites.unshift(m[1].trim());
    end -= 1;
  }
  if (!cites.length) return { reply: text.trim() };
  return { reply: lines.slice(0, end).join('\n').trim(), cite: cites.join(' · ') };
}

