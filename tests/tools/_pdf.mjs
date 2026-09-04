// Render every page of a PDF to PNG with the browser's own PDF viewer, so the
// acceptance check looks at the file a user would open.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [pdf, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1280 } });
await p.goto('file://' + pdf);
await p.waitForTimeout(4000);
// Chromium's viewer paints pages into an embedded plugin; screenshot by scroll.
for (let i = 0; i < 8; i++) {
  await p.screenshot({ path: `${outDir}/scroll-${i}.png` });
  const more = await p.evaluate(() => {
    const before = window.scrollY;
    window.scrollBy(0, window.innerHeight - 40);
    return window.scrollY !== before;
  });
  if (!more) break;
  await p.waitForTimeout(700);
}
await b.close();
