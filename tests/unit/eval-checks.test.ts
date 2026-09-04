import { describe, expect, it } from 'vitest';
import {
  checkHallucination, checkCoverage, checkLanguage, checkLength, checkStructure,
  knownStars, advisoryStars, starsOnChart, measureLength, LENGTH_TARGET,
} from '../eval/checks';
import { FIXTURE_RESULT } from '@/lib/fixture';
import { term } from '@/lib/i18n/vocabulary';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { starsOrBorrowed } from '@/lib/chart-derived';

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

  it('accepts a region list, which is the seam D1 will use', () => {
    const citation = 'Căn cứ: Mệnh · Dậu · Tử Vi.'; // Tử Vi is NOT in Mệnh
    const r = checkHallucination('irrelevant prose', CHART, 'vi', { regions: [citation] });
    expect(r.offenders.join(' ')).toContain('Tử Vi');
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
  const sections = (ns: number[]) => ns.map((n) => `## ${n}. Phần ${n}\n\nnội dung\n`).join('\n');

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

  it('ignores numbered SUB-headings such as 4.1', () => {
    // Measured: every locale writes these, and reading them as section 4 five
    // times over reported a correct reading as "sections out of order".
    const r = checkStructure(
      [1,2,3,4,5,6,7,8,9].map((n) => `## ${n}. Phần ${n}\n\n### ${n}.1 Chi tiết\n\n### ${n}.2 Chi tiết\n`).join('\n'),
      { bazi: false, selfDescription: false },
    );
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not read a NUMBERED palace heading as a section', () => {
    // "### 10. Property Palace" under section 2 was reported as a fabricated
    // section 10 on a chart that carried no Bazi.
    const body = [1,2].map((n) => `## ${n}. Phần ${n}\n`).join('')
      + [1,2,3,4,5,6,7,8,9,10,11,12].map((n) => `### ${n}. Cung số ${n}\n`).join('')
      + [3,4,5,6,7,8,9].map((n) => `## ${n}. Phần ${n}\n`).join('');
    const r = checkStructure(body, { bazi: false, selfDescription: false });
    expect(r.pass, r.offenders.join('; ')).toBe(true);
  });

  it('does not care which heading LEVEL the model chose', () => {
    // Measured: a run shifted every heading down one level. The readings were
    // correct in substance; an earlier version of this check said they had no
    // sections at all.
    const deep = [1,2,3,4,5,6,7,8,9].map((n) => `### ${n}. Phần ${n}\n\nnội dung\n`).join('\n');
    const r = checkStructure(deep, { bazi: false, selfDescription: false });
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
