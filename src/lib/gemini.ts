import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ChartData } from '@/types';
import { getCachedContentName } from './gemini-cache';
import { DEFAULT_LOCALE, INTL_LOCALE, type Locale } from './i18n/locales';
import { term } from './i18n/vocabulary';
import { getPrompt, renderTask } from './prompt';
import type { DataLabels } from './prompt/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/** Kept as a named export: `gemini-cache.ts` seeds the `vi` cache from it. */
export const SYSTEM_INSTRUCTION = getPrompt(DEFAULT_LOCALE).system;

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — DATA CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
//
// The chart is generated once, in `vi-VN` (see `src/lib/iztro.ts`), so the
// values arriving here are Vietnamese. Every domain value is put through
// `term()` on the way into the prompt, which is what makes a Korean reading
// reason over 명궁 and 자미 rather than over Mệnh and Tử Vi — DESIGN.md §15.5.
// Dates, ranges and numbers are locale-independent and pass through untouched.

function buildDataContext(
  chart: ChartData,
  locale: Locale,
  L: DataLabels,
  name?: string,
  selfDescription?: string,
): string {
  const v = (value: string | undefined | null, domain?: Parameters<typeof term>[2]) =>
    term(value, locale, domain);

  const palacesSummary = chart.palaces
    .map((p) => {
      const majors = p.majorStars.length > 0
        ? p.majorStars.map((s) => {
            let str = v(s.name, 'majorStar');
            if (s.brightness) str += `(${v(s.brightness, 'brightness')})`;
            if (s.mutagen) str += `[${v(s.mutagen, 'mutagen')}]`;
            return str;
          }).join(' · ')
        : L.empty;
      const minors = p.minorStars.length > 0
        ? p.minorStars.map((s) => {
            let str = v(s.name, 'minorStar');
            if (s.mutagen) str += `[${v(s.mutagen, 'mutagen')}]`;
            return str;
          }).join(' · ')
        : '';
      const adjectives = p.adjectiveStars.length > 0
        ? p.adjectiveStars.map((s) => v(s.name, 'adjectiveStar')).join(' · ')
        : '';

      return `▸ ${v(p.name, 'palace')}${p.isBodyPalace ? ` ${L.bodyPalaceMark}` : ''}
  ${L.canChiOf}: ${v(p.heavenlyStem, 'stem')}${v(p.earthlyBranch, 'branch')}  |  ${L.changsheng}: ${v(p.changsheng12, 'changsheng')}  |  ${L.decadal}: ${p.decadalRange}
  ${L.majorStars}: ${majors}
  ${L.minorStars}: ${minors || L.none}
  ${L.adjectiveStars}: ${adjectives || L.none}`;
    })
    .join('\n\n');

  // A tứ hóa entry is "<transformation> <star>" — both are vocabulary.
  const mutagenList = (items: string[]) =>
    // Split on the FIRST space only: an entry is "<tứ hóa> <star>" and a star
    // name is usually two words ("Thiên Đồng"). Splitting on every space looked
    // each word up alone, so no multi-word star ever matched and the Chinese
    // and Korean data contexts carried Vietnamese — which the model then
    // faithfully quoted back. Found by the eval, EVAL.md §4.
    items.map((m) => {
      const at = m.indexOf(' ');
      if (at === -1) return v(m, 'mutagen');
      return `${v(m.slice(0, at), 'mutagen')} ${v(m.slice(at + 1))}`;
    })
      .join(' · ') || L.none;

  let horoscopeSection = '';
  if (chart.horoscope) {
    const { decadal, yearly, monthly } = chart.horoscope;
    horoscopeSection = `
━━━ ${L.horoscopeHead} ━━━
▸ ${L.decadalRow}:  ${v(decadal.name, 'palace')}  |  ${v(decadal.heavenlyStem, 'stem')}${v(decadal.earthlyBranch, 'branch')}  |  ${L.mutagen}: ${mutagenList(decadal.mutagen)}
▸ ${L.yearlyRow}:  ${v(yearly.name, 'palace')}  |  ${v(yearly.heavenlyStem, 'stem')}${v(yearly.earthlyBranch, 'branch')}  |  ${L.mutagen}: ${mutagenList(yearly.mutagen)}
▸ ${L.monthlyRow}: ${v(monthly.name, 'palace')}  |  ${v(monthly.heavenlyStem, 'stem')}${v(monthly.earthlyBranch, 'branch')}  |  ${L.mutagen}: ${mutagenList(monthly.mutagen)}`;
  }

  // Inject real current time so the model knows the exact year. The clock is
  // Vietnam's in every locale — the chart was cast against it.
  const now = new Date();
  const currentDateTime = now.toLocaleString(INTL_LOCALE[locale], {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  // Bazi (Four Pillars) section. When it is absent the absence is STATED:
  // an empty space in the data context is what the model filled in with an
  // invented Four Pillars reading (EVAL.md §3.2).
  let baziSection = `\n━━━ ${L.baziAbsent} ━━━`;
  if (chart.bazi) {
    const b = chart.bazi;
    const toEl = (e: string) => L.elements[e as keyof typeof L.elements] || e;

    const fiveStr = Object.entries(b.fiveElements)
      .sort(([, a], [, c]) => c - a)
      .map(([el, score]) => `${toEl(el)}: ${score}`)
      .join(' · ');

    const interStr = b.interactions.length > 0
      ? b.interactions.map((i) => `${i.type}: ${i.participants.join(' ↔ ')}${i.result ? ` → ${toEl(i.result)}` : ''}`).join('\n  ')
      : L.none;

    const luckStr = b.luckPillars.length > 0
      ? b.luckPillars.map((lp) => `${lp.startAge}: ${lp.chinese}(${toEl(lp.element)})`).join(' → ')
      : L.none;

    baziSection = `
━━━ ${L.baziHead} ━━━
▸ ${L.baziPillars}: ${b.pillarsString}
▸ ${L.baziYear}:  ${b.yearPillar.chinese} | ${toEl(b.yearPillar.element)} | ${b.yearPillar.animal} | ${L.baziBranch}: ${toEl(b.yearPillar.branchElement)}
▸ ${L.baziMonth}: ${b.monthPillar.chinese} | ${toEl(b.monthPillar.element)} | ${b.monthPillar.animal} | ${L.baziBranch}: ${toEl(b.monthPillar.branchElement)}
▸ ${L.baziDay}:   ${b.dayPillar.chinese} | ${toEl(b.dayPillar.element)} | ${b.dayPillar.animal} | ${L.baziBranch}: ${toEl(b.dayPillar.branchElement)}  ${L.baziDayMasterMark}
▸ ${L.baziHour}:  ${b.hourPillar.chinese} | ${toEl(b.hourPillar.element)} | ${b.hourPillar.animal} | ${L.baziBranch}: ${toEl(b.hourPillar.branchElement)}
▸ ${L.baziDayMaster}: ${b.dayMaster.stem} — ${toEl(b.dayMaster.element)} (${b.dayMaster.nature})
▸ ${L.baziStrength}: ${b.dayMasterStrength.strength} (${L.baziScore}: ${b.dayMasterStrength.score})
▸ ${L.baziFiveElements}: ${fiveStr}
▸ ${L.baziFavorable}: ${b.favorableElements.map(toEl).join(', ') || L.baziUndetermined}
▸ ${L.baziUnfavorable}: ${b.unfavorableElements.map(toEl).join(', ') || L.baziUndetermined}
▸ ${L.baziNobleman}: ${b.nobleman.join(', ') || L.none}
▸ ${L.baziPeachBlossom}: ${b.peachBlossom || L.none}
▸ ${L.baziSkyHorse}: ${b.skyHorse || L.none}
▸ ${L.baziIntelligence}: ${b.intelligence || L.none}
▸ ${L.baziInteractions}:
  ${interStr}
▸ ${L.baziLuck} (${b.luckDirection === 1 ? L.baziForward : L.baziBackward}, ${L.baziStartAt} ${b.luckStartAge ?? '?'}):
  ${luckStr}`;
  }

  // Self-description section
  let selfSection = '';
  if (selfDescription?.trim()) {
    selfSection = `
━━━ ${L.selfHead} ━━━
${selfDescription.trim()}`;
  }

  return `━━━ ${L.now} ━━━
${currentDateTime} ${L.timezoneNote}

━━━ ${L.basics} ━━━
${L.name}: ${name || L.notGiven}  |  ${L.gender}: ${v(chart.gender, 'gender')}
${L.solar}: ${chart.solarDate}  |  ${L.lunar}: ${chart.lunarDate}
${L.canChi}: ${chart.chineseDate.split(/(\s+|·)/).map((part) => v(part)).join('')}  |  ${L.birthHour}: ${v(chart.time, 'branch')} (${chart.timeRange})
${L.sign}: ${v(chart.sign, 'sign')}  |  ${L.zodiac}: ${v(chart.zodiac, 'zodiac')}
${L.fiveElements}: ${v(chart.fiveElementsClass, 'fiveElements')}
${L.soul}: ${v(chart.soul)}  |  ${L.body}: ${v(chart.body)}
${L.soulPalaceAt}: ${v(chart.earthlyBranchOfSoulPalace, 'branch')}  |  ${L.bodyPalaceAt}: ${v(chart.earthlyBranchOfBodyPalace, 'branch')}
${baziSection}
━━━ ${L.twelvePalaces} ━━━
${palacesSummary}
${horoscopeSection}
${selfSection}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete per-request prompt: the chart's data context followed by the
 * locale's reasoning-and-task layer. The system instruction is NOT here — it
 * lives in the context cache and is not re-sent.
 *
 * Exported so the eval harness can count its tokens without duplicating how it
 * is assembled; measuring a reconstruction rather than the real thing is how a
 * token measurement quietly becomes fiction.
 */
export function buildAnalysisPrompt(
  chart: ChartData,
  locale: Locale = DEFAULT_LOCALE,
  name?: string,
  selfDescription?: string,
): string {
  const pack = getPrompt(locale);
  const context = buildDataContext(chart, locale, pack.labels, name, selfDescription);
  // Sections 10 and 11 are removed from the template outright when their data
  // is absent, rather than left present with an instruction to skip them —
  // EVAL.md §3.2 measured four of five locales ignoring that instruction.
  const task = renderTask(pack.task, {
    bazi: !!chart.bazi,
    selfDescription: !!selfDescription?.trim(),
  });
  return `${context}\n${task}`;
}

export async function analyzeChart(
  chart: ChartData,
  locale: Locale = DEFAULT_LOCALE,
  name?: string,
  selfDescription?: string,
): Promise<string> {
  const pack = getPrompt(locale);
  const prompt = buildAnalysisPrompt(chart, locale, name, selfDescription);

  // The PDF knowledge base plus this locale's system instruction. One cache per
  // locale, all of them pointing at the same uploaded PDF — PLAN.md §13b.4.
  const cacheName = await getCachedContentName(locale);
  if (cacheName) {
    console.log('[Gemini] Using cached content:', locale, cacheName);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      // When cache is available, systemInstruction is bundled in cache
      // When cache is unavailable, pass systemInstruction directly as fallback
      ...(cacheName
        ? { cachedContent: cacheName }
        : { systemInstruction: pack.system }),
      temperature: 0.75,
      topP: 0.95,
      topK: 50,
      maxOutputTokens: 65536,
      candidateCount: 1,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  return response.text ?? '';
}
