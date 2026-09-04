import { test, expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';
import path from 'node:path';
import { SCREENS, VIEWPORTS, type Screen, type Viewport } from './screens';

const OUT = path.join(__dirname, 'out');
const TOLERANCE = 0.5; // % differing pixels — PLAN.md §10.3

const REFERENCE = 'file://' + path.join(__dirname, 'reference', 'mockup.html');

// ── Reference normalisation ─────────────────────────────────────────────────
// Two changes, both to the DOCUMENT AROUND the app, never to the app itself:
//
// 1. The mockup is a design document: each screen sits inside a device frame
//    inside a 1240px page with 20px padding. Stripping that chrome makes the
//    framed app exactly viewport-wide, so both sides lay out at the same
//    content width at the same nominal viewport.
// 2. DESIGN.md §4.5 corrects three tokens that fail WCAG AA in the mockup.
//    DESIGN.md is authoritative and §15 says the mockup should be corrected to
//    match. We correct it here rather than copying the failing values.
const REFERENCE_PATCH = `
  .doc { max-width: none !important; margin: 0 !important; padding: 0 !important; }
  .frame { border: none !important; border-radius: 0 !important; }
  .frame-bar, .nav, .doc-head, .sec-bar, .sec-note, .foot { display: none !important; }
  .sec { margin-top: 0 !important; }
  .frame-body { overflow-x: visible !important; }
  :root {
    --tx3: #7d8ca8 !important;
    --tx4: #717e98 !important;
    --p-tx3: #6f6656 !important;
  }
`;

/**
 * Box of every matching element, relative to the captured root. This is the
 * measurement PLAN.md §10.3 actually cares about: position, size, spacing.
 */
type Boxes = Record<string, string[]>;

async function measure(page: Page, root: string, selectors: string[]): Promise<Boxes> {
  return page.evaluate(({ root, selectors }) => {
    const base = document.querySelector(root);
    if (!base) return {};
    const b = base.getBoundingClientRect();
    const out: Record<string, string[]> = {};
    for (const sel of selectors) {
      out[sel] = [...base.querySelectorAll(sel)]
        .map((el) => el.getBoundingClientRect())
        // elements taken out of the flow for this capture are not laid out and
        // have nothing to compare
        .filter((r) => r.width > 0 || r.height > 0)
        .map((r) => {
          const round = (n: number) => Math.round(n * 2) / 2; // half-pixel tolerance
          return `${round(r.top - b.top)},${round(r.left - b.left)},${round(r.width)},${round(r.height)}`;
        });
    }
    return out;
  }, { root, selectors });
}

function geometryDiff(ref: Boxes, cand: Boxes): string[] {
  const problems: string[] = [];
  for (const sel of Object.keys(ref)) {
    const a = ref[sel] ?? [];
    const c = cand[sel] ?? [];
    if (a.length !== c.length) {
      problems.push(`${sel}: reference has ${a.length} element(s), candidate has ${c.length}`);
      continue;
    }
    a.forEach((box, i) => {
      if (box !== c[i]) {
        problems.push(`${sel}[${i}]: top,left,w,h  ref ${box}  cand ${c[i]}`);
      }
    });
  }
  return problems;
}

// `networkidle` never settles against a dev server holding an HMR socket open,
// so wait on the thing that actually matters: fonts loaded and the captured
// element laid out. PLAN.md §10.2 requires document.fonts.ready before every
// shot — web-font swap is the classic false diff.
async function settle(page: Page, selector: string) {
  await page.locator(selector).first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function applyMasks(page: Page, masks: { selector: string; mode: 'hide' | 'collapse' }[]) {
  const rules = masks
    .filter((m) => m.selector)
    .map((m) => `${m.selector}{${m.mode === 'collapse' ? 'display:none' : 'visibility:hidden'}!important}`);
  if (!rules.length) return;
  await page.addStyleTag({ content: rules.join('\n') });
}

function pct(a: Buffer, b: Buffer, diffPath: string) {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);

  // Pad both to a common canvas so a size difference shows as a diff band
  // rather than crashing the comparison.
  const pad = (src: PNG) => {
    if (src.width === width && src.height === height) return src;
    const dst = new PNG({ width, height });
    PNG.bitblt(src, dst, 0, 0, Math.min(src.width, width), Math.min(src.height, height), 0, 0);
    return dst;
  };

  const A = pad(imgA);
  const B = pad(imgB);
  const diff = new PNG({ width, height });
  const changed = pixelmatch(A.data, B.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    percent: (changed / (width * height)) * 100,
    changed,
    total: width * height,
    sizeA: `${imgA.width}×${imgA.height}`,
    sizeB: `${imgB.width}×${imgB.height}`,
  };
}

// One file per screen: Playwright does not guarantee module state survives
// between tests, and a half-written report is not evidence.
const RESULTS = path.join(OUT, 'results');

test.beforeAll(() => {
  fs.mkdirSync(RESULTS, { recursive: true });
});

function record(slug: string, viewport: string, data: Record<string, unknown>) {
  fs.writeFileSync(path.join(RESULTS, `${slug}-${viewport}.json`), JSON.stringify(data, null, 2));
}

for (const vp of VIEWPORTS) {
  for (const screen of SCREENS) {
    test(`§${screen.id} ${screen.slug} @ ${vp.name}`, async ({ browser }) => {
      const shots = await capture(browser, screen, vp);
      const diffPath = path.join(OUT, `${screen.slug}-${vp.name}.diff.png`);
      const r = pct(shots.reference, shots.candidate, diffPath);
      const geo = geometryDiff(shots.refBoxes, shots.candBoxes);

      record(screen.slug, vp.name, {
        screen: `§${screen.id} ${screen.slug}`,
        viewport: vp.name,
        size: `${vp.width}×${vp.height}`,
        referenceSize: r.sizeA,
        candidateSize: r.sizeB,
        differingPixels: r.changed,
        totalPixels: r.total,
        percent: +r.percent.toFixed(4),
        geometryChecks: Object.values(shots.refBoxes).reduce((n, v) => n + v.length, 0),
        geometryMismatches: geo,
        masks: (screen.masks ?? []).map((m) => m.why),
      });

      console.log(
        `  §${screen.id} ${screen.slug} @ ${vp.name}: ${r.percent.toFixed(3)}% `
        + `(${r.changed}/${r.total}) ref ${r.sizeA} cand ${r.sizeB}`
      );

      if (geo.length) {
        console.log('    geometry mismatches:\n      ' + geo.join('\n      '));
      }

      // Position, size and spacing are the hard gate — a mismatch here is a
      // failure at any pixel percentage (PLAN.md §10.3).
      expect(geo, `§${screen.id} ${screen.slug} @ ${vp.name} — geometry`).toEqual([]);
      expect(r.percent, `§${screen.id} ${screen.slug} @ ${vp.name} — pixels`).toBeLessThanOrEqual(TOLERANCE);
    });
  }
}

async function capture(
  browser: import('@playwright/test').Browser,
  screen: Screen,
  vp: Viewport,
) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    // The reference mockup is Vietnamese, so the candidate must be captured in
    // Vietnamese. Since P5 the app negotiates its locale from Accept-Language
    // (src/proxy.ts), and Playwright's default is en-US — without this the
    // harness would compare an English render against a Vietnamese reference
    // and report it as a page-wide geometry failure. PLAN.md §13b.6.
    locale: 'vi-VN',
  });

  const refMasks = (screen.masks ?? [])
    .map((m) => ({ selector: m.reference, mode: m.mode ?? 'hide' as const }));
  // The chat FAB is fixed chrome that floats over every result tab; the mockup
  // draws no equivalent, so it is out of every diff. See PARITY.md.
  const candMasks = [
    ...(screen.masks ?? []).map((m) => ({ selector: m.candidate, mode: m.mode ?? 'hide' as const })),
    { selector: '.fab', mode: 'hide' as const },
  ];

  // reference
  const rp = await ctx.newPage();
  await rp.goto(REFERENCE, { waitUntil: 'load' });
  await rp.addStyleTag({ content: REFERENCE_PATCH });
  await settle(rp, screen.reference);
  await applyMasks(rp, refMasks);
  const reference = await rp.locator(screen.reference).first()
    .screenshot({ path: path.join(OUT, `${screen.slug}-${vp.name}.ref.png`) });
  const refBoxes = await measure(rp, screen.reference, screen.geometry);
  await rp.close();

  // candidate
  const cp = await ctx.newPage();
  await cp.goto(screen.route, { waitUntil: 'domcontentloaded' });
  await settle(cp, screen.candidate);
  if (screen.candidateSetup) await cp.addStyleTag({ content: screen.candidateSetup });
  for (const sel of screen.click ?? []) await cp.locator(sel).first().click();
  // clicking a cell in the right column scrolls the chart's horizontal
  // scroller; the capture must start from its resting position
  await cp.evaluate(() => {
    document.querySelectorAll('.chart-scroll').forEach((el) => { el.scrollLeft = 0; });
  });
  await applyMasks(cp, candMasks);
  if (screen.focus) await cp.locator(screen.focus).first().focus();
  await cp.waitForTimeout(250);
  const candidate = await cp.locator(screen.candidate).first()
    .screenshot({ path: path.join(OUT, `${screen.slug}-${vp.name}.cand.png`) });
  const candBoxes = await measure(cp, screen.candidate, screen.geometry);
  await cp.close();

  await ctx.close();
  return { reference, candidate, refBoxes, candBoxes };
}
