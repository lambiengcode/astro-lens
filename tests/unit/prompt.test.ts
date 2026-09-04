import { describe, expect, it } from 'vitest';
import { _test as cacheInternals } from '@/lib/gemini-cache';
import { getPrompt } from '@/lib/prompt';
import { LOCALES, DEFAULT_LOCALE, normalizeLocale, localeFromAcceptLanguage } from '@/lib/i18n/locales';

// ============================================================
// TEST 9 — the Gemini cache key varies by locale. PLAN.md §13b.7
// ============================================================
//
// The failure this guards against is named in PLAN.md §13b.4: the cache
// bundles the system instruction, so one shared cache would serve a Korean
// reader a Vietnamese preamble.

describe('gemini context cache', () => {
  it('gives every locale its own cache name', () => {
    const names = LOCALES.map(cacheInternals.displayNameFor);
    expect(new Set(names).size).toBe(LOCALES.length);
  });

  it('leaves the default locale on the name the deployed cache already has', () => {
    // Renaming it would orphan the live cache and pay a rebuild on the one
    // locale whose ~3-minute analysis must not get slower.
    expect(cacheInternals.displayNameFor(DEFAULT_LOCALE)).toBe('horoscopes-knowledge-base');
  });

  it('names the others after their locale', () => {
    expect(cacheInternals.displayNameFor('ko')).toBe('horoscopes-knowledge-base-ko');
    expect(cacheInternals.displayNameFor('zh-Hant')).toBe('horoscopes-knowledge-base-zh-Hant');
  });
});

describe('prompt packs', () => {
  const VIETNAMESE = /[ăâđêôơư]/i;

  for (const locale of LOCALES) {
    const pack = getPrompt(locale);

    it(`${locale}: carries a system instruction, a task and a chat instruction`, () => {
      expect(pack.system.length).toBeGreaterThan(1000);
      expect(pack.task.length).toBeGreaterThan(3000);
      expect(pack.chat.length).toBeGreaterThan(300);
      expect(pack.cacheSeed.length).toBeGreaterThan(30);
    });

    it(`${locale}: asks for all eleven output sections in order`, () => {
      // The reading is the product, and its shape must not vary by locale.
      const headings = [...pack.task.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
      expect(headings).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it(`${locale}: keeps the seventeen-point self-check`, () => {
      expect(pack.task.match(/^□ \d+\./gm)?.length).toBe(17);
    });

    it(`${locale}: keeps the [A]–[K] reasoning pass`, () => {
      const steps = [...pack.task.matchAll(/^\[([A-K])\]/gm)].map((m) => m[1]);
      expect(steps).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
    });

    it(`${locale}: fills every data label`, () => {
      for (const [key, value] of Object.entries(pack.labels)) {
        if (key === 'elements') continue;
        expect(typeof value, key).toBe('string');
        expect((value as string).trim(), key).not.toBe('');
      }
      expect(Object.keys(pack.labels.elements).sort())
        .toEqual(['EARTH', 'FIRE', 'METAL', 'WATER', 'WOOD']);
    });

    if (locale !== 'vi') {
      it(`${locale}: has no Vietnamese left in its instructions or labels`, () => {
        // English keeps the transliterated originals beside the translation on
        // first use (DESIGN.md §15.1), which is deliberate, so only the
        // labels are swept there.
        const labels = Object.values(pack.labels)
          .filter((x): x is string => typeof x === 'string')
          .join(' ');
        expect(VIETNAMESE.test(labels), 'labels').toBe(false);
        if (locale !== 'en') {
          expect(VIETNAMESE.test(pack.system), 'system').toBe(false);
          expect(VIETNAMESE.test(pack.chat), 'chat').toBe(false);
          expect(VIETNAMESE.test(pack.cacheSeed), 'cacheSeed').toBe(false);
        }
      });
    }
  }
});

describe('locale resolution', () => {
  it('accepts the exact tags and the region forms browsers send', () => {
    expect(normalizeLocale('vi')).toBe('vi');
    expect(normalizeLocale('vi-VN')).toBe('vi');
    expect(normalizeLocale('zh-Hans')).toBe('zh-Hans');
    expect(normalizeLocale('zh-CN')).toBe('zh-Hans');
    expect(normalizeLocale('zh-Hant')).toBe('zh-Hant');
    expect(normalizeLocale('zh-TW')).toBe('zh-Hant');
    expect(normalizeLocale('zh-HK')).toBe('zh-Hant');
    expect(normalizeLocale('ko-KR')).toBe('ko');
    expect(normalizeLocale('en-IN')).toBe('en');
  });

  it('falls back to Vietnamese, so an existing link keeps working', () => {
    expect(normalizeLocale(null)).toBe('vi');
    expect(normalizeLocale('')).toBe('vi');
    expect(normalizeLocale('de-DE')).toBe('vi');
  });

  it('honours Accept-Language quality values rather than tag order', () => {
    expect(localeFromAcceptLanguage('de;q=0.9, zh-TW;q=0.8, en;q=0.7')).toBe('zh-Hant');
    expect(localeFromAcceptLanguage('en;q=0.5, ko;q=0.9')).toBe('ko');
    expect(localeFromAcceptLanguage('fr-FR')).toBe(null);
    expect(localeFromAcceptLanguage(null)).toBe(null);
  });
});
