import { encode } from '@toon-format/toon';
import type { ChartData } from '@/types';
import type { Locale } from '../i18n/locales';
import { term } from '../i18n/vocabulary';
import type { DataLabels } from './types';

// ============================================================
// TOON DATA CONTEXT — P6 Part B
// ============================================================
//
// The same chart data as `buildDataContext` in `../gemini.ts`, encoded as TOON
// (Token-Oriented Object Notation) with the reference implementation,
// `@toon-format/toon` — no format is hand-rolled here.
//
// Scope is deliberately narrow, per the phase brief: **the chart data context
// only**. Not the system instruction, which lives in the context cache and is
// not re-sent; not the reasoning-and-task layer; not the model's output.
//
// TOON's win is tabular arrays of uniform objects — it emits one header and
// then bare rows, instead of repeating every field name on every record. The
// twelve palaces are exactly that shape, which is what makes this worth
// measuring. Whether it is worth SHIPPING is a question for the numbers; see
// EVAL.md.
//
// Keys are localised, like the values: a Korean reader's model should not be
// reading Vietnamese field names any more than Vietnamese star names.

/** The keys of the palace table, in the reader's language. */
function palaceKeys(L: DataLabels) {
  return {
    palace: L.twelvePalaces,
    canChi: L.canChiOf,
    changsheng: L.changsheng,
    decadal: L.decadal,
    major: L.majorStars,
    minor: L.minorStars,
    adjective: L.adjectiveStars,
    body: L.bodyPalaceMark,
  };
}

