import { describe, expect, it } from 'vitest';
import { decode } from '@toon-format/toon';
import { buildToonDataContext } from '@/lib/prompt/toon-context';
import { getPrompt } from '@/lib/prompt';
import { FIXTURE_INPUT, FIXTURE_RESULT } from '@/lib/fixture';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { term } from '@/lib/i18n/vocabulary';

// ============================================================
// The TOON encoder — P6 Part B.
//
// The point of these tests is NOT that the output is small. It is that the
// output still carries every fact the model needs: a compression that quietly
// drops a star is not a compression, it is a downgrade to the reading.
// ============================================================

const CHART = FIXTURE_RESULT.chart;

function encoded(locale: Locale): string {
  return buildToonDataContext(
    CHART, locale, getPrompt(locale).labels,
    FIXTURE_INPUT.name, FIXTURE_INPUT.selfDescription,
  );
}

describe('TOON data context', () => {
  for (const locale of LOCALES) {
    it(`${locale}: decodes back to structured data`, () => {
      const doc = decode(encoded(locale)) as Record<string, unknown>;
      expect(doc).toBeTypeOf('object');
      expect(Array.isArray(doc.palaces)).toBe(true);
    });

    it(`${locale}: keeps all twelve palaces, as a table`, () => {
      const text = encoded(locale);
      // The tabular header is where TOON's saving comes from; if the array
      // stopped being uniform it would silently fall back to a list of objects.
      expect(text).toMatch(/palaces\[12]\{/);
      const doc = decode(text) as { palaces: Record<string, unknown>[] };
      expect(doc.palaces).toHaveLength(12);
    });

    it(`${locale}: loses no star the chart carries`, () => {
      const text = encoded(locale);
      const missing: string[] = [];
      for (const p of CHART.palaces) {
        for (const s of p.majorStars) {
          if (!text.includes(term(s.name, locale, 'majorStar'))) missing.push(s.name);
        }
        for (const s of p.minorStars) {
          if (!text.includes(term(s.name, locale, 'minorStar'))) missing.push(s.name);
        }
        for (const s of p.adjectiveStars) {
          if (!text.includes(term(s.name, locale, 'adjectiveStar'))) missing.push(s.name);
        }
      }
      expect(missing).toEqual([]);
    });

    it(`${locale}: loses no palace name, brightness or tứ hóa`, () => {
      const text = encoded(locale);
      for (const p of CHART.palaces) {
        expect(text, `palace ${p.name}`).toContain(term(p.name, locale, 'palace'));
        expect(text, `decadal ${p.decadalRange}`).toContain(p.decadalRange);
        for (const s of p.majorStars) {
          if (s.brightness) {
            expect(text, `brightness ${s.brightness}`).toContain(term(s.brightness, locale, 'brightness'));
          }
          if (s.mutagen) {
            expect(text, `mutagen ${s.mutagen}`).toContain(term(s.mutagen, locale, 'mutagen'));
          }
        }
      }
    });

    it(`${locale}: marks the Thân cung exactly once`, () => {
      const doc = decode(encoded(locale)) as { palaces: Record<string, number>[] };
      const key = getPrompt(locale).labels.bodyPalaceMark;
      const marked = doc.palaces.filter((p) => Number(p[key]) === 1);
      expect(marked).toHaveLength(1);
    });

    it(`${locale}: carries the reader's own vocabulary, not Vietnamese`, () => {
      const text = encoded(locale);
      // 'Tử Vi' is on this chart; in another locale it must appear translated.
      expect(text).toContain(term('Tử Vi', locale, 'majorStar'));
    });
  }

  it('keeps the horoscope rows when the chart has them', () => {
    const L = getPrompt('vi').labels;
    const doc = decode(encoded('vi')) as Record<string, unknown>;
    const rows = doc[L.horoscopeHead] as Record<string, string>[];
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.scope)).toEqual([L.decadalRow, L.yearlyRow, L.monthlyRow]);
  });

  it('omits the Bazi and self-description blocks when the chart has neither', () => {
    const L = getPrompt('vi').labels;
    const doc = decode(encoded('vi')) as Record<string, unknown>;
    // The fixture has no Bazi and FIXTURE_INPUT no self-description; emitting
    // empty blocks would spend tokens telling the model nothing.
    expect(doc[L.baziHead]).toBeUndefined();
    expect(doc[L.selfHead]).toBeUndefined();
  });

  it('includes the self-description when one is supplied', () => {
    const L = getPrompt('vi').labels;
    const text = buildToonDataContext(CHART, 'vi', L, 'Ai Đó', 'Tôi hay ôm việc một mình.');
    expect(text).toContain('Tôi hay ôm việc một mình.');
  });

  it('is smaller than the prose form it replaces', () => {
    // Not the reason to ship it — EVAL.md decides that — but if it were ever
    // LARGER, the whole exercise would be pointless and this should say so.
    const toon = encoded('vi');
    expect(toon.length).toBeLessThan(4000);
    expect(toon).toMatch(/palaces\[12]/);
  });
});
