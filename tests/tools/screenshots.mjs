#!/usr/bin/env node
// Regenerates public/screenshots/ for the README, against a FRESH dev server.
//
// Same two constraints as the parity runner, for the same reasons: Next 16
// allows one dev server per project directory, and Turbopack will serve a
// stale stylesheet to a headless client. A screenshot of last week's CSS is
// worse than no screenshot, so this owns its server.
//
// Every shot uses the development fixture (`?fixture=tuvi-ty`), so they are
// reproducible and contain nobody's real birth data. The browser locale is
// pinned to vi-VN — the app negotiates from Accept-Language and Playwright
// sends en-US, so an unpinned run would quietly capture the English build.
//
// Captures are ELEMENT-scoped, not full-page. That is what keeps the files a
// few hundred KB instead of the ~2.8MB full-page shots this replaced.
//
// One shot needs a live model call: the chat answer with its citation row.
// It cannot be faked without the screenshot ceasing to be evidence, so
// `npm run screenshots` spends one Gemini request. Everything else is free.
import { chromium } from '@playwright/test';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'public', 'screenshots');
const PORT = process.env.SHOT_PORT ?? '3200';
const base = `http://localhost:${PORT}`;

// `SHOT_ONLY=chat npm run screenshots` re-takes one shot without spending the
// others — the chat shot in particular is a live model call and sometimes has
// to be retried.
const only = process.env.SHOT_ONLY ? new Set(process.env.SHOT_ONLY.split(',')) : null;

const quiet = (cmd) => { try { execSync(cmd, { stdio: 'ignore' }); } catch { /* nothing to stop */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(url, ms = 120_000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error(`dev server never came up at ${url}`);
}

const ROUTES = [
  '/?fixture=tuvi-ty',
  '/result?fixture=tuvi-ty&tab=chart',
  '/result?fixture=tuvi-ty&tab=daivan',
  '/result?fixture=tuvi-ty&tab=interpretation',
  '/result?fixture=tuvi-ty&tab=horoscope',
];

console.log('· stopping any running dev server');
quiet('pkill -f "next dev"');
await sleep(1500);

console.log(`· starting a fresh dev server on ${PORT}`);
const server = spawn('npx', ['next', 'dev', '--port', PORT], { cwd: ROOT, stdio: 'ignore' });

try {
  await waitFor(`${base}/`);
  console.log('· warming routes');
  for (let pass = 0; pass < 2; pass++) {
    for (const r of ROUTES) { try { await (await fetch(base + r)).text(); } catch { /* retried */ } }
  }
  await sleep(2000);

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  /** One page, configured the way every shot needs it. */
  async function open({ locale = 'vi-VN', width = 1440, height = 900, motion = 'reduce' } = {}) {
    const ctx = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: 1,
      colorScheme: 'dark', reducedMotion: motion, locale,
    });
    return { ctx, page: await ctx.newPage() };
  }

  async function settle(page, selector) {
    await page.locator(selector).first().waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
  }

  async function shot(name, { route, selector, locale, width, height, motion, before, viewportSlice }) {
    if (only && !only.has(name)) return;
    const { ctx, page } = await open({ locale, width, height, motion });
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await settle(page, selector);
    if (before) await before(page);
    const file = path.join(OUT, `${name}.png`);
    const target = page.locator(selector).first();
    if (viewportSlice) {
      // The element grows without bound — a chat panel is as tall as its
      // conversation, and the raw element shot came out 440x9709. Take a
      // viewport-height slice of its column instead, positioned by `before`.
      const box = await target.boundingBox();
      const vp = page.viewportSize();
      await page.screenshot({ path: file, clip: { x: box.x, y: 0, width: box.width, height: vp.height } });
    } else {
      await target.screenshot({ path: file });
    }
    await ctx.close();
    console.log(`  ${name}.png  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }

  await shot('landing', { route: '/?fixture=tuvi-ty', selector: '.app' });

  await shot('chart', {
    route: '/result?fixture=tuvi-ty&tab=chart', selector: '.res-body',
    before: async (p) => { await p.locator('.chart:not(.print) .pal.menh').click(); await p.waitForTimeout(600); },
  });

  // The signature interaction: hovering a palace draws its xung chiếu and tam
  // hợp. The linework is an SVG overlay, so motion is left ON and the shot
  // waits for a path to exist rather than for a fixed delay.
  await shot('chart-relations', {
    route: '/result?fixture=tuvi-ty&tab=chart', selector: '.chart:not(.print)', motion: 'no-preference',
    before: async (p) => {
      await p.locator('.chart:not(.print) .pal').nth(4).hover();
      await p.waitForFunction(() => (document.querySelector('.chart:not(.print) .rel-ov')?.childElementCount ?? 0) > 0,
        null, { timeout: 10_000 }).catch(() => console.log('    (no overlay linework appeared)'));
      await p.waitForTimeout(1200);
    },
  });

  await shot('daivan', { route: '/result?fixture=tuvi-ty&tab=daivan', selector: '.res-body' });
  await shot('reading', { route: '/result?fixture=tuvi-ty&tab=interpretation', selector: '.res-body' });

  // Korean, so the five-locale support is visible rather than claimed.
  await shot('chart-ko', {
    route: '/result?fixture=tuvi-ty&tab=chart&lang=ko', selector: '.res-body', locale: 'ko-KR',
  });

  // The live one. Asks a real question and waits for the citation row.
  await shot('chat', {
    route: '/result?fixture=tuvi-ty&tab=horoscope', selector: '.chat',
    height: 760, viewportSlice: true,
    before: async (p) => {
      // The citation row only renders when the model actually emitted one, and
      // it does not always. Ask again rather than shipping a shot of the
      // feature not happening.
      let cite = null;
      for (let attempt = 1; attempt <= 3 && !cite; attempt++) {
        await p.locator('.chat-f .inp').fill('Năm nay tôi chuyển việc có ổn không?');
        await p.locator('.chat-f button[type=submit]').click();
        console.log(`    attempt ${attempt}: waiting on a live model answer (~1-3 min)…`);
        const row = p.locator('.msg.a .cite').first();
        try {
          await row.waitFor({ state: 'visible', timeout: 240_000 });
          cite = row;
        } catch {
          const answers = await p.locator('.msg.a').allInnerTexts();
          console.log(`    no citation row; last answer began: ${(answers.at(-1) ?? '').slice(0, 90)}…`);
        }
      }
      if (!cite) throw new Error('the model would not cite after three attempts');
      // Frame the citation row itself, near the foot of the slice, with the
      // tail of the answer above it. The point of this shot is the .cite row.
      await cite.scrollIntoViewIfNeeded();
      await p.evaluate(() => {
        const r = document.querySelector('.msg.a .cite').getBoundingClientRect();
        window.scrollBy(0, r.bottom - (window.innerHeight - 90));
      });
      await p.waitForTimeout(600);
    },
  });

  await browser.close();
  console.log('\n· total', (fs.readdirSync(OUT).reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0) / 1024 / 1024).toFixed(2), 'MB');
} finally {
  server.kill('SIGTERM');
}