export function buildToonDataContext(
  chart: ChartData,
  locale: Locale,
  L: DataLabels,
  name?: string,
  selfDescription?: string,
): string {
  const v = (value: string | undefined | null, domain?: Parameters<typeof term>[2]) =>
    term(value, locale, domain);

  const star = (s: { name: string; brightness?: string; mutagen?: string }, d: Parameters<typeof term>[2]) => {
    let out = v(s.name, d);
    if (s.brightness) out += `(${v(s.brightness, 'brightness')})`;
    if (s.mutagen) out += `[${v(s.mutagen, 'mutagen')}]`;
    return out;
  };

  const mutagenList = (items: string[]) =>
    items.map((m) => m.split(' ').map((part, i) => v(part, i === 0 ? 'mutagen' : undefined)).join(' '))
      .join(' · ') || L.none;

  const K = palaceKeys(L);

  // Uniform records — this is the array TOON encodes as a table.
  const palaces = chart.palaces.map((p) => ({
    [K.palace]: v(p.name, 'palace'),
    [K.canChi]: `${v(p.heavenlyStem, 'stem')}${v(p.earthlyBranch, 'branch')}`,
    [K.changsheng]: v(p.changsheng12, 'changsheng'),
    [K.decadal]: p.decadalRange,
    [K.major]: p.majorStars.length ? p.majorStars.map((s) => star(s, 'majorStar')).join(' · ') : L.empty,
    [K.minor]: p.minorStars.length ? p.minorStars.map((s) => star(s, 'minorStar')).join(' · ') : L.none,
    [K.adjective]: p.adjectiveStars.length ? p.adjectiveStars.map((s) => v(s.name, 'adjectiveStar')).join(' · ') : L.none,
    [K.body]: p.isBodyPalace ? 1 : 0,
  }));

  const horoscope = chart.horoscope ? [
    { scope: L.decadalRow, palace: v(chart.horoscope.decadal.name, 'palace'),
      canChi: `${v(chart.horoscope.decadal.heavenlyStem, 'stem')}${v(chart.horoscope.decadal.earthlyBranch, 'branch')}`,
      mutagen: mutagenList(chart.horoscope.decadal.mutagen) },
    { scope: L.yearlyRow, palace: v(chart.horoscope.yearly.name, 'palace'),
      canChi: `${v(chart.horoscope.yearly.heavenlyStem, 'stem')}${v(chart.horoscope.yearly.earthlyBranch, 'branch')}`,
      mutagen: mutagenList(chart.horoscope.yearly.mutagen) },
    { scope: L.monthlyRow, palace: v(chart.horoscope.monthly.name, 'palace'),
      canChi: `${v(chart.horoscope.monthly.heavenlyStem, 'stem')}${v(chart.horoscope.monthly.earthlyBranch, 'branch')}`,
      mutagen: mutagenList(chart.horoscope.monthly.mutagen) },
  ] : undefined;

  let bazi: Record<string, unknown> | undefined;
  if (chart.bazi) {
    const b = chart.bazi;
    const toEl = (e: string) => L.elements[e as keyof typeof L.elements] || e;
    bazi = {
      [L.baziPillars]: b.pillarsString,
      [L.baziDayMaster]: `${b.dayMaster.stem} — ${toEl(b.dayMaster.element)} (${b.dayMaster.nature})`,
      [L.baziStrength]: `${b.dayMasterStrength.strength} (${b.dayMasterStrength.score})`,
      [L.baziFiveElements]: Object.entries(b.fiveElements)
        .sort(([, x], [, y]) => y - x).map(([el, n]) => `${toEl(el)}: ${n}`).join(' · '),
      [L.baziFavorable]: b.favorableElements.map(toEl).join(', ') || L.baziUndetermined,
      [L.baziUnfavorable]: b.unfavorableElements.map(toEl).join(', ') || L.baziUndetermined,
      [L.baziNobleman]: b.nobleman.join(', ') || L.none,
      [L.baziPeachBlossom]: b.peachBlossom || L.none,
      [L.baziSkyHorse]: b.skyHorse || L.none,
      [L.baziIntelligence]: b.intelligence || L.none,
      pillars: [
        { pillar: L.baziYear, ...pillar(b.yearPillar, toEl, L) },
        { pillar: L.baziMonth, ...pillar(b.monthPillar, toEl, L) },
        { pillar: L.baziDay, ...pillar(b.dayPillar, toEl, L) },
        { pillar: L.baziHour, ...pillar(b.hourPillar, toEl, L) },
      ],
      [L.baziInteractions]: b.interactions.length
        ? b.interactions.map((i) => `${i.type}: ${i.participants.join(' ↔ ')}${i.result ? ` → ${toEl(i.result)}` : ''}`)
        : [L.none],
      [L.baziLuck]: b.luckPillars.length
        ? `${b.luckDirection === 1 ? L.baziForward : L.baziBackward}, ${L.baziStartAt} ${b.luckStartAge ?? '?'}: `
          + b.luckPillars.map((lp) => `${lp.startAge}:${lp.chinese}(${toEl(lp.element)})`).join(' → ')
        : L.none,
    };
  }

  const now = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const doc: Record<string, unknown> = {
    [L.now]: `${now} ${L.timezoneNote}`,
    [L.basics]: {
      [L.name]: name || L.notGiven,
      [L.gender]: v(chart.gender, 'gender'),
      [L.solar]: chart.solarDate,
      [L.lunar]: chart.lunarDate,
      [L.canChi]: chart.chineseDate.split(/(\s+|·)/).map((part) => v(part)).join(''),
      [L.birthHour]: `${v(chart.time, 'branch')} (${chart.timeRange})`,
      [L.sign]: v(chart.sign, 'sign'),
      [L.zodiac]: v(chart.zodiac, 'zodiac'),
      [L.fiveElements]: v(chart.fiveElementsClass, 'fiveElements'),
      [L.soul]: v(chart.soul),
      [L.body]: v(chart.body),
      [L.soulPalaceAt]: v(chart.earthlyBranchOfSoulPalace, 'branch'),
      [L.bodyPalaceAt]: v(chart.earthlyBranchOfBodyPalace, 'branch'),
    },
    palaces,
  };
  if (bazi) doc[L.baziHead] = bazi;
  if (horoscope) doc[L.horoscopeHead] = horoscope;
  if (selfDescription?.trim()) doc[L.selfHead] = selfDescription.trim();

  return encode(doc);
}

function pillar(
  p: { chinese: string; element: string; animal: string; branchElement: string },
  toEl: (e: string) => string,
  L: DataLabels,
) {
  return {
    [L.canChi]: p.chinese,
    element: toEl(p.element),
    animal: p.animal,
    [L.baziBranch]: toEl(p.branchElement),
  };
}
