import { chromium } from '@playwright/test';
const [url, out, w = 1440, h = 900] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({
  viewport: { width: +w, height: +h }, deviceScaleFactor: 1,
  colorScheme: 'dark', reducedMotion: 'reduce',
});
const errs = [];
p.on('console', m => m.type() === 'error' && errs.push(m.text()));
p.on('pageerror', e => errs.push(String(e)));
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out, fullPage: true });
if (errs.length) console.log('PAGE ERRORS:\n' + errs.join('\n'));
await b.close();
