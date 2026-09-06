import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import ChartGrid from '@/components/chart/ChartGrid';
import { FIXTURE_RESULT, FIXTURE_REFERENCE_YEAR, FIXTURE_BIRTH_YEAR } from '@/lib/fixture';
import { BRANCH_LABELS, xung, tamHop, BRANCH_LOOKUP } from '@/lib/branches';

afterEach(cleanup);

const palaces = FIXTURE_RESULT.chart.palaces;

/** Every star string a cell renders, in DOM order, for one variant. */
function starStrings(root: HTMLElement): string[] {
  return [...root.querySelectorAll('.pal')].map((cell) => {
    const majors = [...cell.querySelectorAll('.maj')].map((m) => m.textContent?.trim() ?? '');
    const minors = [...cell.querySelectorAll('.minors span')].map((m) => m.textContent ?? '');
    const adjs = [...cell.querySelectorAll('.adjs span')].map((m) => m.textContent ?? '');
    const empty = cell.querySelector('.empty')?.textContent ?? '';
    return [empty, ...majors, '|', ...minors, '|', ...adjs].join(' ').trim();
  });
}

describe('ChartGrid — print variant matches the screen variant', () => {
  it('renders the same palace count and the same star strings', () => {
    const screenRender = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}}
        chart={FIXTURE_RESULT.chart} name="Nguyễn Minh Anh" />
    );
    const screenCells = screenRender.container.querySelectorAll('.pal');
    const screenStars = starStrings(screenRender.container as HTMLElement);
    cleanup();

    const printRender = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}}
        chart={FIXTURE_RESULT.chart} name="Nguyễn Minh Anh" variant="print" />
    );
    const printCells = printRender.container.querySelectorAll('.pal');
    const printStars = starStrings(printRender.container as HTMLElement);

    expect(printCells.length).toBe(12);
    expect(printCells.length).toBe(screenCells.length);
    expect(printStars).toEqual(screenStars);
  });

  it('scopes the print tokens rather than forking the component', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} variant="print" />
    );
    const chart = container.querySelector('.chart')!;
    expect(chart.classList.contains('print')).toBe(true);
    // no interaction surface, no overlay, no legend in print
    expect(container.querySelectorAll('button.pal').length).toBe(0);
    expect(container.querySelector('.rel-ov')).toBeNull();
    expect(container.querySelector('.legend')).toBeNull();
    expect(container.querySelector('.centre .hint')).toBeNull();
  });

  it('keeps the palace cells as buttons on screen', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} />
    );
    expect(container.querySelectorAll('button.pal').length).toBe(12);
    expect(container.querySelector('.rel-ov')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('ChartGrid — relationship view is reachable by keyboard', () => {
  it('focus alone marks self, xung and both tam hợp palaces', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} />
    );
    const menh = BRANCH_LOOKUP['Dậu']; // 9
    const cell = container.querySelector<HTMLElement>(`[data-b="${menh}"]`)!;
    fireEvent.focus(cell);

    expect(container.querySelector('.chart')!.classList.contains('rel')).toBe(true);
    expect(cell.classList.contains('self')).toBe(true);

    const xungCell = container.querySelector<HTMLElement>(`[data-b="${xung(menh)}"]`)!;
    expect(xungCell.classList.contains('xung')).toBe(true);
    expect(xungCell.querySelector('.rel-tag')!.textContent).toBe('XUNG');

    for (const b of tamHop(menh)) {
      const hop = container.querySelector<HTMLElement>(`[data-b="${b}"]`)!;
      expect(hop.classList.contains('hop')).toBe(true);
      expect(hop.querySelector('.rel-tag')!.textContent).toBe('TAM HỢP');
    }

    fireEvent.blur(cell);
    expect(container.querySelector('.chart')!.classList.contains('rel')).toBe(false);
  });
});

describe('ChartGrid — missing palace banner', () => {
  it('names the missing branches on the signal treatment', () => {
    const short = palaces.filter((p) => p.earthlyBranch !== 'Dần' && p.earthlyBranch !== 'Mão');
    const { container } = render(
      <ChartGrid palaces={short} onPalaceClick={() => {}} />
    );
    const banner = container.querySelector('.err')!;
    expect(banner.textContent).toContain('Thiếu cung:');
    expect(banner.textContent).toContain('Dần');
    expect(banner.textContent).toContain('Mão');
  });

  it('renders all twelve branch labels in the cell footers', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} />
    );
    const rendered = [...container.querySelectorAll('.pal-f .rt')].map((n) => n.textContent ?? '');
    for (const label of BRANCH_LABELS) {
      expect(rendered.some((t) => t.endsWith(label)), `${label} missing`).toBe(true);
    }
  });
});

describe('ChartGrid — the centre đại vận dial', () => {
  const dialProps = {
    periods: FIXTURE_RESULT.decadalPeriods,
    birthYear: FIXTURE_BIRTH_YEAR,
    referenceYear: FIXTURE_REFERENCE_YEAR,
  };

  it('draws one segment per decade of this chart, labelled with its own start ages', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} chart={FIXTURE_RESULT.chart}
        name="Nguyễn Minh Anh" {...dialProps} />
    );
    const segments = [...container.querySelectorAll('.dial g')];
    expect(segments.length).toBe(FIXTURE_RESULT.decadalPeriods.length);
    expect(segments.map((g) => g.querySelector('text')!.textContent))
      .toEqual(FIXTURE_RESULT.decadalPeriods.map((p) => String(p.range[0])));
    // The rings are the fallback; a chart with a đại vận does not draw them.
    expect(container.querySelector('.centre .ring')).toBeNull();
  });

  it('lights the running decade, dims the lived ones, and marks this year once', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} chart={FIXTURE_RESULT.chart}
        name="Nguyễn Minh Anh" {...dialProps} />
    );
    const states = [...container.querySelectorAll('.dial g')].map((g) => g.getAttribute('class'));
    // 2026, born 1994 → 33 tuổi mụ → the third decade, 24–33.
    expect(states).toEqual(['past', 'past', 'now', ...Array(7).fill('fut')]);
    expect(container.querySelectorAll('.dial .mk').length).toBe(1);
    expect(container.querySelector('.centre .core .now')!.textContent)
      .toContain('24–33');
  });

  it('degrades to the plain identity panel when the chart has no đại vận', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} chart={FIXTURE_RESULT.chart}
        name="Nguyễn Minh Anh"
        periods={[]} birthYear={FIXTURE_BIRTH_YEAR} referenceYear={FIXTURE_REFERENCE_YEAR} />
    );
    expect(container.querySelector('.dial')).toBeNull();
    expect(container.querySelectorAll('.centre .ring').length).toBe(2);
    expect(container.querySelector('.centre .core .nm')!.textContent).toBe('Nguyễn Minh Anh');
    expect(container.querySelector('.centre .core .now')).toBeNull();
  });

  it('draws the dial without a lit arc when the age falls outside every decade', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} onPalaceClick={() => {}} chart={FIXTURE_RESULT.chart}
        periods={FIXTURE_RESULT.decadalPeriods} birthYear={FIXTURE_BIRTH_YEAR} referenceYear={1994} />
    );
    const states = [...container.querySelectorAll('.dial g')].map((g) => g.getAttribute('class'));
    expect(new Set(states)).toEqual(new Set(['fut']));
    expect(container.querySelector('.dial .mk')).toBeNull();
    expect(container.querySelector('.centre .core .now')).toBeNull();
  });
});
