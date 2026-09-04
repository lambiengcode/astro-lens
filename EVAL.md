# EVAL.md — reading quality, and whether TOON was worth it

Phase P6. Two things: a harness that measures what the model actually **says**,
and an A/B on encoding the chart data as TOON.

Everything here is measured. The raw readings, the per-run reports and the
machine-readable results are in `tests/eval/out/<run>/`, so any number below can
be re-derived — and any judgement I made about a failure can be disagreed with
by reading the reading.

```
npm run eval                       every locale, every golden chart
npm run eval -- --locale ko        one locale
npm run eval -- --chart a-tuvi-ty  one chart
npm run eval -- --reuse            re-run the CHECKS on saved readings, no quota
PROMPT_FORMAT=toon npm run eval    the TOON arm
```

**Deliberately not part of `npm run test` or CI.** A full run is ten model calls
at roughly four minutes each — about twenty minutes of wall clock and real
quota. It is run on purpose. The *checkers* are unit-tested separately and do
run in `npm run test`, because proving a checker works should never cost an API
call: `tests/unit/eval-checks.test.ts` (50 tests) and
`tests/unit/toon-context.test.ts` (34 tests).

---

## 1. The verdict, up front

| Question | Answer |
|---|---|
| Does the harness work? | Yes. It found real defects in every arm, and two bugs in itself. |
| Does TOON compress the chart data? | **Yes — 22.6%** of the data context. |
| Does that matter for this app? | **No. 4.3% of the prompt, 1.79% of input+output tokens, 0% of the wall clock.** |
| Did the readings get better? | No. 3/10 → 1/10 cells, which is within noise but is certainly not an improvement. |
| **Recommendation** | **Revert Part B.** Keep the harness. |

This is the outcome firstmate predicted when advising the captain, and the
numbers bear it out. It is a clean negative result, not a failure: we now know
the size of the prize instead of guessing at it.

---

## 2. The harness — Part A

### 2.1 The five checks

| # | Check | What it asserts |
|---|---|---|
| 1 | **Hallucination** | Every major star a reading *places in a palace* is actually in that palace |
| 2 | **Coverage** | All twelve palaces discussed, by their own localised names |
| 3 | **Language** | Written predominantly in the locale's script; no Vietnamese where it has no business |
| 4 | **Length** | Meets the target the locale's own prompt demands |
| 5 | **Structure** | The eleven sections, present, in order, and conditional ones only when their input exists |

All five are deterministic. The chart is ground truth, so the failures that
matter are catchable without a judge model — and a deterministic check cannot
itself hallucinate.

### 2.2 Two golden charts, both frozen

| id | Shape |
|---|---|
| `a-tuvi-ty` | Tử Vi tại Tỵ. Giáp year, 3 vô chính diệu, tứ hóa on Liêm Trinh / Phá Quân / Vũ Khúc / Thái Dương. **No Bazi, no self-description** — sections 10 and 11 must be *absent*. |
| `b-vcd-tan` | Tân year, **4 vô chính diệu** (Nô Bộc, Thiên Di, Tật Ách, Tử Nữ), tứ hóa on Thái Dương / Cự Môn / Văn Khúc / Văn Xương. **Bazi present, self-description supplied** — sections 10 and 11 are *required*. |

Two, not one, because a single chart cannot tell a reading that handles vô
chính diệu well from one that never met it. Between them they exercise both
branches of every conditional in the output template.

Both are **frozen to disk**. `generateChart` calls `astrolabe.horoscope(today)`,
so a live chart drifts with the calendar, and an A/B on drifting input is not an
A/B.

### 2.3 Check 1 is not what it first looks like

The obvious formulation — *"every star the reading names must exist on the
chart"* — is **useless here, and measuring it is how that was discovered.**

A complete Tử Vi chart places **all fourteen major and all fourteen minor stars
somewhere**. "Named a star that is not on the chart" can therefore never fire on
a real chart. The first version of this check scanned every star ring including
the lesser ones, and on the baseline it produced **ten findings across six CJK
and Hangul cells, of which ten were false positives**:

| Kind | Example found |
|---|---|
| Used as a category, not a placement | 武曲為**將星**, 貪狼為**桃花星** |
| A homograph from another domain | **함지** is also the brightness 陷地; **식신** is a Bazi Ten God |
| An ordinary word | **태세** also means "stance"; **지배** means "dominate" |

