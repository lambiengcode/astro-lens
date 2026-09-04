import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@/lib/markdown';
import { splitCitation } from '@/lib/citation';

describe('renderMarkdown — document (the reading)', () => {
  it('renders headings, lists, rules and the .sealq citation block', () => {
    const html = renderMarkdown(
      '## Cung Mệnh\n### Tổng quan\n- Tử Vi\n- Thiên Phủ\n---\n> Cung Mệnh · Tử Vi (miếu)',
    );
    expect(html).toContain('<h2>Cung Mệnh</h2>');
    expect(html).toContain('<h3>Tổng quan</h3>');
    expect(html).toContain('<ul><li>Tử Vi</li><li>Thiên Phủ</li></ul>');
    expect(html).toContain('<hr/>');
    expect(html).toContain('<blockquote class="sealq">Cung Mệnh · Tử Vi (miếu)</blockquote>');
  });

  it('keeps the last item of a list that ends the text', () => {
    expect(renderMarkdown('- một\n- hai')).toBe('<ul><li>một</li><li>hai</li></ul>');
  });
});

describe('renderMarkdown — bubble (the chat answer)', () => {
  const bubble = (s: string) => renderMarkdown(s, 'bubble');

  it('lays out headings and list markers instead of showing them literally', () => {
    const html = bubble('### Tổng quan\nMệnh vững.\n* Tử Vi\n* Thiên Phủ');
    expect(html).not.toContain('###');
    expect(html).not.toMatch(/(^|>)\s*\*/);
    expect(html).toContain('<p class="mh"><strong>Tổng quan</strong></p>');
    expect(html).toContain('<ul><li>Tử Vi</li><li>Thiên Phủ</li></ul>');
  });

  it('never renders a heading as a document heading', () => {
    expect(bubble('# Lớn\n#### Nhỏ')).not.toMatch(/<h[1-6]>/);
  });

  it('does not turn a > line into a blockquote', () => {
    const html = bubble('Người xưa nói:\n> lấy tĩnh chế động');
    expect(html).not.toContain('blockquote');
    expect(html).toContain('lấy tĩnh chế động');
  });

  it('renders bold and italic, and escapes HTML', () => {
    expect(bubble('**Tử Vi** và *Thiên Phủ*'))
      .toBe('<p><strong>Tử Vi</strong> và <em>Thiên Phủ</em></p>');
    expect(bubble('<script>alert(1)</script>')).toContain('&lt;script&gt;');
  });

  it('renders what splitCitation leaves behind, citation already peeled off', () => {
    const { reply, cite } = splitCitation(
      '### Sự nghiệp\n- Hợp nghề tự do\n> Cung Quan Lộc · Thiên Cơ (vượng)',
    );
    expect(cite).toBe('Cung Quan Lộc · Thiên Cơ (vượng)');
    const html = bubble(reply);
    expect(html).toBe('<p class="mh"><strong>Sự nghiệp</strong></p><ul><li>Hợp nghề tự do</li></ul>');
    expect(html).not.toContain('Thiên Cơ');
  });
});
