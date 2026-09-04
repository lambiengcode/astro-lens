// Diagnostic: how big are the per-pixel differences, and where do they sit?
// A rasterisation haze is many pixels with small deltas, all adjacent to a
// glyph edge. A structural difference is fewer pixels with large deltas in a
// contiguous block.
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';

const pad = (src, w, h) => {
  if (src.width === w && src.height === h) return src;
  const dst = new PNG({ width: w, height: h });
  PNG.bitblt(src, dst, 0, 0, Math.min(src.width, w), Math.min(src.height, h), 0, 0);
  return dst;
};

for (const name of process.argv.slice(2)) {
  const a0 = PNG.sync.read(fs.readFileSync(`tests/parity/out/${name}.ref.png`));
  const b0 = PNG.sync.read(fs.readFileSync(`tests/parity/out/${name}.cand.png`));
  const w = Math.max(a0.width, b0.width), h = Math.max(a0.height, b0.height);
  const a = pad(a0, w, h), b = pad(b0, w, h);

  const at = (buf, i) => [buf[i], buf[i + 1], buf[i + 2]];
  let deltas = [];
  for (let i = 0; i < a.data.length; i += 4) {
    const [r1, g1, b1] = at(a.data, i), [r2, g2, b2] = at(b.data, i);
    const d = Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2));
    if (d > 0) deltas.push(d);
  }
  deltas.sort((x, y) => x - y);
  const q = (p) => deltas.length ? deltas[Math.floor(deltas.length * p)] : 0;

  const counts = [0.1, 0.2, 0.35, 0.5].map((t) =>
    (pixelmatch(a.data, b.data, null, w, h, { threshold: t }) / (w * h) * 100).toFixed(3));

  console.log(
    `${name.padEnd(22)} nonzero ${String(deltas.length).padStart(7)}` +
    `  median Δ ${String(q(0.5)).padStart(3)}  p90 Δ ${String(q(0.9)).padStart(3)}  max Δ ${String(deltas.at(-1) ?? 0).padStart(3)}` +
    `  | thr .10 ${counts[0]}%  .20 ${counts[1]}%  .35 ${counts[2]}%  .50 ${counts[3]}%`);
}
