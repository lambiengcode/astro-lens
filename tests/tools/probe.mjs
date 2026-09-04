import { chromium } from '@playwright/test';
import path from 'node:path';

const PATCH = `
  .doc{max-width:none!important;margin:0!important;padding:0!important}
  .frame{border:none!important;border-radius:0!important}
  .frame-bar,.nav,.doc-head,.sec-bar,.sec-note,.foot{display:none!important}
  .sec{margin-top:0!important}.frame-body{overflow-x:visible!important}
  :root{--tx3:#7d8ca8!important;--tx4:#717e98!important;--p-tx3:#6f6656!important}`;

const [refRoot, candUrl, candRoot, selList, w = 1440] = process.argv.slice(2);
const sels = selList.split(',');

const probe = ({ root, sels }) => {
  const base = document.querySelector(root);
  if (!base) return { error: 'root not found: ' + root };
  const b = base.getBoundingClientRect();
  const out = {};
  for (const s of sels) {
    const els = [...base.querySelectorAll(s)];
    out[s] = els.slice(0, 4).map(e => {
      const r = e.getBoundingClientRect();
      return `top ${(r.top - b.top).toFixed(1)} h ${r.height.toFixed(1)} w ${r.width.toFixed(1)}`;
    });
  }
  out['__root'] = [`h ${b.height.toFixed(1)} w ${b.width.toFixed(1)}`];
  return out;
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' });

const rp = await ctx.newPage();
await rp.goto('file://' + path.resolve('tests/parity/reference/mockup.html'), { waitUntil: 'networkidle' });
await rp.addStyleTag({ content: PATCH });
await rp.evaluate(() => document.fonts.ready);
const ref = await rp.evaluate(probe, { root: refRoot, sels });

const cp = await ctx.newPage();
await cp.goto(candUrl, { waitUntil: 'networkidle' });
await cp.evaluate(() => document.fonts.ready);
const cand = await cp.evaluate(probe, { root: candRoot, sels });

for (const k of Object.keys(ref)) {
  const a = (ref[k] || []).join(' | ');
  const c = (cand[k] || []).join(' | ');
  const mark = a === c ? '  ' : '≠ ';
  console.log(`${mark}${k}\n     ref  ${a}\n     cand ${c}`);
}
await b.close();
