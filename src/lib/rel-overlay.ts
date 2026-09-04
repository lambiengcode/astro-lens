import { xung, tamHop } from './branches';

// ============================================================
// RELATIONSHIP LINEWORK — DESIGN.md §9.2, PLAN.md §5.5
// ============================================================
// Drawn imperatively into an <svg> that is aria-hidden and
// pointer-events:none, so it can never intercept the click that
// selects a palace. Geometry is recomputed on every activation —
// the grid lives in a horizontal scroller and its box moves.

const NS = 'http://www.w3.org/2000/svg';

interface Point { x: number; y: number }

function mk(tag: string, attrs: Record<string, string | number>, cls?: string) {
  const n = document.createElementNS(NS, tag);
  if (cls) n.setAttribute('class', cls);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
}

function centreOf(el: Element, base: DOMRect): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
}

export function clearOverlay(ov: SVGSVGElement) {
  ov.replaceChildren();
}

/**
 * Draw the tam hợp triangle and the xung chiếu axis for `branch`.
 * Returns nothing; the caller owns the `.rel` class on the grid and the
 * per-cell state classes.
 */
export function drawRelationships(
  chart: HTMLElement,
  ov: SVGSVGElement,
  branch: number,
  reduced: boolean,
) {
  clearOverlay(ov);

  const cellFor = (b: number) => chart.querySelector<HTMLElement>(`[data-b="${b}"]`);
  const selfCell = cellFor(branch);
  if (!selfCell) return;

  // size the overlay to the grid as it is laid out right now
  const base = chart.getBoundingClientRect();
  ov.setAttribute('width', String(base.width));
  ov.setAttribute('height', String(base.height));
  ov.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);

  const self = centreOf(selfCell, base);

  const line = (a: Point, b: Point, cls: string, delay: number) => {
    const l = mk('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, cls);
    ov.appendChild(l);
    if (reduced) return;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    l.style.strokeDasharray = String(len);
    l.style.strokeDashoffset = String(len);
    l.style.transition = `stroke-dashoffset .42s var(--e-out) ${delay}ms`;
    requestAnimationFrame(() => { l.style.strokeDashoffset = '0'; });
  };

  const cap = (a: Point, b: Point, text: string, cls: string, delay: number) => {
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
    const w = text.length * 6.2 + 10;
    const g = mk('g', {});
    g.appendChild(mk('rect', { x: x - w / 2, y: y - 8, width: w, height: 16, rx: 2 }, 'cap-bg'));
    const t = mk('text', { x, y: y + 0.5 }, 'cap ' + cls);
    t.textContent = text;
    g.appendChild(t);
    ov.appendChild(g);
    if (reduced) return;
    g.style.opacity = '0';
    g.style.transition = `opacity .3s var(--e-out) ${delay + 240}ms`;
    requestAnimationFrame(() => { g.style.opacity = '1'; });
  };

  const node = (p: Point, cls: string, r = 4) =>
    ov.appendChild(mk('circle', { cx: p.x, cy: p.y, r }, 'node ' + cls));

  // tam hợp: the full triangle, because that is what the triangle means
  const hopPts = tamHop(branch)
    .map(cellFor)
    .filter((c): c is HTMLElement => !!c)
    .map((c) => centreOf(c, base));

  hopPts.forEach((p, i) => line(self, p, 'l-hop', i * 70));
  if (hopPts.length === 2) line(hopPts[0], hopPts[1], 'l-close', 180);

  // xung chiếu: the axis straight through the centre of the chart
  const xungCell = cellFor(xung(branch));
  let xungPt: Point | null = null;
  if (xungCell) {
    xungPt = centreOf(xungCell, base);
    line(self, xungPt, 'l-xung', 40);
    cap(self, xungPt, 'XUNG CHIẾU', 'cap-xung', 40);
  }
  if (hopPts.length) cap(self, hopPts[0], 'TAM HỢP', 'cap-hop', 0);

  // endpoints last so they sit on top of the strokes
  hopPts.forEach((p) => node(p, 'n-hop'));
  if (xungPt) node(xungPt, 'n-xung');
  node(self, 'n-self', 5);
}
