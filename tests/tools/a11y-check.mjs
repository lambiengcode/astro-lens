// PLAN.md §10.5 — the mechanical half of the manual checklist.
import { chromium } from '@playwright/test';

const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const parse = (s) => {
  const n = s.match(/-?\d+(\.\d+)?/g).map(Number);
  return { rgb: n.slice(0, 3), a: n.length > 3 ? n[3] : 1 };
};
/** Flatten a stack of possibly translucent colours, nearest first. */
const composite = (layers) => layers.reduce((under, over) => {
  const { rgb, a } = parse(over);
  if (a >= 1) return rgb;
  return rgb.map((c, i) => c * a + under[i] * (1 - a));
}, [0, 0, 0]);

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const page = await ctx.newPage();

const urls = {
  landing: 'http://localhost:3000/?fixture=tuvi-ty',
  chart: 'http://localhost:3000/result?fixture=tuvi-ty&tab=chart',
  reading: 'http://localhost:3000/result?fixture=tuvi-ty&tab=interpretation',
  horoscope: 'http://localhost:3000/result?fixture=tuvi-ty&tab=horoscope',
};

console.log('── text contrast, sampled from live elements ─────────────────────');
await page.goto(urls.chart, { waitUntil: 'domcontentloaded' });
await page.locator('.res-body .chart').waitFor({ state: 'visible' });
await page.evaluate(() => document.fonts.ready);

const samples = await page.evaluate(() => {
  const pick = (sel, label) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    // walk up for the painted background
    // Collect every painted layer up to the first opaque one, so a
    // translucent chip is measured over what is actually behind it.
    const stack = [];
    for (let node = el; node; node = node.parentElement) {
      const c = getComputedStyle(node).backgroundColor;
      if (!c || c === 'transparent' || /,\s*0\)$/.test(c)) continue;
      stack.push(c);
      if (!/rgba/.test(c) || /,\s*1\)$/.test(c)) break;
    }
    return { label, sel, color: cs.color, stack: stack.reverse(), size: cs.fontSize, weight: cs.fontWeight };
  };
  return [
    pick('.res-body .adjs span', 'sao lẻ (--tx4)'),
    pick('.res-body .minors span', 'phụ tinh (--cyan .85)'),
    pick('.res-body .maj .nm', 'chính tinh (--amber)'),
    pick('.res-body .maj .br', 'brightness (--tx3)'),
    pick('.res-body .pal-f .lf', 'vòng Trường Sinh (--tx3)'),
    pick('.res-body .pal-f .rt', 'can chi (--tx2)'),
    pick('.res-body .pal-f .ct .pn', 'palace name (--tx)'),
    pick('.res-body .legend', 'legend (--tx3)'),
    pick('.res-body .mut.ky', 'Hóa Kỵ chip (--sig)'),
    pick('.res-body .centre .hint', 'centre hint (--tx4)'),
  ].filter(Boolean);
});

let worst = Infinity;
for (const s of samples) {
  const r = ratio(parse(s.color).rgb, composite(s.stack));
  const px = parseFloat(s.size);
  const large = px >= 24 || (px >= 18.66 && Number(s.weight) >= 700);
  const need = large ? 3 : 4.5;
  worst = Math.min(worst, r);
  console.log(`  ${r >= need ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1  (needs ${need})  ${String(s.size).padStart(7)}  ${s.label}`);
}
console.log(`  worst measured: ${worst.toFixed(2)}:1`);

console.log('\n── keyboard: focus-visible on every interactive element ──────────');
for (const [name, url] of Object.entries(urls)) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const missing = await page.evaluate(() => {
    const els = [...document.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.getBoundingClientRect().width > 0 && !el.closest('[aria-hidden="true"]'));
    const bad = [];
    for (const el of els) {
      el.focus();
      const cs = getComputedStyle(el);
      const ring = cs.outlineStyle !== 'none' || cs.boxShadow !== 'none'
        || cs.borderColor.includes('94, 201, 214');
      // ::after inset (palace + candidate cells) also counts as a visible ring
      const after = getComputedStyle(el, '::after').boxShadow;
      if (!ring && (after === 'none' || after.startsWith('rgba(0, 0, 0, 0)'))) {
        bad.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);
      }
    }
    return { total: els.length, bad };
  });
  console.log(`  ${name.padEnd(10)} ${missing.total} focusable, ${missing.bad.length} without a visible ring` +
    (missing.bad.length ? ': ' + [...new Set(missing.bad)].join(', ') : ''));
}

console.log('\n── body must never scroll sideways ───────────────────────────────');
for (const w of [1440, 390, 320]) {
  await page.setViewportSize({ width: w, height: 900 });
  for (const [name, url] of Object.entries(urls)) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const over = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`  ${String(w).padStart(4)}px ${name.padEnd(10)} body overflow ${over}px ${over <= 0 ? 'OK' : 'FAIL'}`);
  }
}

await b.close();
