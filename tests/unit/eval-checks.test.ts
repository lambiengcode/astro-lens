import { describe, expect, it } from 'vitest';
import {
  checkHallucination, checkCoverage, checkLanguage, checkLength, checkStructure,
  knownStars, advisoryStars, starsOnChart, measureLength, LENGTH_TARGET,
  citationLines,
} from '../eval/checks';
import { FIXTURE_RESULT } from '@/lib/fixture';
import { term } from '@/lib/i18n/vocabulary';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { starsOrBorrowed } from '@/lib/chart-derived';
import { BRANCH_LOOKUP, buildBranchMap, tamHopGroup, xung } from '@/lib/branches';

// ============================================================
// The checkers are the measuring instrument, so they are tested
// against synthetic readings. P6 Part A is explicit about this:
// do not burn API quota proving a checker works — hand it a fake
// reading with an invented star and assert it catches it.
// ============================================================

const CHART = FIXTURE_RESULT.chart;

describe('check 1 — hallucination (placement)', () => {
  // Section 2 of the reading, in the shape the prompt mandates:
  // `### <palace> — <its major stars>`.
  function section2(headings: string[], level = 2): string {
    const h = '#'.repeat(level);
    return `${h} 1. Mở đầu\n\n${h} 2. PHÂN TÍCH 12 CUNG\n\n`
      + headings.map((x) => `${h}# ${x}\n\nnội dung\n`).join('\n')
      + `\n${h} 3. Ngũ hành\n`;
  }

  /** Every palace heading, correct, in one locale. */
  function correctHeadings(locale: Locale): string[] {
    return CHART.palaces.map((p) => {
      const own = p.majorStars.map((s) => term(s.name, locale, 'majorStar'));
      const stars = own.length
        ? own.join(' · ')
        : starsOrBorrowed(CHART, p.earthlyBranch).stars
            .map((s) => term(s.name, locale, 'majorStar')).join(' · ');
      return `${term(p.name, locale, 'palace')} — ${stars}`;
    });
  }

  for (const locale of LOCALES) {
    it(`${locale}: passes a reading that places every star correctly`, () => {
      const r = checkHallucination(section2(correctHeadings(locale)), CHART, locale);
      expect(r.pass, r.offenders.join('; ')).toBe(true);
    });

    it(`${locale}: catches a star moved into the wrong palace`, () => {
      // Tử Vi is in Tài Bạch on this chart. Put it in Mệnh instead.
      const menh = term('Mệnh', locale, 'palace');
      const tuVi = term('Tử Vi', locale, 'majorStar');
      const headings = correctHeadings(locale).map((h) =>
        h.startsWith(menh + ' ') ? `${menh} — ${tuVi}` : h);
      const r = checkHallucination(section2(headings), CHART, locale);
      expect(r.pass, `should have caught ${tuVi} in ${menh}`).toBe(false);
      expect(r.offenders.join(' ')).toContain(tuVi);
    });
  }

  it('accepts the stars a vô chính diệu palace borrows from its đối cung', () => {
    // Phu Thê is empty on this chart and legitimately names Vũ Khúc / Tham Lang.
    const r = checkHallucination(section2(correctHeadings('vi')), CHART, 'vi');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
    const phuThe = correctHeadings('vi').find((h) => h.startsWith('Phu Thê'))!;
    expect(phuThe).toContain('Vũ Khúc');
  });

  it('parses palace headings at whichever level the reading used', () => {
    const r = checkHallucination(section2(correctHeadings('vi'), 3), CHART, 'vi');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not stop at a palace that happens to be numbered 3', () => {
    // Slicing section 2 at the first `3.` heading ended it after two palaces.
    const numbered = correctHeadings('vi').map((h, i) => `${i + 1}. ${h}`);
    const r = checkHallucination(section2(numbered), CHART, 'vi');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('refuses to vouch for a reading whose section 2 it cannot parse', () => {
    // Silence is not a pass: an unparseable reading is an unverified one.
    const r = checkHallucination('## 2. Phân tích\n\nprose with no headings\n\n## 3. X', CHART, 'vi');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('could not be verified');
  });

  it('records a lesser star as a NOTE, never as a failure', () => {
    // Measured on the baseline: every lesser-ring hit was a false positive — a
    // category ("桃花星"), a homograph, or an ordinary word.
    const lesser = advisoryStars('zh-Hant').find((s) => !starsOnChart(CHART, 'zh-Hant').has(s))!;
    const reading = section2(correctHeadings('zh-Hant')) + `\n武曲為${lesser}，力量極強。`;
    const r = checkHallucination(reading, CHART, 'zh-Hant');
    expect(r.pass, 'a lesser star must not fail the check').toBe(true);
    expect(r.notes?.join(' ')).toContain(lesser);
  });

  it('accepts a region list, which is the seam D1 uses', () => {
    const citation = 'Căn cứ: Mệnh · Dậu · Tử Vi.'; // Tử Vi is NOT in Mệnh
    const r = checkHallucination('irrelevant prose', CHART, 'vi', { regions: [citation] });
    expect(r.offenders.join(' ')).toContain('Tử Vi');
  });

  // ── D1 — the citation lines are checked by the same rule as the headings ──
  //
  // Firstmate set the bar: "a citation naming a star that is not in that
  // palace is worse than no citation at all." So a wrong citation must FAIL,
  // not be recorded as a note.

  it('fails a citation that names a star which is not in the palace it cites', () => {
    const mệnh = CHART.palaces.find((p) => p.name === 'Mệnh')!;
    const intruder = knownStars('vi')
      .find((s) => !mệnh.majorStars.some((m) => term(m.name, 'vi', 'majorStar') === s))!;
    const reading = section2(correctHeadings('vi'))
      + `\n## 4. Tình duyên\n\nnhận định\n\n> Cung Mệnh · ${intruder} (Miếu) — sai\n`;
    const r = checkHallucination(reading, CHART, 'vi');
    expect(r.pass, 'a wrong citation must fail, not be a note').toBe(false);
    expect(r.offenders.join(' ')).toContain(intruder);
    expect(r.offenders.join(' '), 'the message says it was a citation').toContain('citation:');
  });

  it('passes a citation that names the palace right', () => {
    const mệnh = CHART.palaces.find((p) => p.name === 'Mệnh')!;
    const own = mệnh.majorStars.map((m) => term(m.name, 'vi', 'majorStar')).join(' · ');
    const reading = section2(correctHeadings('vi'))
      + `\n## 4. Tình duyên\n\nnhận định\n\n> Cung Mệnh · ${own} — đúng\n`;
    expect(checkHallucination(reading, CHART, 'vi').pass).toBe(true);
  });

  it('accepts a citation to an empty palace that names its borrowed stars', () => {
    const empty = CHART.palaces.find((p) => p.majorStars.length === 0)!;
    const borrowed = starsOrBorrowed(CHART, empty.earthlyBranch).stars
      .map((s) => term(s.name, 'vi', 'majorStar')).join(' · ');
    const reading = section2(correctHeadings('vi'))
      + `\n## 4. Tình duyên\n\nx\n\n> ${term(empty.name, 'vi', 'palace')} · chiếu từ ${borrowed}\n`;
    expect(checkHallucination(reading, CHART, 'vi').pass).toBe(true);
  });

  it('does not treat a citation as a parsed palace heading', () => {
    // Citations must not inflate the "12 headings parsed" gate — otherwise a
    // reading with no section 2 at all could buy its way past it.
    const cites = CHART.palaces
      .map((p) => `> ${term(p.name, 'vi', 'palace')} · x`).join('\n');
    const r = checkHallucination(`## 2. Phân tích\n\nprose\n\n${cites}\n\n## 3. X`, CHART, 'vi');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('could not be verified');
  });

  it("accepts the reference mockup's own two-palace citation", () => {
    // Verbatim from tests/parity/reference/mockup.html and src/lib/fixture.ts.
    // Mệnh holds Liêm Trinh + Phá Quân; Thiên Di holds Thiên Tướng. Judging
    // every star against the FIRST palace named would report this — the
    // design's own worked example — as a fabrication.
    const real = '> Căn cứ: Mệnh · Dậu · Liêm Trinh (Lộc) + Phá Quân (Quyền)'
      + ' · xung chiếu Thiên Di (Mão) Thiên Tướng hãm.';
    const r = checkHallucination(section2(correctHeadings('vi')) + '\n## 4. X\n\n' + real + '\n', CHART, 'vi');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('still catches a star attributed to the palace it does NOT follow', () => {
    // Same two palaces, stars swapped: segmentation must not become a way to
    // launder a wrong placement past the check.
    //
    // No influence marker here, deliberately. With "xung chiếu" in the line the
    // đối cung's stars are admitted on purpose (see the tam phương tứ chính
    // test below), and this swap would then be legitimate rather than wrong.
    const swapped = '> Căn cứ: Mệnh · Dậu · Thiên Tướng (hãm) · Thiên Di (Mão) Liêm Trinh.';
    const r = checkHallucination(section2(correctHeadings('vi')) + '\n## 4. X\n\n' + swapped + '\n', CHART, 'vi');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('Thiên Tướng');
    expect(r.offenders.join(' ')).toContain('Liêm Trinh');
  });

  it('does not read the name of the discipline as a star placement', () => {
    // Measured on the D1 run: 자미두수 CONTAINS 자미, and 紫微斗数 contains 紫微.
    // Four citations were reported as placing Tử Vi in a palace when the
    // reading had only named the system it was practising.
    const spouse = CHART.palaces.find((p) => p.name === 'Phu Thê')!;
    const cite = `> ${term(spouse.name, 'ko', 'palace')}궁 · 좌보 — 자미두수에서 이는 중요한 암시입니다.`;
    const r = checkHallucination(section2(correctHeadings('ko')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'ko');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('judges a citation on its evidence, not on the prose after the em-dash', () => {
    // The claim clause names stars again in passing. Judging it placed them in
    // whichever palace the evidence head mentioned last — 2 of 2 Chinese
    // misplacements on the D1 run were exactly this.
    const cite = '> 迁移宫 · 天相(陷) · 冲照 命宫 · 廉贞(平) —— 天相落陷于外，主在外受制于环境。';
    const r = checkHallucination(section2(correctHeadings('zh-Hans')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hans');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('still judges the evidence head when the claim clause is present', () => {
    // Trimming the tail must not become a way to hide a wrong placement.
    const cite = '> 命宫 · 天相(陷) —— 一段说明文字。';
    const r = checkHallucination(section2(correctHeadings('zh-Hans')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hans');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('天相');
  });

  it('anchors a đại vận citation on the branch, not on the natal palace', () => {
    // "大限官祿宮 (寅)" is not the natal 官祿宮 — the overlay relabels the twelve
    // palaces onto other branches. Four correct citations were reported as
    // fabrications on the D1 run for this reason.
    const nôBộc = CHART.palaces.find((p) => p.name === 'Nô Bộc')!;
    const stars = nôBộc.majorStars.map((st) => term(st.name, 'zh-Hant', 'majorStar')).join(' ');
    const branch = term(nôBộc.earthlyBranch, 'zh-Hant', 'branch');
    const cite = `> 大限官祿宮 (${branch}) · ${stars} —— 現行大限事業運極旺。`;
    const r = checkHallucination(section2(correctHeadings('zh-Hant')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hant');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('declines to vouch for an overlay citation that names no branch', () => {
    // Unverifiable is not the same as wrong. It must not fail, and it must not
    // silently count as a verified citation either.
    const cite = '> 大限官祿宮 · 天相(陷) —— 說明。';
    const r = checkHallucination(section2(correctHeadings('zh-Hant')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hant');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('still catches a wrong star in a đại vận citation that gives its branch', () => {
    const mệnh = CHART.palaces.find((p) => p.name === 'Mệnh')!;
    const branch = term(mệnh.earthlyBranch, 'zh-Hant', 'branch');
    const wrong = term('Thiên Tướng', 'zh-Hant', 'majorStar'); // not in Mệnh
    const cite = `> 大限命宮 (${branch}) · ${wrong} —— 說明。`;
    const r = checkHallucination(section2(correctHeadings('zh-Hant')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hant');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain(wrong);
  });

  it('allows a star that the citation says SHINES IN from tam phương tứ chính', () => {
    // "照會" is the frame the prompt asks the reading to work in, not a claim
    // that the star sits there.
    const empty = CHART.palaces.find((p) => p.majorStars.length === 0)!;
    const trine = starsOrBorrowed(CHART, empty.earthlyBranch).stars
      .map((st) => term(st.name, 'zh-Hant', 'majorStar')).join(' ');
    const cite = `> ${term(empty.name, 'zh-Hant', 'palace')} · ${trine} 照會 —— 說明。`;
    const r = checkHallucination(section2(correctHeadings('zh-Hant')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'zh-Hant');
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not let an influence marker excuse a star outside the frame', () => {
    // The allowance opens the đối cung and the two tam hợp corners. A star from
    // anywhere else must still fail, or the marker becomes a blanket pardon.
    const mệnh = CHART.palaces.find((p) => p.name === 'Mệnh')!;
    const at = BRANCH_LOOKUP[mệnh.earthlyBranch.trim()];
    const inFrame = new Set([xung(at), ...tamHopGroup(at)]);
    const byBranch = buildBranchMap(CHART.palaces);
    const outside = [...byBranch.entries()]
      .filter(([b]) => !inFrame.has(b))
      .flatMap(([, p]) => p.majorStars.map((st) => term(st.name, 'vi', 'majorStar')))
      .find((name) => !mệnh.majorStars.some((m) => term(m.name, 'vi', 'majorStar') === name))!;
    const cite = `> Cung Mệnh · ${outside} chiếu — giải thích.`;
    const r = checkHallucination(section2(correctHeadings('vi')) + '\n## 4. X\n\n' + cite + '\n', CHART, 'vi');
    expect(r.pass, `${outside} is outside tam phương tứ chính of Mệnh`).toBe(false);
  });

  it('reads citation lines out of a reading', () => {
    expect(citationLines('a\n> một\nb\n>\n>  hai  \n')).toEqual(['một', 'hai']);
  });

  it('counts the chart it was given, not a remembered one', () => {
    const on = starsOnChart(CHART, 'vi');
    expect(on.has('Tử Vi')).toBe(true);
    expect(on.has('Thất Sát')).toBe(true);
    expect(on.size).toBeGreaterThan(20);
  });

  it('knows that a complete chart places all fourteen chính tinh', () => {
    // This is why the check verifies PLACEMENT rather than presence: on a real
    // chart there is no such thing as a major star that is absent.
    const on = starsOnChart(CHART, 'vi');
    expect(knownStars('vi')).toHaveLength(14);
    expect(knownStars('vi').filter((s) => !on.has(s))).toEqual([]);
  });
});

describe('check 2 — coverage', () => {
  for (const locale of LOCALES) {
    it(`${locale}: fails when a palace is never named`, () => {
      const names = CHART.palaces.map((p) => term(p.name, locale, 'palace'));
      const reading = names.slice(0, -1).join(' — ');
      const r = checkCoverage(reading, CHART, locale);
      expect(r.pass).toBe(false);
      expect(r.offenders.join(' ')).toContain(names[names.length - 1]);
    });

    it(`${locale}: passes when every palace is named`, () => {
      const reading = CHART.palaces.map((p) => term(p.name, locale, 'palace')).join(' · ');
      expect(checkCoverage(reading, CHART, locale).pass).toBe(true);
    });
  }
});

describe('check 3 — language', () => {
  it('vi: accepts Vietnamese', () => {
    expect(checkLanguage('Mệnh cung có Tử Vi, đại vận thuận lợi.', 'vi').pass).toBe(true);
  });

  it('ko: catches Vietnamese leaking into a Korean reading', () => {
    const r = checkLanguage('명궁에 자미가 있습니다. Mệnh cung có Tử Vi.', 'ko');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('Mệnh');
  });

  it('ko: catches a reading that is not Korean at all', () => {
    const r = checkLanguage('This reading is entirely in English.', 'ko');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('not written in ko');
  });

  it('zh-Hant: accepts Traditional Chinese', () => {
    expect(checkLanguage('命宮有紫微，大限順遂，四化落於財帛。', 'zh-Hant').pass).toBe(true);
  });

  it('en: accepts English and does not demand a CJK script', () => {
    expect(checkLanguage('The Life Palace holds Zi Wei in a prosperous state.', 'en').pass).toBe(true);
  });

  it('en: accepts the transliterated original alongside, which its prompt requires', () => {
    // DESIGN.md §15.1 — English has no tradition of its own, so it keeps the
    // original beside the translation on first use. An earlier version of this
    // check called that leakage and failed a reading that was doing exactly
    // what it had been told to do; this test is why it will not happen again.
    const reading = 'The Life Palace (Mệnh / 命宮) sits in You (Dậu), hosting '
      + 'Lian Zhen (Liêm Trinh) and Po Jun (Phá Quân). '
      + 'The classical text Tử Vi Đẩu Số Toàn Thư treats this pairing as transformative. '
      + 'Everything else in this reading is ordinary English prose about the chart.';
    expect(checkLanguage(reading, 'en').pass, checkLanguage(reading, 'en').offenders.join('; ')).toBe(true);
  });

  it('en: still fails a reading that is not actually in English', () => {
    const r = checkLanguage('命宮有紫微，大限順遂，四化落於財帛，此為極佳之格局。', 'en');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('not written in en');
  });

  it('zh-Hant: fails a reading that is mostly English with a little Chinese', () => {
    const r = checkLanguage('This reading is essentially in English prose throughout, 命宮.', 'zh-Hant');
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('not written in zh-Hant');
  });

  it('vi: accepts Vietnamese with Han characters quoted alongside', () => {
    expect(checkLanguage('Mệnh cung (命宮) có Tử Vi (紫微) miếu địa.', 'vi').pass).toBe(true);
  });

  it("excludes the reader's own self-description, quoted back verbatim", () => {
    // The reader wrote this in Vietnamese; returning it unaltered is correct.
    const self = 'Ngại nhờ người khác, hay ôm việc một mình.';
    const reading = `명궁에 자미가 있습니다. 「${self}」라고 하셨습니다. 이는 명궁의 구조와 부합합니다.`;
    expect(checkLanguage(reading, 'ko', '', self).pass).toBe(true);
    // …but unrelated Vietnamese is still leakage.
    expect(checkLanguage(`명궁에 자미가 있습니다. Mệnh cung có Tử Vi rất tốt.`, 'ko', '', self).pass).toBe(false);
  });

  it("excludes the subject's own name, which is not the model's to translate", () => {
    const r = checkLanguage('명궁에 자미가 있습니다. Nguyễn Minh Anh 님의 명반입니다.', 'ko', 'Nguyễn Minh Anh');
    expect(r.pass).toBe(true);
  });
});

describe('check 4 — length', () => {
  it('vi/en count words; zh/ko count characters', () => {
    expect(LENGTH_TARGET.vi).toEqual({ unit: 'words', min: 5000 });
    expect(LENGTH_TARGET.en).toEqual({ unit: 'words', min: 5000 });
    expect(LENGTH_TARGET.ko).toEqual({ unit: 'chars', min: 8000 });
    expect(measureLength('one two three', 'vi')).toBe(3);
    expect(measureLength('명궁 자미', 'ko')).toBe(4);
  });

  it('fails a short reading and says how short', () => {
    const r = checkLength('too short', 'vi');
    expect(r.pass).toBe(false);
    expect(r.offenders[0]).toContain('short of the target');
  });

  it('passes a reading that meets the target', () => {
    expect(checkLength(Array(5000).fill('từ').join(' '), 'vi').pass).toBe(true);
    expect(checkLength('명'.repeat(8000), 'ko').pass).toBe(true);
  });
});

describe('check 5 — structure', () => {
  // Sections 4-9 carry a citation, because since D1 a section that cites
  // nothing is a structural failure in its own right — see the two tests for
  // that below. These fixtures are about section NUMBERING, so they satisfy it.
  const cite = (n: number) => (n >= 4 && n <= 7 ? '\n> Cung Mệnh · Liêm Trinh\n' : '');
  const sections = (ns: number[], level = 2) =>
    ns.map((n) => `${'#'.repeat(level)} ${n}. Phần ${n}\n\nnội dung\n${cite(n)}`).join('\n');

  it('passes 1–9 when there is no Bazi and no self-description', () => {
    const r = checkStructure(sections([1, 2, 3, 4, 5, 6, 7, 8, 9]), { bazi: false, selfDescription: false });
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('requires section 10 only when Bazi data was supplied', () => {
    const nine = sections([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(checkStructure(nine, { bazi: true, selfDescription: false }).offenders)
      .toContain('section 10 missing');
    expect(checkStructure(nine, { bazi: false, selfDescription: false }).pass).toBe(true);
  });

  it('flags a section written when its input was absent', () => {
    const ten = sections([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(checkStructure(ten, { bazi: false, selfDescription: false }).offenders)
      .toContain('section 10 written but no Bazi data was supplied');
  });

  it('catches a missing middle section', () => {
    const r = checkStructure(sections([1, 2, 3, 5, 6, 7, 8, 9]), { bazi: false, selfDescription: false });
    expect(r.pass).toBe(false);
    expect(r.offenders).toContain('section 4 missing');
  });

  it('catches sections out of order', () => {
    const r = checkStructure(sections([1, 2, 3, 4, 5, 6, 7, 9, 8]), { bazi: false, selfDescription: false });
    expect(r.pass).toBe(false);
    expect(r.offenders.join(' ')).toContain('out of order');
  });

  it('fails a section 4-9 that makes judgements with no citation at all', () => {
    // D1 presence. Accuracy is check 1's job; this is the reading's shape.
    const bare = [1,2,3,4,5,6,7,8,9].map((n) => `## ${n}. Phần ${n}\n\nnhận định\n`).join('\n');
    const r = checkStructure(bare, { bazi: false, selfDescription: false });
    expect(r.pass).toBe(false);
    // 4-7 only: 8 and 9 are itemised forecasts whose evidence the template
    // already requires inline, per prediction and per month.
    expect(r.offenders.filter((o) => o.includes('no citation line'))).toHaveLength(4);
  });

  it('is satisfied by one citation per section, not the two the prompt asks for', () => {
    // Deliberate margin: the check should fail a section that cites NOTHING,
    // not police one citation against two.
    const cited = [1,2,3,4,5,6,7,8,9]
      .map((n) => `## ${n}. Phần ${n}\n\nnhận định\n${n >= 4 && n <= 7 ? '\n> Cung Mệnh · Liêm Trinh\n' : ''}`)
      .join('\n');
    const r = checkStructure(cited, { bazi: false, selfDescription: false });
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('ignores numbered SUB-headings such as 4.1', () => {
    // Measured: every locale writes these, and reading them as section 4 five
    // times over reported a correct reading as "sections out of order".
    const r = checkStructure(
      [1,2,3,4,5,6,7,8,9]
        .map((n) => `## ${n}. Phần ${n}\n\n### ${n}.1 Chi tiết\n${cite(n)}\n### ${n}.2 Chi tiết\n`)
        .join('\n'),
      { bazi: false, selfDescription: false },
    );
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not read a NUMBERED palace heading as a section', () => {
    // "### 10. Property Palace" under section 2 was reported as a fabricated
    // section 10 on a chart that carried no Bazi.
    const body = [1,2].map((n) => `## ${n}. Phần ${n}\n`).join('')
      + [1,2,3,4,5,6,7,8,9,10,11,12].map((n) => `### ${n}. Cung số ${n}\n`).join('')
      + [3,4,5,6,7,8,9].map((n) => `## ${n}. Phần ${n}\n${cite(n)}`).join('');
    const r = checkStructure(body, { bazi: false, selfDescription: false });
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not care which heading LEVEL the model chose', () => {
    // Measured: a run shifted every heading down one level. The readings were
    // correct in substance; an earlier version of this check said they had no
    // sections at all.
    const r = checkStructure(sections([1,2,3,4,5,6,7,8,9], 3), { bazi: false, selfDescription: false });
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('requires 11 when a self-description was supplied', () => {
    const r = checkStructure(sections([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), { bazi: true, selfDescription: true });
    expect(r.offenders).toContain('section 11 missing');
  });
});

describe('the vocabulary the checks stand on', () => {
  for (const locale of LOCALES) {
    it(`${locale}: knows stars and finds them on the fixture chart`, () => {
      expect(knownStars(locale).length).toBe(14);
      expect(advisoryStars(locale).length).toBeGreaterThan(40);
      expect(starsOnChart(CHART, locale).size).toBeGreaterThan(20);
    });
  }
});
