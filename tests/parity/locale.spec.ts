import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { VIEWPORTS } from './screens';
import { FIXTURE_INPUT } from '../../src/lib/fixture';

// ============================================================
// LAYOUT STRESS PER LOCALE — PLAN.md §13b.6, tests 7 and 8
// ============================================================
//
// These captures are NOT compared to the mockup. The mockup is Vietnamese, so
// there is nothing to compare a Korean render against; what §13b.6 asks for is
// that the twelve-palace grid survives the other scripts. Four assertions:
//
//   · no cell overflow          — no palace cell's content spills its box
//   · no clipped glyph          — nothing is cut off by a scroller or a clip
//   · no body horizontal scroll — the chart's own scroller is the only one
//   · every CJK/Hangul run ≥11px — DESIGN.md §15.3's floor, measured on the
//     rendered DOM rather than trusted from the stylesheet
//
// Plus test 7, the leakage sweep: no Vietnamese diacritic may appear in the
// rendered text of a non-`vi` locale.

const OUT = path.join(__dirname, 'out');
const RESULTS = path.join(OUT, 'results');

/** Every locale, and the Accept-Language a reader of it actually sends. */
const LOCALES = [
  { id: 'vi', accept: 'vi-VN', script: 'latin' },
  { id: 'zh-Hans', accept: 'zh-CN', script: 'hans' },
  { id: 'zh-Hant', accept: 'zh-TW', script: 'hant' },
  { id: 'ko', accept: 'ko-KR', script: 'hangul' },
  { id: 'en', accept: 'en-US', script: 'latin' },
] as const;

/** §13b.6 names zh-Hant and ko at both viewports; the rest come free. */
const ROUTES = [
  { slug: 'chart', route: '/result?fixture=tuvi-ty&tab=chart', ready: '.chart' },
  { slug: 'overview', route: '/result?fixture=tuvi-ty&tab=overview', ready: '.res-body' },
];

// Latin letters that exist in Vietnamese and in none of the other four
// locales' scripts. `ư` and `ơ` are Vietnamese-only in Unicode terms; the
// tone-marked vowels below are the ones this app actually renders.
const VIETNAMESE = /[ăâđêôơưƯĂÂĐÊÔƠàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ]/;

const CJK_OR_HANGUL = /[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿]/;

interface Probe {
  bodyScroll: { scrollWidth: number; clientWidth: number };
  overflowing: string[];
  clipped: string[];
  small: string[];
  vietnamese: string[];
  denseRuns: number;
}

