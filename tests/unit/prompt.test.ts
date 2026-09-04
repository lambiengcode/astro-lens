import { describe, expect, it } from 'vitest';
import { _test as cacheInternals } from '@/lib/gemini-cache';
import { getPrompt, renderTask } from '@/lib/prompt';
import { buildAnalysisPrompt } from '@/lib/gemini';
import { FIXTURE_INPUT, FIXTURE_RESULT } from '@/lib/fixture';
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

// ============================================================
// P7 step 2 — sections 10 and 11 are REMOVED, not merely discouraged.
//
// EVAL.md §3.2: on a chart with no Bazi data, four of five locales wrote
// section 10 anyway and invented the Four Pillars, despite the prompt saying
// to skip it. An instruction the model can talk itself past is not a
// constraint, so the conditional is structural now.
// ============================================================

describe('conditional sections are structural', () => {
  const NEITHER = { bazi: false, selfDescription: false };
  const BOTH = { bazi: true, selfDescription: true };

  for (const locale of LOCALES) {
    const task = getPrompt(locale).task;

    it(`${locale}: with no Bazi and no self-description, 10 and 11 do not exist`, () => {
      const out = renderTask(task, NEITHER);
      expect(out).not.toMatch(/^##\s*10\./m);
      expect(out).not.toMatch(/^##\s*11\./m);
      expect(out).not.toMatch(/^\[J\]/m);
      expect(out).not.toMatch(/^\[K\]/m);
      expect(out).not.toMatch(/^□ 16\./m);
      expect(out).not.toMatch(/^□ 17\./m);
      // and the nine that are always required survive intact
      expect([...out.matchAll(/^##\s*(\d+)\./gm)].map((m) => Number(m[1])))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it(`${locale}: with both, all eleven sections and [A]–[K] are present`, () => {
      const out = renderTask(task, BOTH);
      expect([...out.matchAll(/^##\s*(\d+)\./gm)].map((m) => Number(m[1])))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      expect([...out.matchAll(/^\[([A-K])\]/gm)].map((m) => m[1]))
        .toEqual(['A','B','C','D','E','F','G','H','I','J','K']);
      expect(out.match(/^□ \d+\./gm)).toHaveLength(17);
    });

    it(`${locale}: Bazi only — section 10 kept, 11 dropped`, () => {
      const out = renderTask(task, { bazi: true, selfDescription: false });
      expect(out).toMatch(/^##\s*10\./m);
      expect(out).not.toMatch(/^##\s*11\./m);
      expect(out).toMatch(/^\[J\]/m);
      expect(out).not.toMatch(/^\[K\]/m);
    });

    it(`${locale}: self-description only — section 11 kept, 10 dropped`, () => {
      const out = renderTask(task, { bazi: false, selfDescription: true });
      expect(out).not.toMatch(/^##\s*10\./m);
      expect(out).toMatch(/^##\s*11\./m);
    });

    it(`${locale}: no authoring marker ever reaches the model`, () => {
      for (const has of [NEITHER, BOTH, { bazi: true, selfDescription: false },
                         { bazi: false, selfDescription: true }]) {
        const out = renderTask(task, has);
        expect(out, JSON.stringify(has)).not.toMatch(/⟦/);
        expect(out, JSON.stringify(has)).not.toMatch(/⟧/);
      }
    });
  }

  it('the assembled prompt drops section 10 for a chart with no Bazi', () => {
    // The fixture carries no Bazi and FIXTURE_INPUT no self-description.
    const chart = FIXTURE_RESULT.chart;
    expect(chart.bazi).toBeUndefined();
    const prompt = buildAnalysisPrompt(chart, 'vi', FIXTURE_INPUT.name);
    expect(prompt).not.toMatch(/^##\s*10\./m);
    expect(prompt).not.toMatch(/⟦/);
  });

  it('the assembled prompt STATES the absence instead of leaving a silence', () => {
    const prompt = buildAnalysisPrompt(FIXTURE_RESULT.chart, 'vi', FIXTURE_INPUT.name);
    expect(prompt).toContain(getPrompt('vi').labels.baziAbsent);
  });

  it('a self-description brings section 11 back', () => {
    const prompt = buildAnalysisPrompt(
      FIXTURE_RESULT.chart, 'vi', FIXTURE_INPUT.name, 'Tôi hay ôm việc một mình.',
    );
    expect(prompt).toMatch(/^##\s*11\./m);
    expect(prompt).not.toMatch(/^##\s*10\./m);
  });
});

// P7 step 2 — the data context itself was leaking Vietnamese. A tứ hóa entry
// is "<transformation> <star>", and the star is usually two words
// ("Thiên Đồng"); splitting on every space looked each word up alone, so no
// multi-word star ever matched the vocabulary and a Chinese reader's prompt
// literally said `四化: 禄 Thiên Đồng`. The model was quoting us back.
describe('the data context carries no Vietnamese into another locale', () => {
  const VI = /[ăâđêôơư]/i;

  for (const locale of LOCALES.filter((l) => l !== 'vi' && l !== 'en')) {
    it(`${locale}: tứ hóa entries are fully translated`, () => {
      const chart = FIXTURE_RESULT.chart;
      // The fixture's yearly mutagens are multi-word: "Lộc Thiên Đồng".
      expect(chart.horoscope?.yearly.mutagen.join(' ')).toMatch(/Thiên Đồng/);
      const prompt = buildAnalysisPrompt(chart, locale, FIXTURE_INPUT.name);
      const line = prompt.split('\n').find((l) => l.includes(getPrompt(locale).labels.yearlyRow));
      expect(line, 'yearly horoscope line').toBeDefined();
      expect(VI.test(line!), `leaked: ${line}`).toBe(false);
    });

    it(`${locale}: no Vietnamese anywhere in the assembled data context`, () => {
      const prompt = buildAnalysisPrompt(FIXTURE_RESULT.chart, locale, 'X');
      // The data context is everything before the task layer's first banner.
      const context = prompt.slice(0, prompt.indexOf('━━━━'));
      const offenders = context.split('\n').filter((l) => VI.test(l));
      expect(offenders).toEqual([]);
    });
  }
});

// P7 step 2 — the model cited a classical text in Vietnamese romanisation to a
// Korean reader (EVAL.md §3.3). The rule lives in the TASK layer, which is sent
// per request; `system` lives in the context cache and would not take effect.
describe('classical sources are cited in the reader own conventions', () => {
  for (const locale of LOCALES.filter((l) => l !== 'vi')) {
    it(`${locale}: the task forbids Vietnamese romanisation of classical texts`, () => {
      expect(getPrompt(locale).task).toContain('Tử Vi Đẩu Số Toàn Thư');
    });
  }
  it('vi does not carry the rule, having no reason to', () => {
    expect(getPrompt('vi').task).not.toContain('Tham Vũ mộ trung cư');
  });
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
