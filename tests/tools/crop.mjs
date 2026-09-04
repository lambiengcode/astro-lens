import { chromium } from '@playwright/test';
const [url, sel, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3, colorScheme: 'dark', reducedMotion: 'reduce' });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.locator(sel).first().screenshot({ path: out });
await b.close();