A check that is wrong every time it fires teaches its reader to ignore it, which
is worse than not having it.

**What the check actually verifies now is placement.** The prompt mandates the
shape of section 2 — `### <palace> — <its major stars>` — and every reading in
both arms followed it in every locale. Each heading is parsed, matched to a
palace, and the major stars named in it are compared with what the chart puts
there. A vô chính diệu palace legitimately names the stars it borrows from its
đối cung, so those count as correct, using the app's own `starsOrBorrowed` rule.

- **Only extra stars fail** — a star named in a palace that does not hold it.
  That is the fabrication that harms a reader.
- **Omission is a note, not a failure.** Readings abbreviate ("Cơ Lương" for
  Thiên Cơ and Thiên Lương), so omission-detection would be unreliable.
- **The lesser rings are still scanned, as notes.** The information is kept; it
  just does not gate.
- **Unparseable is not a pass.** If fewer than 8 of 12 headings can be matched,
  the check fails saying it could not verify, rather than passing in silence.

D1 is the reason this is worth saying: the citation blocks, when populated, are
placement claims by construction, so the whole vocabulary can gate again
without any of the three failure modes above. `HallucinationOptions.regions`
is the seam and is unit-tested.

### 2.4 The harness found two bugs in itself

Recorded because they are the reason to trust the numbers that follow, and
because both are now locked down by tests:

1. **The English language check was wrong.** `DESIGN.md` §15.1 gives English no
   tradition of its own, so its prompt deliberately asks for the transliterated
   original alongside — *"The Life Palace (Mệnh / 命宮)"*. The first version
   called that Vietnamese leakage and failed both English readings for doing
   exactly what they were told. It now measures the **dominant script** (the en
   readings are 99.6–99.7% ASCII; the zh/ko readings 98.8–99.7% CJK), which
   separates them cleanly and still fails a reading written in the wrong
   language.
2. **Check 1**, as described in §2.3.

---

## 3. Baseline — what the current format actually produces

`tests/eval/out/baseline/` · 10 cells · mean **243.6s** per reading

| Chart | Locale | Halluc. | Coverage | Language | Length | Structure |
|---|---|:--:|:--:|:--:|:--:|:--:|
| a-tuvi-ty | vi | ✅ | ✅ | ✅ | ✅ | ✅ |
| a-tuvi-ty | zh-Hans | ✅ | ✅ | ❌ | ✅ | ❌ |
| a-tuvi-ty | zh-Hant | ✅ | ✅ | ✅ | ✅ | ❌ |
| a-tuvi-ty | ko | ✅ | ✅ | ✅ | ✅ | ❌ |
| a-tuvi-ty | en | ✅ | ✅ | ✅ | ✅ | ❌ |
| b-vcd-tan | vi | ✅ | ✅ | ✅ | ✅ | ❌ |
| b-vcd-tan | zh-Hans | ✅ | ✅ | ❌ | ✅ | ✅ |
| b-vcd-tan | zh-Hant | ✅ | ✅ | ✅ | ✅ | ✅ |
| b-vcd-tan | ko | ✅ | ✅ | ❌ | ✅ | ✅ |
| b-vcd-tan | en | ✅ | ✅ | ✅ | ✅ | ✅ |
| | | **10/10** | **10/10** | **7/10** | **10/10** | **5/10** |

**3 of 10 cells pass all five.**

### 3.1 The good news is real

**Hallucination 10/10 and coverage 10/10.** Across twenty readings in five
languages, no major star was ever placed in a palace that does not hold it, and
every reading discussed all twelve palaces. Those are the two properties a
reader cannot check for themselves, and they hold.

### 3.2 The most important finding in the phase

**On chart A — which has no Bazi data — four of five locales wrote section 10,
a full Ba Zi analysis, anyway.**

```
a-tuvi-ty zh-Hans: section 10 written but no Bazi data was supplied
a-tuvi-ty zh-Hant: section 10 written but no Bazi data was supplied
a-tuvi-ty ko:      section 10 written but no Bazi data was supplied
a-tuvi-ty en:      section 10 written but no Bazi data was supplied
```

