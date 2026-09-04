import type { ChartData } from '@/types';
import { type Locale } from '@/lib/i18n/locales';
import { VOCABULARY, term, type Domain } from '@/lib/i18n/vocabulary';
import { starsOrBorrowed } from '@/lib/chart-derived';

// ============================================================
// READING-QUALITY CHECKS — P6 Part A
// ============================================================
//
// Nothing before this tested what the model actually SAYS. `prompt.test.ts`
// tests the prompt; this tests the reading.
//
// All five checks are deterministic. The chart is ground truth, so the failures
// that matter most — an invented star, a palace never discussed, the wrong
// language — are catchable without a judge model, and a deterministic check
// cannot itself hallucinate. Every check works in all five locales by going
// through the P5 vocabulary table rather than matching Vietnamese.

export type CheckId = 'hallucination' | 'coverage' | 'language' | 'length' | 'structure';

export interface CheckResult {
  id: CheckId;
  pass: boolean;
  /** One line, always present, pass or fail. */
  summary: string;
  /** The exact offending strings. Empty on a pass. */
  offenders: string[];
  /**
   * Observations that are recorded but do NOT fail the check — things a human
   * may want to look at, where an automatic verdict would be unreliable.
   */
  notes?: string[];
}

// ── Star vocabulary ─────────────────────────────────────────────────────────

/**
 * The stars a reading makes substantive placement claims about, and whose names
 * are distinctive enough to match reliably in every script.
 *
 * SCOPE, and why it is narrow — this was set by measurement, not taste. The
 * first version of this check scanned every star ring, and on the baseline run
 * it produced ten findings across six CJK and Hangul cells, of which **ten were
 * false positives**. They failed in three ways, all caused by the lesser rings
 * having names that are ordinary words in a script with no word boundaries:
 *
 *   · used as a category, not a placement — 武曲為「將星」, 貪狼為「桃花星」
 *   · a homograph from another domain — 「함지」 is also the brightness 陷地,
 *     「식신」 is a Bazi Ten God, not the Zi Wei star
 *   · an ordinary word — 「태세」 also means "stance", 「지배」 means "dominate"
 *
 * A check that is wrong every time it fires teaches its reader to ignore it,
 * which is worse than not having it. The fourteen major and fourteen minor
 * stars carry the substantive claims and have distinctive names (紫微, 天機,
 * 左輔, 文昌), so they gate; the lesser rings are still scanned, but they are
 * recorded as notes for a human rather than as failures.
 *
 * When D1 lands and the citation blocks name the cung and sao behind each
 * judgement, the whole vocabulary can gate again — a citation is a placement
 * claim by construction, so none of the three failure modes above can occur.
 * `HallucinationOptions.regions` is the seam for exactly that.
 */
const GATING_STAR_DOMAINS: Domain[] = ['majorStar'];

/** Rings whose names collide with ordinary words; observed, never gated on. */
const ADVISORY_STAR_DOMAINS: Domain[] = [
  'adjectiveStar', 'changsheng', 'boshi', 'suiqian', 'jiangqian',
];

function starsIn(domains: Domain[], locale: Locale): string[] {
  const out = new Set<string>();
  for (const row of Object.values(VOCABULARY)) {
    if (!domains.includes(row[0])) continue;
    const name = term(row[1], locale, row[0]);
    if (name) out.add(name);
  }
  return [...out];
}

// ── Heading structure ───────────────────────────────────────────────────────
//
// Heading LEVEL is not part of the contract; the RELATIVE level is. Measured
// across the eval runs, the model writes the same reading four different ways:
// sections at `##` with palaces at `###`, everything shifted down one level,
// palaces numbered (`### 10. Property Palace`) or not, and sub-headings
// numbered `### 4.1`. All four are faithful to the template.
//
// So sections are found by SHAPE rather than by a fixed hash count: a numbered
// heading is `#…# <n>.` followed by a space, which excludes `4.1`, and the
// sections are those at the shallowest numbered level, which excludes a
// numbered palace nested under section 2. Anything deeper than that level
// inside section 2 is a palace heading.
//
// An earlier version fixed the level at `##`, and a run in which the model
// shifted every heading down one reported readings that were correct in every
// substantive way as having no sections at all. Widening the regex without the
// level rule was worse: it read `#### 4.1` as section 4 and
// `### 10. Property Palace` as section 10, inventing an out-of-order reading
// and a fabricated Bazi section that were not there.

