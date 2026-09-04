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

---

## 7. P7 step 2 — the two fixes, and what they moved

Run tags on disk: `baseline` (unchanged, the readings from §3) and `p7-step2`.
**Both were re-scored with the same checker**, for the reason in §7.4 — a
before/after where the two sides were measured differently is not a
measurement.

### 7.1 The result

| Check | Baseline | After step 2 | |
|---|---:|---:|---|
| 1 · hallucination | 10/10 | 10/10 | — (see §7.4) |
| 2 · coverage | 10/10 | 10/10 | — |
| 3 · language | 7/10 | **10/10** | ▲ fixed |
| 4 · length | 10/10 | 10/10 | — |
| 5 · structure | 5/10 | **10/10** | ▲ fixed |
| **Cells passing all five** | **3/10** | **10/10** | |

### 7.2 Section 10 — fixed, and the instruction was never the problem

§3.2: four of five locales wrote a Bát Tự section and invented the Four Pillars
for a chart that carries none, *despite* the prompt saying to skip it. The fix
is that the conditional is now **structural** — `renderTask()` in
`src/lib/prompt/index.ts` deletes the `⟦BAZI⟧` and `⟦SELF⟧` regions from the
task before it is sent, so on a chart with no Bát Tự the model never sees
section 10's heading, its `[J]` reasoning step, or its `□ 16` self-check line.
There is nothing left to copy.

Two smaller things went with it, both from reading the failures rather than
guessing:

- The data context now **states the absence** (`labels.baziAbsent`) instead of
  leaving a silence where the Bazi block used to be. Silence is what got filled
  in.
- Sections 10 and 11, when they *are* present, carry a mandatory subtitle. They
  were the only conditional sections and read as optional throughout.

Structure went 5/10 → 10/10. No cell fabricates a section it was not given data
for.

### 7.3 The language failures were **our bug**, not the model's

§3.3 read as the model lapsing into Vietnamese. It was not. A tứ hóa entry is
`"<transformation> <star>"`, and a star name is usually two words
(`"Lộc Thiên Đồng"`). `mutagenList` split on **every** space and looked each
word up in the vocabulary alone, so no multi-word star ever matched and a
Chinese reader's prompt literally contained:

```
四化: 禄 Thiên Đồng · 权 Thiên Cơ
```

The model was quoting us back, faithfully. Fixed in all three places that
build it (`gemini.ts`, `prompt/toon-context.ts`, `api/chat/route.ts`) by
splitting on the first space only, with a regression test per locale in
`tests/unit/prompt.test.ts`.

The second half was real: the model cited *Tử Vi Đẩu Số Toàn Thư* in Vietnamese
romanisation to a Korean reader. The rule against that had to go in the **task**
layer, not `system` — `system` lives in the per-locale context cache and an edit
to it does nothing while that cache exists.

Language went 7/10 → 10/10.

### 7.4 What got worse, and it is not nothing

**Hallucination went 10/10 → 9/10.** `a-tuvi-ty` at `ko` heads 형제궁 as
borrowing 천기 · 천량, where it borrows 태양 · 거문.

> **Corrected during step 3 — this was partly the checker, not the reading.**
> 형제 sits at Thân, and Thân's tam hợp corners are Tý and **Thìn**, which is
> where 천기 · 천량 are. So the two stars DO reach 형제; what the reading got
> wrong is the route, calling it the 대궁 when it is the tam hợp. That is a
> mislabelled relationship, not a fabricated placement. Under the checker as
> corrected in §8.3 — which admits tam phương tứ chính where the text says
> 조회 — step 2 re-scores at **hallucination 10/10**, and the step-2 number
> above should be read as 10/10, not 9/10. The finding is left standing rather
> than deleted because the mislabelling is real and worth fixing; it simply is
> not the fabrication this check exists to catch.

`b-vcd-tan` at `ko` errored on the first pass (transport) and was re-run
single-cell into the same tag. Same prompt, same code.

### 7.5 The checker had a third bug, and it flattered nothing

The run first scored **6/10**, with `a-tuvi-ty` at `vi` reported as having no
sections at all. It had all of them: the model had shifted every heading down
one level (`###` for sections, `####` for palaces), and the checks matched a
fixed `##`.