The prompt could hardly be clearer — *"Only write this section if Bazi data
appears above. If it does not → skip it entirely."* The model writes it regardless
and invents the Four Pillars to fill it. This is a whole section of fabricated
content in four of five languages, and **it is not a formatting nit: it is the
same class of harm as an invented star, at greater scale.** Vietnamese was the
only locale that obeyed.

The mirror failure also occurs: on chart B, which *does* carry Bazi, the
Vietnamese reading omitted section 10 in the baseline and section 11 in the
TOON arm.

This is out of scope to fix here — it is a prompt problem, not a harness or a
format problem — but it is the finding most worth acting on next.

### 3.3 Language failures are real leakage

Three cells, all CJK/Hangul, all the same shape: the model imports **Vietnamese
scholarly apparatus** into a non-Vietnamese reading.

```
ko: 『Tử Vi Đẩu Số Toàn Thư』                       ← the classical text, romanised in Vietnamese
ko: (Tham Vũ mộ trung cư, tam thập tải phát phúc)  ← a classical verse, in Vietnamese
```

A Korean reader should get 『자미두수전서』 and the verse in hanja or Korean.
This is `DESIGN.md` §15.7's *"a translated interface over an untranslated
reading"* in miniature, and it is exactly what P5's leakage sweep was for —
except that sweep covers the interface, and this is the reading.

---

## 4. TOON — Part B

`@toon-format/toon` **v4.1.1**, MIT, zero dependencies — the reference
implementation from the format's own maintainers. No format was hand-rolled;
the brief's stop-and-report condition did not arise.

Applied to **the chart data context only** (`buildToonDataContext`). Not the
system instruction, which lives in the context cache and is not re-sent; not the
reasoning-and-task layer; not the output. Selected with `PROMPT_FORMAT=toon`,
**default off**, so nothing in the app changes unless it is asked for.

TOON's win is tabular arrays of uniform objects, and the twelve palaces are
exactly that shape:

```
palaces[12]{"12 CUNG","Can/Chi","Trường sinh","Đại hạn","Chính tinh","Phụ tinh","Tạp diệu","[★THÂN CUNG]"}:
  Điền Trạch,BínhTý,Mộc Dục,94-103,Thiên Đồng(vượng) · Thái Âm(miếu),Thiên Việt · Địa Không,…,0
  Quan Lộc,ĐinhSửu,Quan Đới,84-93,"Vũ Khúc(miếu)[Khoa] · Tham Lang(miếu)",…,0
```

### 4.1 Tokens — exact, from the provider's own tokeniser

`countTokens` on the fully assembled prompt, per locale, both arms. Not a
character-count heuristic: CJK, Latin and this prompt's box-drawing characters
tokenise very differently from one another.

| Chart | Locale | Data ctx TEXT | Data ctx TOON | Δ data | Whole prompt TEXT | Whole prompt TOON | Δ prompt |
|---|---|--:|--:|--:|--:|--:|--:|
| a-tuvi-ty | vi | 1,259 | 917 | −27.2% | 8,130 | 7,788 | −4.2% |
| a-tuvi-ty | zh-Hans | 1,054 | 705 | −33.1% | 6,733 | 6,384 | −5.2% |
| a-tuvi-ty | zh-Hant | 1,057 | 709 | −32.9% | 6,936 | 6,588 | −5.0% |
| a-tuvi-ty | ko | 1,023 | 707 | −30.9% | 7,606 | 7,290 | −4.2% |
| a-tuvi-ty | en | 1,038 | 723 | −30.3% | 6,632 | 6,317 | −4.7% |
| b-vcd-tan | vi | 2,051 | 1,725 | −15.9% | 8,922 | 8,596 | −3.7% |
| b-vcd-tan | zh-Hans | 1,793 | 1,448 | −19.2% | 7,472 | 7,127 | −4.6% |
| b-vcd-tan | zh-Hant | 1,798 | 1,455 | −19.1% | 7,677 | 7,334 | −4.5% |
| b-vcd-tan | ko | 1,760 | 1,453 | −17.4% | 8,343 | 8,036 | −3.7% |
| b-vcd-tan | en | 1,758 | 1,458 | −17.1% | 7,352 | 7,052 | −4.1% |
| **total** | | **14,591** | **11,300** | **−22.6%** | **75,803** | **72,512** | **−4.3%** |