async function probe(page: Page): Promise<Probe> {
  return page.evaluate(({ viSource, denseSource, subjectName }) => {
    const VI = new RegExp(viSource);
    const DENSE = new RegExp(denseSource);
    const label = (el: Element) =>
      `${el.tagName.toLowerCase()}.${(el.className || '').toString().trim().split(/\s+/).join('.').slice(0, 40)}`;

    const overflowing: string[] = [];
    const clipped: string[] = [];
    const small: string[] = [];
    const vietnamese: string[] = [];
    let denseRuns = 0;

    // ── cell overflow ────────────────────────────────────────────────────
    // A palace cell is the tightest box in the app; content escaping it is
    // the failure DESIGN.md §15.3 is affordable *because* it does not happen.
    for (const cell of document.querySelectorAll('.pal, .cand, .card, .tl-row, .kv > div')) {
      const box = cell.getBoundingClientRect();
      for (const child of cell.querySelectorAll('*')) {
        const r = child.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        // half a pixel of tolerance, the same the geometry gate uses
        if (r.right > box.right + 0.5 || r.bottom > box.bottom + 0.5
            || r.left < box.left - 0.5 || r.top < box.top - 0.5) {
          overflowing.push(`${label(cell)} › ${label(child)}`);
        }
      }
      // and the cell's own scrollable extent
      if (cell.scrollHeight > cell.clientHeight + 1 || cell.scrollWidth > cell.clientWidth + 1) {
        clipped.push(`${label(cell)} clips ${cell.scrollWidth}×${cell.scrollHeight} in ${cell.clientWidth}×${cell.clientHeight}`);
      }
    }

    // ── type floor and leakage, over every text node ─────────────────────
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = (node.textContent || '').trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;

      // Three kinds of text are Vietnamese by design and are excluded from the
      // leakage sweep. Each is narrow and named, because a broad exclusion is
      // how a real leak hides:
      //
      //  1. the language switcher's own options — every locale is listed in
      //     its own endonym, so "Tiếng Việt" appears in the Korean UI on
      //     purpose;
      //  2. the reading body — the deterministic fixture ships one canned
      //     Vietnamese reading (src/lib/fixture.ts) because it exists to pin
      //     the *layout*. A real request produces the reading in the reader's
      //     language; that is what tests/unit/prompt.test.ts checks;
      //  3. the subject's own name, which is data the reader typed.
      const excluded = el.closest('.lang-sel, .prose-interpretation');
      const stripped = text.split(subjectName).join('').trim();
      if (!excluded && stripped && VI.test(stripped)) {
        vietnamese.push(`${label(el)}: ${text.slice(0, 60)}`);
      }

      if (DENSE.test(text)) {
        denseRuns += 1;
        const size = parseFloat(cs.fontSize);
        // DESIGN.md §15.3: never below 11px anywhere.
        if (size < 11) small.push(`${label(el)} @ ${size}px: ${text.slice(0, 30)}`);
      }
    }

    return {
      bodyScroll: {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      },
      overflowing: [...new Set(overflowing)].slice(0, 20),
      clipped: [...new Set(clipped)].slice(0, 20),
      small: [...new Set(small)].slice(0, 20),
      vietnamese: [...new Set(vietnamese)].slice(0, 20),
      denseRuns,
    };
  }, { viSource: VIETNAMESE.source, denseSource: CJK_OR_HANGUL.source, subjectName: FIXTURE_INPUT.name ?? '' });
}

test.beforeAll(() => {
  fs.mkdirSync(RESULTS, { recursive: true });
});

for (const loc of LOCALES) {
  for (const vp of VIEWPORTS) {
    for (const r of ROUTES) {
      test(`${loc.id} ${r.slug} @ ${vp.name}`, async ({ browser }) => {
        const ctx = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          colorScheme: 'dark',
          reducedMotion: 'reduce',
          locale: loc.accept,
        });
        const page = await ctx.newPage();
        await page.goto(r.route, { waitUntil: 'domcontentloaded' });
        await page.locator(r.ready).first().waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);

        const script = await page.evaluate(() =>
          document.documentElement.getAttribute('data-script'));
        expect(script, 'resolved script').toBe(loc.script);

        const p = await probe(page);

        await page.screenshot({
          path: path.join(OUT, `locale-${loc.id}-${r.slug}-${vp.name}.png`),
          fullPage: true,
        });
        fs.writeFileSync(
          path.join(RESULTS, `locale-${loc.id}-${r.slug}-${vp.name}.json`),
          JSON.stringify({ locale: loc.id, screen: r.slug, viewport: vp.name, script, ...p }, null, 2),
        );
        await ctx.close();

        // no body horizontal scroll — the chart's own scroller is the only one
        expect(p.bodyScroll.scrollWidth, 'document horizontal scroll')
          .toBeLessThanOrEqual(p.bodyScroll.clientWidth);
        // no cell overflow, no clipped glyph
        expect(p.overflowing, 'content outside its cell').toEqual([]);
        expect(p.clipped, 'content clipped by its cell').toEqual([]);
        // TEST 8 — no CJK or Hangul below 11px
        expect(p.small, 'CJK/Hangul below the 11px floor').toEqual([]);

        if (loc.id === 'vi') {
          // The control. `vi` runs the identical sweep and MUST report
          // Vietnamese — otherwise the empty result at the other four locales
          // would prove only that the sweep is broken.
          expect(p.vietnamese.length, 'Vietnamese found at vi').toBeGreaterThan(5);
        } else {
          // TEST 7 — no untranslated leakage
          expect(p.vietnamese, 'Vietnamese left in the rendered DOM').toEqual([]);
        }
        if (loc.script !== 'latin') {
          expect(p.denseRuns, 'dense-script runs found').toBeGreaterThan(20);
        }
      });
    }
  }
}