Heading *level* is not part of the contract; the *relative* level is. Widening
the regex to `#{2,4}` was worse than the bug — it read `#### 4.1` as section 4
five times over ("sections out of order"), and `### 10. Property Palace` inside
section 2 as a fabricated section 10 on a chart with no Bazi. It also sliced
section 2 shut at `#### 3. 夫妻宮`, seeing 2 palaces of 12.

The checks now find sections by **shape**: a numbered heading is `#…# <n>.`
followed by a space (which excludes `4.1`), and the sections are those at the
shallowest numbered level (which excludes a numbered palace nested under
section 2). Everything deeper inside section 2 is a palace heading. Four
regression tests, one per shape the model actually produced.

Both sides of §7.1 were re-scored with the corrected checker, and it is worth
saying which way that cut:

| | old checker (fixed `##`) | widened `#{2,4}` | corrected |
|---|---:|---:|---:|
| `baseline` | 3/10 | — | **3/10** |
| `p7-step2` | 6/10 | 1/10 | **9/10** |

**The baseline did not move.** Its readings happen not to contain the shapes
that tripped the old checker, so re-scoring it returned the §3 numbers
unchanged, check for check. The whole correction lands on the after-run, which
is the uncomfortable direction — a checker bug that only ever flattered the
new work would be the one to distrust. The evidence that it is a real bug and
not a convenient one is in the readings themselves: `a-tuvi-ty` at `vi` is
47KB with all nine sections and all twelve palaces correctly placed, and the
old checker called it structureless.

---

## 8. P7 step 3 — D1 citations

Run tag `p7-step3`. Every number here, and every number in §7 as amended, comes
from **one checker** — the one in the tree now. Re-scoring is free, so there is
no reason to compare two arms measured by two instruments.

### 8.1 The reading now shows its work

| | baseline | p7-step2 | **p7-step3** |
|---|---:|---:|---:|
| Citation lines, all ten readings | 0 | 0 | **144** |
| Fewest in one reading | — | — | 4 |
| Most in one reading | — | — | 31 |

The `.sealq` block that P0–P4 built and left empty is populated in all five
locales, on both charts. The chat's `.cite` row is populated too — verified
against the live API in `vi` and `ko`:

```
vi  cite = "Cung Mệnh · Liêm Trinh (bình), Phá Quân (hãm), Văn Xương, …"
ko  cite = "명궁 · 염정(평)"
```

Both are the fixture's actual placement, and in both the answer text came back
with no `>` line left in it — `splitCitation` moved it to its own row.

### 8.2 The five checks

| Check | baseline | p7-step2 | **p7-step3** | |
|---|---:|---:|---:|---|
| 1 · hallucination | 10/10 | 10/10 | **9/10** | ▼ one, and it is real — §8.4 |
| 2 · coverage | 10/10 | 10/10 | 10/10 | — |
| 3 · language | 7/10 | 10/10 | **9/10** | ▼ one, §8.5 |
| 4 · length | 10/10 | 10/10 | 10/10 | — |
| 5 · structure — sections | 5/10 | 10/10 | 10/10 | — |
| 5 · structure — **including citations** | 0/10 | 0/10 | **5/10** | the new bar |
| **Cells passing all five at the D1 bar** | **0/10** | **0/10** | **5/10** | |

**Read the last two rows carefully.** Check 5 now also requires citations, so
the two pre-D1 runs score 0/10 on it *by construction* — they contain no
citations at all, because the feature did not exist. Their 3/10 and 10/10 in §3
and §7 were measured against a bar with no citation requirement in it. The
honest cross-run statement is the one in the "sections" row: section numbering
was already fixed in step 2 and stayed fixed.

### 8.3 Check 1 accused four correct citations before it accused a wrong one

Firstmate set the bar: *"a citation naming a star that is not in that palace is
worse than no citation at all."* That cuts both ways — a checker that cries
wolf is worse than no checker, and this one cried wolf four times before it
caught anything. Every one was found by scoring the readings, not by reasoning
about them:

