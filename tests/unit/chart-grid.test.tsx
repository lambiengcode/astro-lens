import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import ChartGrid from '@/components/chart/ChartGrid';
import { FIXTURE_RESULT } from '@/lib/fixture';
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
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}}
        chart={FIXTURE_RESULT.chart} name="Nguyễn Minh Anh" />
    );
    const screenCells = screenRender.container.querySelectorAll('.pal');
    const screenStars = starStrings(screenRender.container as HTMLElement);
    cleanup();

    const printRender = render(
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}}
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
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}} variant="print" />
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
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}} />
    );
    expect(container.querySelectorAll('button.pal').length).toBe(12);
    expect(container.querySelector('.rel-ov')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('ChartGrid — relationship view is reachable by keyboard', () => {
  it('focus alone marks self, xung and both tam hợp palaces', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}} />
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
      <ChartGrid palaces={short} activePalace={null} onPalaceClick={() => {}} />
    );
    const banner = container.querySelector('.err')!;
    expect(banner.textContent).toContain('Thiếu cung:');
    expect(banner.textContent).toContain('Dần');
    expect(banner.textContent).toContain('Mão');
  });

  it('renders all twelve branch labels in the cell footers', () => {
    const { container } = render(
      <ChartGrid palaces={palaces} activePalace={null} onPalaceClick={() => {}} />
    );
    const rendered = [...container.querySelectorAll('.pal-f .rt')].map((n) => n.textContent ?? '');
    for (const label of BRANCH_LABELS) {
      expect(rendered.some((t) => t.endsWith(label)), `${label} missing`).toBe(true);
    }
  });
});
