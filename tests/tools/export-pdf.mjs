// Drives the real export path in a real browser and saves the PDF, so the
// acceptance in PLAN.md §8 is performed rather than asserted.
import { chromium } from '@playwright/test';

const out = process.argv[2];
// The app negotiates its locale from Accept-Language since P5, so the export
// has to say which one it is driving — and the button it clicks is named in
// that locale. `node tests/tools/export-pdf.mjs out.pdf ko-KR` exports Korean.
const accept = process.argv[3] ?? 'vi-VN';
const BUTTON = {
  'vi-VN': /Xuất PDF/, 'zh-CN': /导出 PDF/, 'zh-TW': /匯出 PDF/,
  'ko-KR': /PDF 내보내기/, 'en-US': /Export PDF/,
};
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  colorScheme: 'dark', reducedMotion: 'reduce', acceptDownloads: true,
  locale: accept,
});
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR:', String(e)));
await p.goto('http://localhost:3000/result?fixture=tuvi-ty&tab=interpretation', { waitUntil: 'domcontentloaded' });
await p.locator('.res-body .paper').first().waitFor({ state: 'visible' });
await p.evaluate(() => document.fonts.ready);

const dl = p.waitForEvent('download', { timeout: 120000 });
await p.getByRole('button', { name: BUTTON[accept] ?? BUTTON['vi-VN'] }).first().click();
const download = await dl;
await download.saveAs(out);
console.log('saved', out, '←', download.suggestedFilename());
await b.close();
