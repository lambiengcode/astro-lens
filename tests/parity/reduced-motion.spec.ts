import { test, expect, type Browser, type Page } from '@playwright/test';

// PLAN.md §9.5 / DESIGN.md §10.4 — under `prefers-reduced-motion: reduce`
// nothing animates and everything sits at its FINAL state. Not "the animation
// is shorter": the end state, immediately.
//
// Contexts are built explicitly rather than through `test.use`, because
// reducedMotion is a context option in this Playwright version, not a fixture.

const FIXTURE = '/result?fixture=tuvi-ty';

async function open(
  browser: Browser,
  url: string,
  ready: string,
  reduced: 'reduce' | 'no-preference' = 'reduce',
): Promise<Page> {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: reduced,
    // Pinned for the same reason as parity.spec.ts: the app negotiates its
    // locale from Accept-Language since P5.
    locale: 'vi-VN',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator(ready).first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return page;
}

/** Anything the browser is currently animating, anywhere in the document. */
async function runningAnimations(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document.getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => {
        const effect = a.effect as KeyframeEffect | null;
        const target = effect?.target as Element | null | undefined;
        const name = (a as unknown as { animationName?: string }).animationName
          ?? a.constructor.name;
        return `${name} on ${target?.className ?? '?'}`;
      }));
}

const SETTLED = ['none', 'matrix(1, 0, 0, 1, 0, 0)'];

test('reduced motion: the chart is at its final state and nothing animates', async ({ browser }) => {
  const page = await open(browser, `${FIXTURE}&tab=chart`, '.res-body .chart');

  const cells = await page.locator('.res-body .chart .pal').all();
  expect(cells.length).toBe(12);
  for (const cell of cells) {
    const style = await cell.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, transform: cs.transform };
    });
    expect(style.opacity).toBe('1');
    expect(SETTLED).toContain(style.transform);
  }

  // the Mệnh and đại vận top rules are drawn, not left at scaleX(0)
  for (const sel of ['.res-body .pal.menh', '.res-body .pal.dv']) {
    const transform = await page.locator(sel).first()
      .evaluate((el) => getComputedStyle(el, '::before').transform);
    expect(SETTLED, `${sel}::before`).toContain(transform);
  }

  expect(await runningAnimations(page)).toEqual([]);
  await page.context().close();
});

test('reduced motion: relationship linework is present but not drawing', async ({ browser }) => {
  const page = await open(browser, `${FIXTURE}&tab=chart`, '.res-body .chart');
  await page.locator('.res-body .pal.menh').first().focus();
  await page.waitForTimeout(300);

  const lines = page.locator('.res-body .rel-ov line');
  expect(await lines.count()).toBeGreaterThan(0);

  // no stroke-dashoffset animation left mid-flight
  for (const line of await lines.all()) {
    const offset = await line.evaluate((el) => getComputedStyle(el).strokeDashoffset);
    expect(['0px', '0', 'none']).toContain(offset);
  }
  expect(await runningAnimations(page)).toEqual([]);
  await page.context().close();
});

test('reduced motion: the đại vận bar sits at its computed width', async ({ browser }) => {
  const page = await open(browser, `${FIXTURE}&tab=daivan`, '.tl');
  const fill = await page.locator('.bar i').first().evaluate((el) => el.getBoundingClientRect().width);
  const track = await page.locator('.bar').first().evaluate((el) => el.getBoundingClientRect().width);
  expect(fill).toBeGreaterThan(0);
  expect(fill).toBeLessThanOrEqual(track + 0.5);
  expect(await runningAnimations(page)).toEqual([]);
  await page.context().close();
});

test('reduced motion: the seal is stamped', async ({ browser }) => {
  const page = await open(browser, `${FIXTURE}&tab=interpretation`, '.res-body .paper');
  const seal = await page.locator('.res-body .seal').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, transform: cs.transform };
  });
  expect(Number(seal.opacity)).toBeCloseTo(0.5, 2);
  expect(seal.transform).not.toBe('none'); // still rotated −7°
  expect(await runningAnimations(page)).toEqual([]);
  await page.context().close();
});

test('reduced motion: counters land on their values and sections are visible', async ({ browser }) => {
  const page = await open(browser, '/', '.stats');
  expect(await page.locator('.stat .v').allTextContents()).toEqual(['12', '108+', '10×', '100%']);

  const band = await page.locator('.band').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, transform: cs.transform };
  });
  expect(band.opacity).toBe('1');
  expect(SETTLED).toContain(band.transform);

  expect(await runningAnimations(page)).toEqual([]);
  await page.context().close();
});

test('motion on, for contrast: the astrolabe actually turns', async ({ browser }) => {
  const page = await open(browser, '/', '.labe svg', 'no-preference');
  expect((await runningAnimations(page)).join(' ')).toContain('rot');
  await page.context().close();
});