const NUMBERED_HEADING = /^(#{1,6})[ \t]*(\d+)\.(?=[ \t]|$)/gm;

/** The heading level at which this reading numbers its sections. */
function sectionLevel(reading: string): number {
  const levels = [...reading.matchAll(NUMBERED_HEADING)].map((m) => m[1].length);
  return levels.length ? Math.min(...levels) : 2;
}

/** The numbered section headings, in the order written. */
function numberedSections(reading: string): { n: number; at: number }[] {
  const level = sectionLevel(reading);
  return [...reading.matchAll(NUMBERED_HEADING)]
    .filter((m) => m[1].length === level)
    .map((m) => ({ n: Number(m[2]), at: m.index }));
}

/** The fourteen chính tinh — the stars whose placement is verified. */
export function knownStars(locale: Locale): string[] {
  return starsIn(GATING_STAR_DOMAINS, locale);
}

/** The lesser star names, reported as notes only. */
export function advisoryStars(locale: Locale): string[] {
  return starsIn(ADVISORY_STAR_DOMAINS, locale);
}

/** Every star actually placed on this chart, in one locale. */
export function starsOnChart(chart: ChartData, locale: Locale): Set<string> {
  const out = new Set<string>();
  const add = (v: string | undefined, d: Domain) => {
    const t = term(v, locale, d);
    if (t) out.add(t);
  };
  for (const p of chart.palaces) {
    for (const s of p.majorStars) add(s.name, 'majorStar');
    for (const s of p.minorStars) add(s.name, 'minorStar');
    for (const s of p.adjectiveStars) add(s.name, 'adjectiveStar');
    add(p.changsheng12, 'changsheng');
    add(p.boshi12, 'boshi');
    add(p.suiqian12, 'suiqian');
    add(p.jiangqian12, 'jiangqian');
  }
  // The soul and body rulers are stars too, and are legitimately discussed.
  add(chart.soul, 'majorStar');
  add(chart.body, 'majorStar');
  return out;
}

/**
 * Word-boundary-aware search. CJK and Hangul have no word boundaries and `\b`
 * does not apply to them, so a plain index scan is correct there; for Latin
 * scripts a bare `includes` would match "Tian Fu" inside "Tian Fu Xing", so the
 * neighbours are checked instead.
 */
function occurrences(haystack: string, needle: string): number[] {
  if (!needle) return [];
  const latin = /^[\x20-\x7EÀ-ɏḀ-ỿ]+$/.test(needle);
  const hits: number[] = [];
  let from = 0;
  for (;;) {
    const i = haystack.indexOf(needle, from);
    if (i === -1) break;
    from = i + needle.length;
    if (latin) {
      const before = haystack[i - 1] ?? ' ';
      const after = haystack[i + needle.length] ?? ' ';
      const wordish = /[\p{L}\p{N}]/u;
      if (wordish.test(before) || wordish.test(after)) continue;
    }
    hits.push(i);
  }
  return hits;
}

function snippet(text: string, at: number, len: number): string {
  const from = Math.max(0, at - 45);
  const to = Math.min(text.length, at + len + 45);
  return (from > 0 ? '…' : '') + text.slice(from, to).replace(/\s+/g, ' ') + (to < text.length ? '…' : '');
}

// ── 1. Hallucination ────────────────────────────────────────────────────────

export interface HallucinationOptions {
  /**
   * The regions of the reading to check for MISPLACEMENT. Defaults to the
   * palace headings of section 2.
   *
   * This is the seam for D1: once the citation blocks carry the cung and sao
   * behind each judgement, they become additional regions and every claim in
   * the reading is verifiable, not just the ones in section 2's headings.
   */
  regions?: string[];
}

/**
 * Every star a reading places in a palace must actually be in that palace.
 *
 * WHAT THIS CHECKS, AND WHY IT IS NOT "is this star on the chart" — the obvious
 * formulation is useless here, and measuring it is how that was found. A
 * complete Tử Vi chart places **all fourteen major and all fourteen minor stars
 * somewhere**, so "named a star that is not on the chart" can never fire on a
 * real chart. The fabrication that actually harms a reader is different: the
 * star is real, the chart is real, and the reading puts it in the wrong palace.
 *
 * That is checkable, because the prompt mandates the shape of section 2:
 * `### <palace> — <its major stars>`. Each heading is parsed, matched to a
 * palace, and the major stars named in it are compared with the ones the chart
 * actually puts there. A vô chính diệu palace legitimately names the stars it
 * borrows from its đối cung, so those count as correct — the same rule the app
 * itself uses (`starsOrBorrowed`).
 *
 * Only EXTRA stars fail: a star named in a palace that does not hold it. A
 * star omitted from its own palace is understatement, not fabrication, and is
 * recorded as a note — readings routinely abbreviate ("Cơ Lương" for Thiên Cơ
 * and Thiên Lương), which would make omission-detection unreliable.
 */
export function checkHallucination(
  reading: string,
  chart: ChartData,
  locale: Locale,
  options: HallucinationOptions = {},
): CheckResult {
  const majors = starsIn(['majorStar'], locale).sort((a, b) => b.length - a.length);
  const palaceNames = chart.palaces
    .map((p) => ({ palace: p, name: term(p.name, locale, 'palace') }))
    .sort((a, b) => b.name.length - a.name.length);

  const headings = options.regions ?? palaceHeadings(reading);
  const offenders: string[] = [];
  const notes: string[] = [];
  let verified = 0;

  for (const heading of headings) {
    const hit = palaceNames.find((p) => occurrences(heading, p.name).length > 0);
    if (!hit) continue;
    verified += 1;

    const own = hit.palace.majorStars.map((st) => term(st.name, locale, 'majorStar'));
    const borrowed = own.length
      ? []
      : starsOrBorrowed(chart, hit.palace.earthlyBranch).stars
          .map((st) => term(st.name, locale, 'majorStar'));
    const allowed = new Set([...own, ...borrowed]);

    for (const star of majors) {
      if (allowed.has(star)) continue;
      if (occurrences(heading, star).length === 0) continue;
      offenders.push(
        `"${star}" placed in ${hit.name}, which holds `
        + `${own.length ? own.join(' · ') : `no major star (it borrows ${borrowed.join(' · ') || 'nothing'})`}`
        + ` — heading: ${heading.trim().slice(0, 120)}`,
      );
    }
    for (const star of own) {
      if (occurrences(heading, star).length === 0) {
        notes.push(`${hit.name}: "${star}" is in this palace but its heading does not name it (readings often abbreviate)`);
      }
    }
  }

  // Not being able to verify is not the same as passing.
  if (verified < 8) {
    offenders.push(
      `only ${verified} of 12 palace headings could be parsed from section 2 — `
      + `placement could not be verified, so this check cannot vouch for the reading`,
    );
  }

  // The lesser rings are observed but never gated on: in CJK and Hangul their
  // names collide with categories ("桃花星"), with other domains ("함지" is also
  // the brightness 陷地) and with ordinary words ("태세" also means stance).
  // Measured on the baseline: 10 such hits, 10 false positives.
  const present = starsOnChart(chart, locale);
  for (const star of starsIn(ADVISORY_STAR_DOMAINS, locale)) {
    if (present.has(star)) continue;
    const at = occurrences(reading, star)[0];
    if (at !== undefined) notes.push(`lesser star "${star}" named, not on this chart — ${snippet(reading, at, star.length)}`);
  }

  return {
    id: 'hallucination',
    pass: offenders.length === 0,
    summary: offenders.length === 0
      ? `every major star named in the ${verified} parsed palace headings is in that palace`
      : `${offenders.length} misplacement(s) across ${verified} parsed palace headings`,
    offenders,
    notes: notes.length ? notes : undefined,
  };
}

/**
 * The per-palace headings of section 2 — every heading BELOW the section level.
 */
export function palaceHeadings(reading: string): string[] {
  const secs = numberedSections(reading);
  const i = secs.findIndex((s) => s.n === 2);
  if (i === -1) return [];
  const body = reading.slice(secs[i].at, secs[i + 1]?.at);
  const deeper = new RegExp(`^#{${sectionLevel(reading) + 1},6}[ \\t]+(.+)$`, 'gm');
  return [...body.matchAll(deeper)].map((m) => m[1]);
}

// ── 2. Coverage ─────────────────────────────────────────────────────────────

/** All twelve palaces genuinely discussed, by their own localised names. */
export function checkCoverage(reading: string, chart: ChartData, locale: Locale): CheckResult {
  const missing: string[] = [];
  const names = chart.palaces.map((p) => term(p.name, locale, 'palace'));
  for (const name of names) {
    if (occurrences(reading, name).length === 0) missing.push(name);
  }
  return {
    id: 'coverage',
    pass: missing.length === 0,
    summary: missing.length === 0
      ? `all ${names.length} palaces named in the reading`
      : `${missing.length} of ${names.length} palaces never named`,
    offenders: missing.map((n) => `palace never named: "${n}"`),
  };
}

// ── 3. Language ─────────────────────────────────────────────────────────────

/** The P5 leakage regex — Vietnamese-only letters. */
export const VIETNAMESE =
  /[ăâđêôơưƯĂÂĐÊÔƠàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ]/;

/**
 * How each locale's reading is expected to read.
 *
 * `en` is the one that needs care. DESIGN.md §15.1 gives English no tradition
 * of its own, so its prompt deliberately asks for the transliterated original
 * beside the translation on first use — "The Life Palace (Mệnh / 命宮)". Both
 * Vietnamese and Han characters are therefore CORRECT in an English reading,
 * and an earlier version of this check called them leakage and failed a reading
 * that was doing exactly what it was told. What matters for `en` is that the
 * prose is English, which is a question of the dominant script, not of whether
 * another script appears at all.
 */
const SCRIPT_EXPECTATION: Record<Locale, {
  /** Characters the bulk of the prose must be written in. */
  dominant: RegExp;
  /** Vietnamese has no legitimate place in this locale's prose. */
  forbidsVietnamese: boolean;
}> = {
  vi: { dominant: /[A-Za-zÀ-ỹ]/, forbidsVietnamese: false },
  en: { dominant: /[A-Za-z]/, forbidsVietnamese: false },
  'zh-Hans': { dominant: /[一-鿿]/, forbidsVietnamese: true },
  'zh-Hant': { dominant: /[一-鿿]/, forbidsVietnamese: true },
  ko: { dominant: /[가-힯]/, forbidsVietnamese: true },
};

/** At least this share of the letters must be in the locale's own script. */
const DOMINANCE = 0.8;

/**
 * The reading is in the reader's language: written predominantly in the right
 * script, and — where the locale has no reason to carry it — free of
 * Vietnamese.
 *
 * The subject's own name is excluded; it is data the reader typed, not
 * something the model should translate.
 */
export function checkLanguage(
  reading: string,
  locale: Locale,
  subjectName = '',
  selfDescription = '',
): CheckResult {
  const offenders: string[] = [];
  // The reader's own words are not the model's prose and must not count
  // toward "is this written in the right language" — a Korean reading that
  // quotes a Vietnamese self-description is still a Korean reading.
  const readerOwn = `${subjectName}\n${selfDescription}`.toLowerCase();
  let body = reading;
  for (const own of [subjectName, ...selfDescription.split(/[.!?\n]+/)]) {
    const t = own.trim();
    if (t.length > 2) body = body.split(t).join(' ');
  }
  const { dominant, forbidsVietnamese } = SCRIPT_EXPECTATION[locale];

  const letters = [...body].filter((c) => /\p{L}/u.test(c));
  const own = letters.filter((c) => dominant.test(c)).length;
  const share = letters.length ? own / letters.length : 0;
  if (share < DOMINANCE) {
    offenders.push(
      `only ${(share * 100).toFixed(1)}% of the letters are in the ${locale} script `
      + `(needs ${DOMINANCE * 100}%) — the reading is not written in ${locale}`,
    );
  }

  if (forbidsVietnamese) {
    // Text the READER supplied is theirs, and quoting it back verbatim is
    // correct rather than leakage — their name, and the self-description they
    // typed. The model quotes FRAGMENTS of it ("ôm một mình"), not whole
    // sentences, so membership is tested per Vietnamese run rather than by
    // stripping sentences. Measured on the P7 step 2 run, where zh-Hant was
    // failed for returning a Chinese reader's own Vietnamese words.
    const isQuoted = (run: string) =>
      run.trim().length > 2 && readerOwn.includes(run.trim().toLowerCase());

    // Scanned on the RAW reading, because the model quotes fragments of the
    // reader's words rather than whole sentences, and each run is tested for
    // membership individually below.
    const lines = reading.split('\n');
    for (let i = 0; i < lines.length && offenders.length < 12; i++) {
      if (!VIETNAMESE.test(lines[i])) continue;
      // Maximal Latin runs, so each quoted phrase is tested as a whole.
      const runs = (lines[i].match(/[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9 ,'’-]*/g) ?? [])
        .filter((r) => VIETNAMESE.test(r));
      if (runs.length && runs.every(isQuoted)) continue;
      offenders.push(`line ${i + 1}: ${lines[i].trim().slice(0, 120)}`);
    }
  }

  return {
    id: 'language',
    pass: offenders.length === 0,
    summary: offenders.length === 0
      ? `written in ${locale} (${(share * 100).toFixed(1)}% of letters in its own script)`
      : `${offenders.length} language problem(s)`,
    offenders,
  };
}

// ── 4. Length ───────────────────────────────────────────────────────────────

/**
 * The target each locale's prompt actually demands — see `src/lib/prompt/`.
 * A Chinese or Korean character is not a Vietnamese word, which is why the
 * prompts ask for different units and so does this check.
 */
export const LENGTH_TARGET: Record<Locale, { unit: 'words' | 'chars'; min: number }> = {
  vi: { unit: 'words', min: 5000 },
  en: { unit: 'words', min: 5000 },
  'zh-Hans': { unit: 'chars', min: 8000 },
  'zh-Hant': { unit: 'chars', min: 8000 },
  ko: { unit: 'chars', min: 8000 },
};

export function measureLength(reading: string, locale: Locale): number {
  const body = reading.trim();
  return LENGTH_TARGET[locale].unit === 'words'
    ? body.split(/\s+/).filter(Boolean).length
    : body.replace(/\s+/g, '').length;
}

export function checkLength(reading: string, locale: Locale): CheckResult {
  const { unit, min } = LENGTH_TARGET[locale];
  const n = measureLength(reading, locale);
  return {
    id: 'length',
    pass: n >= min,
    summary: `${n.toLocaleString('en-US')} ${unit} (prompt demands ≥ ${min.toLocaleString('en-US')})`,
    offenders: n >= min ? [] : [`reading is ${(min - n).toLocaleString('en-US')} ${unit} short of the target its own prompt sets`],
  };
}

// ── 5. Structure ────────────────────────────────────────────────────────────

export interface StructureExpectation {
  /** Section 10 is written only when Bazi data was supplied. */
  bazi: boolean;
  /** Section 11 is written only when the reader described themselves. */
  selfDescription: boolean;
}

/**
 * The eleven sections, present and in order.
 *
 * Sections 10 and 11 are conditional by the prompt's own instruction — "if no
 * data → skip it entirely" — so their absence is only a failure when the input
 * actually carried Bazi or a self-description. Asserting them unconditionally
 * would fail a correct reading.
 */
export function checkStructure(reading: string, expect: StructureExpectation): CheckResult {
  const found = numberedSections(reading).map((s) => s.n);
  const offenders: string[] = [];

  const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (expect.bazi) required.push(10);
  if (expect.selfDescription) required.push(11);

  for (const n of required) {
    if (!found.includes(n)) offenders.push(`section ${n} missing`);
  }
  for (const n of found) {
    if (n === 10 && !expect.bazi) offenders.push('section 10 written but no Bazi data was supplied');
    if (n === 11 && !expect.selfDescription) offenders.push('section 11 written but no self-description was supplied');
  }

  const ordered = found.filter((n) => required.includes(n));
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i] <= ordered[i - 1]) {
      offenders.push(`sections out of order: ${ordered.join(', ')}`);
      break;
    }
  }

  return {
    id: 'structure',
    pass: offenders.length === 0,
    summary: offenders.length === 0
      ? `${required.length} required sections, present and in order (${found.join(', ')})`
      : `structure problems; found sections ${found.join(', ') || 'none'}`,
    offenders,
  };
}

// ── The suite ───────────────────────────────────────────────────────────────

export interface EvalInput {
  reading: string;
  chart: ChartData;
  locale: Locale;
  subjectName?: string;
  /** The reader's own words, which the model may quote back verbatim. */
  selfDescription?: string;
  expect: StructureExpectation;
}

export function runChecks(input: EvalInput): CheckResult[] {
  return [
    checkHallucination(input.reading, input.chart, input.locale),
    checkCoverage(input.reading, input.chart, input.locale),
    checkLanguage(input.reading, input.locale, input.subjectName, input.selfDescription),
    checkLength(input.reading, input.locale),
    checkStructure(input.reading, input.expect),
  ];
}