| What the reading wrote | What the check said | Why it was wrong |
|---|---|---|
| `부처궁 · 좌보 — 자미두수에서…` | 자미 placed in 부처 | **자미두수 CONTAINS 자미.** It named the discipline, not a star. |
| `迁移宫 · 天相(陷) · 冲照 命宫 · 廉贞(平) —— 天相落陷于外…` | 天相 placed in 命宫 | The prose **after the em-dash** re-mentions the star. The evidence head placed it correctly. |
| `大限官祿宮 (寅) · 太陽 巨門` | 太陽 placed in 官祿 | `大限官祿宮` is **not the natal 官祿宮**. The overlay relabels palaces onto other branches. |
| `戌宮 · 大限貪狼化祿照會` | 貪狼 placed in 子女 | `照會` means it **shines in** from tam phương tứ chính, not that it sits there. |

Four fixes, each with its own regression test:

- the discipline's name in all five locales is masked before any star is sought;
- a citation is judged on its **evidence head**, the part before the em-dash — a
  heading is not, because a heading's own separator is an em-dash;
- a citation carrying `大限` / `lưu niên` / `대한` is re-anchored on the **branch**
  it names, which is why the reference mockup's own citation carries one
  (`Mệnh · Dậu`); with no branch it is not vouched for either way;
- `照 / 沖 / chiếu / 조회` opens the đối cung and the two tam hợp corners, and
  nothing beyond them.

**What the last one costs, stated plainly:** inside a marked citation the check
can no longer tell "X sits here" from "X shines in", so a misattribution within
tam phương tứ chính now passes. That is four palaces' worth of stars. It is the
price of not flagging the evidential frame the prompt itself asks the reading to
use, and it is what re-scored §7's Korean finding from a fabrication to a
mislabelled route.

### 8.4 The one hallucination is real, and was verified by hand

`b-vcd-tan` at `zh-Hant`:

```
> 2. 流年官祿 (2026) · 戌宮 · 大限貪狼化祿照會 —— 2026 下半年，自立門戶的契機成熟。
```

Checked against the chart rather than against the checker:

- Tham Lang sits at **Sửu**, in Mệnh.
- The citation places the 2026 lưu niên Quan Lộc at **Tuất**.
- Tuất's tam phương tứ chính is Thìn, Dần, Ngọ, Tuất. **Sửu is not among them.**
- The đại vận *is* anchored at Tuất and its hoá lộc *is* on Tham Lang — that
  half is correct.

So the mutagen is real and the palace is real; the relationship between them is
not. This is exactly the class of error D1 exists to surface, and it took a
citation to make it visible — the same reading's section-2 headings are clean.

### 8.5 What else did not come out clean

- **Section 7 carries no citation in 5 of 10 cells** (`vi` on both charts,
  `zh-Hans`, `zh-Hant`, `ko`). It is a prose judgement section and the prompt
  asks sections 4–9 for two citations each; sections 4, 5 and 6 comply in every
  cell and 7 is where compliance stops. This is the single largest remaining
  gap and it is a prompt problem, not a checker one.
- **Sections 8 and 9 are deliberately not gated.** They are itemised forecasts —
  ten predictions, twelve lunar months — and the template already requires their
  evidence per item and inline (self-check □12, □13). Twenty-two blockquotes
  interleaved through two lists is a different instruction, and no locale read
  it that way. The shipped prompt still says "4 through 9"; the checker asks
  4–7. That mismatch is recorded here rather than quietly fixed, because the
  prompt as measured is the prompt that ships.
- **Language 10/10 → 9/10**: `b-vcd-tan` at `ko` writes
  `『자미두수전서(Tử Vi Đẩu Số Toàn Thư)』` — the Korean title with the Vietnamese
  romanisation glossed after it. The step-2 rule forbids the Vietnamese form.
  One cell, the rule unchanged since step 2, so most likely variance rather
  than regression — but it is a violation of our own rule and is counted as one.

### 8.6 What is worth doing next

1. **Get section 7 citing.** Half the cells skip it. Naming sections 4–7
   explicitly, and telling the model where the evidence goes in 8 and 9, is a
   prompt change and a run.
2. **Teach the checker the đại vận ring**, so an overlay citation without a
   branch can be verified instead of waved through, and so §8.4's class of
   error is caught by geometry rather than by hand.
3. **Narrow the influence allowance** to the stars that follow the marker,
   which would restore the đối-cung-versus-tam-hợp distinction §8.3 gave up.
