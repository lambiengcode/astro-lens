// Render every page of a PDF to PNG, so the PLAN.md §8 acceptance looks at the
// actual exported file rather than at the code that produced it.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PDFJS = path.dirname(require.resolve('pdfjs-dist/package.json'));

const [pdfPath, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1400 } });
await p.setContent('<!doctype html><body style="margin:0"></body>');
await p.addScriptTag({ path: path.join(PDFJS, 'build', 'pdf.mjs'), type: 'module' });
await p.waitForFunction(() => 'pdfjsLib' in window, null, { timeout: 15000 }).catch(() => {});

const workerSrc = fs.readFileSync(path.join(PDFJS, 'build', 'pdf.worker.mjs'), 'utf8');
const bytes = fs.readFileSync(pdfPath).toString('base64');

const pages = await p.evaluate(async ({ b64, worker }) => {
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc =
    URL.createObjectURL(new Blob([worker], { type: 'text/javascript' }));
  const raw = atob(b64);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  const doc = await lib.getDocument({ data }).promise;
  const out = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    out.push(canvas.toDataURL('image/png'));
  }
  return out;
}, { b64: bytes, worker: workerSrc });

pages.forEach((d, i) => {
  fs.writeFileSync(path.join(outDir, `page-${i + 1}.png`), Buffer.from(d.split(',')[1], 'base64'));
});
console.log(`${pages.length} page(s) → ${outDir}`);
await b.close();