**TOON does its job well. It is applied somewhere that does not matter much.**

### 4.2 Why 22.6% becomes 4.3%

The data context is only a **13–24% slice of the prompt**. The other 76–87% is
the reasoning-and-task layer — the [A]–[K] pass, the seventeen-point self-check
and the eleven-section output template — which TOON cannot touch and which the
brief correctly put out of scope.

### 4.3 And why 4.3% becomes 1.79%

The prompt is the small end of the request. Measured output, same tokeniser:

| | Tokens |
|---|--:|
| Prompt in, 10 cells | 67,673 |
| Reading out, 10 cells | 116,591 |
| TOON's saving | **3,291** |
| **Saving as a share of in + out** | **1.79%** |

And that is generous: **billed thinking tokens are not returned**, and this runs
at `ThinkingLevel.HIGH`, so the true denominator is larger and the true share
smaller.

### 4.4 No time saved either

| | Mean seconds per reading |
|---|--:|
| Baseline | 243.6 |
| TOON | 242.7 |

A 0.9s difference across ten readings is noise. Input compression cannot touch
the thinking and generation that dominate the ~4 minutes — which is precisely
the argument firstmate put to the captain.

---

## 5. Did the readings get worse? — the A/B

`tests/eval/out/toon/` · same frozen charts, same checks, same locales.

| Check | Baseline | TOON |
|---|:--:|:--:|
| Hallucination | 10/10 | 10/10 |
| Coverage | 10/10 | 10/10 |
| Length | 10/10 | 10/10 |
| Language | 7/10 | 6/10 |
| Structure | 5/10 | 4/10 |
| **Cells passing all five** | **3/10** | **1/10** |

**Read this carefully, because it is easy to over-claim in both directions.**

- The two checks that verify the model understood the data — hallucination and
  coverage — are **10/10 in both arms**. TOON did not confuse the model about
  the chart. That is the question the A/B was really for, and the answer is
  clean.
- The nominal 3/10 → 1/10 drop is **within noise**. These are single samples
  from a stochastic model at `temperature: 0.75`; with n=1 per cell I cannot
  separate a real regression from run-to-run variance, and I will not pretend
  otherwise. Establishing that would need repeated runs per cell, which is more
  quota than this question is worth.
- The dominant failure — section 10 written without Bazi data — is **identical
  in both arms**, 4 of 5 locales each. It is a property of the prompt, not of
  the encoding.

**The honest summary: no evidence TOON improves the readings, no evidence it
harms comprehension, and a small nominal regression that is not separable from
noise.**

---

## 6. Recommendation — Part C

### Revert Part B.

TOON buys **1.79% of tokens and none of the four minutes**, in exchange for a
second encoding of the chart context that has to be kept correct alongside the
first. That is not a good trade, and the measurement says so plainly rather than
letting "implemented as requested" stand in for a result.

Nothing needs undoing to leave things safe: `PROMPT_FORMAT` defaults to `text`,
so **the app already behaves exactly as it did before P6**. Reverting is
deleting, not changing:

```
src/lib/prompt/toon-context.ts        the encoder
tests/unit/toon-context.test.ts       its 34 tests
package.json                          the @toon-format/toon dependency
src/lib/gemini.ts                     PromptFormat, defaultPromptFormat,
                                      and the `format` parameter of buildAnalysisPrompt
```

`buildAnalysisPrompt` stays — the harness needs it to count tokens, and
measuring a reconstruction instead of the real prompt is how a token
measurement quietly becomes fiction.

### Keep Part A.

The harness earned its place in one run: it found a whole fabricated section in
four of five locales, real Vietnamese leakage into Korean and Chinese readings,
and two bugs in itself. It costs nothing until it is run.

### What is worth doing next, in order

1. **Fix section 10.** Four of five locales fabricate a Ba Zi analysis for a
   chart that has none. Highest harm, and it is a prompt change.
2. **Stop the Vietnamese apparatus leaking** into CJK and Hangul readings —
   classical text titles and verses need their own locale's form.
3. **Then D1**, which upgrades check 1 from "the section-2 headings are right"
   to "every claim in the reading is traceable", using the seam that is already
   built and tested.
