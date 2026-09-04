# PARITY.md — Thiên Văn Đài, measured against the reference mockup

Evidence for `PLAN.md` §10. Everything here is produced by `npm run parity`;
nothing in this file is an estimate.

- **Reference:** `tests/parity/reference/mockup.html`, exported from
  `.lavish/horoscopes-thienvandai-mockup.html` with `lavish-axi export`.
- **Candidate:** the live app on a freshly compiled dev server, loaded with the
  deterministic fixture (`?fixture=tuvi-ty`, `PLAN.md` §10.1).
- **Conditions:** 1440×900 and 390×844, `deviceScaleFactor: 1`,
  `colorScheme: 'dark'`, `reducedMotion: 'reduce'`, `document.fonts.ready`
  awaited before every capture.
- **Comparison:** `pixelmatch` at `threshold: 0.1`.
- **Artefacts:** `tests/parity/out/<screen>-<viewport>.{ref,cand,diff}.png` and
  `tests/parity/out/results/*.json`.

---

## 1. Results

### The criterion applied

**`PLAN.md` §10.3's qualitative gate: geometry-clean, plus a residual evidenced
as text rasterisation.** Settled by firstmate, 2026-09-04. §10.3 accepts diffs
concentrated on text antialiasing and fails diffs on position, size, colour,
spacing or missing elements *regardless of percentage* — so the substantive
test is the qualitative one, and the ≤0.5% figure is a proxy for it. §2 below
establishes that the residual on the geometry-clean screens is rasterisation
and not layout.

### Reading the table

**Pixels** is the `pixelmatch` percentage the plan names, with the
**under 0.5% proxy** column beside it. Both are reported for the record, not
scored: a `no` means the screen carries enough type for the rasterisation haze
to cross the proxy threshold, not that anything is wrong with it.

**Geometry** is the measurement that gates: the box (`top, left, width,
height`, half-pixel tolerance) of every element in a per-screen selector list,
compared between reference and candidate. It is independent of how a glyph was
rasterised, which is exactly why it is the one that decides.

**Passes §10.3** is the criterion. Every row passes it.

| Screen | Viewport | Pixels (thr 0.1) | Under 0.5% proxy | Geometry boxes | Geometry mismatches | **Passes §10.3** |
|---|---|---:|:---:|---:|---:|:---:|
| §01 Landing | 1440×900 | 2.904% | no | 39 | **2** — 1 reference artefact (§3) + 1 authorised (§10) | ✅ |
| §02 Tổng quan | 1440×900 | 2.119% | no | 54 | **0** | ✅ |
| §03 12 Cung | 1440×900 | 1.636% | no | 114 | **0** | ✅ |
| §04 Đại Vận | 1440×900 | 0.617% | no | 93 | **0** | ✅ |
| §05 Luận giải | 1440×900 | 1.848% | no | 24 | **0** | ✅ |
| §06 Vận hạn | 1440×900 | 0.431% | yes | 22 | **0** | ✅ |
| §01 Landing | 390×844 | 2.869% | no | 39 | **15** — 13 reference artefacts (§3) + 2 authorised (§10) | ✅ |
| §02 Tổng quan | 390×844 | 3.277% | no | 54 | **0** — but see §10.5 | ✅ |
| §03 12 Cung | 390×844 | 0.430% | yes | 114 | **0** | ✅ |
| §04 Đại Vận | 390×844 | 0.487% | yes | 73 | **0** | ✅ |
| §05 Luận giải | 390×844 | 1.621% | no | 23 | **0** | ✅ |
| §06 Vận hạn | 390×844 | 0.492% | yes | 22 | **0** | ✅ |

**12 of 12 pass. 10 of 12 are geometrically clean; 4 of 12 also fall under the
≤0.5% pixel proxy.** The two app-bar movements on §01 are the captain's
right-aligned language selector, authorised in §10 — they are expected, not a
regression.

### Re-measured after P5 — what moved and what did not

`PLAN.md` §13b.6 makes this table the regression guard for the multilingual
phase. The claim below is load-bearing, so it is **measured, not remembered** —
five separate measurements, each named with what it rules out.

#### The result

| | Before P5 | After P5 |
|---|---|---|
| Screens with **0** geometry mismatches | 10 of 12 | **10 of 12** |
| Screens whose geometry is identical box-for-box | — | **10 of 12** |
| Screens under the ≤0.5% pixel proxy | 4 | **the same 4** |
| Largest pixel movement on any screen | — | +0.075 pp (§02 mobile) |

**Ten of the twelve screens are geometrically identical to the pre-P5 record** —
same box count, same mismatch set, and where a mismatch exists it carries the
same reference and candidate numbers.

**The two that moved are §01 Landing at both viewports**, and both movements are
the captain's right-aligned language selector (§10), authorised on 2026-09-04:

| Screen | Before P5 | Now | Added |
|---|---:|---:|---|
| §01 @ 1440×900 | 1 | **2** | `.appbar nav` |
| §01 @ 390×844 | 13 | **15** | `.appbar nav`, `.brand` |

Everything not in the app bar is untouched: §03–§06 are byte-identical to the
run before the selector moved, at both viewports, because their capture roots
(`.res-body`) do not contain it.

#### 1. The harness is bit-stable, so these are measurements

`npm run parity` run twice, each on a fresh dev server: **all twelve
`tests/parity/out/results/*.json` byte-identical between runs.** The numbers
are reproducible rather than sampled.

#### 2. At `vi`, the entire multilingual layer is inert

Measured on the live chart at `vi`:

| | Measured |
|---|---|
| `data-script` | `latin` |
| `[data-script]` CSS rules matching anything | **0** |
| CJK stylesheets in `<head>` | **0** |
| `--cjk-sans` / `--cjk-mono` / `--cjk-serif` | `system-ui` / `ui-monospace` / `Georgia` — the families that already sat next in each stack |
| Resolved `font-family` | `"IBM Plex Sans", …Fallback, system-ui, system-ui, sans-serif` — same fonts, same order, one inert duplicate |
| Every size §15.3 raises for dense scripts | still the Latin scale: `.maj .br` 9.5px · `.than` 9px · `.adjs span` 10px · `.minors span` 11px · `.pal-f .rt` 10.5px · `.borrow` 10.5px · `.pal-f .lf` 9.5px · `.dr` 10px |

Nothing in the per-script layer can reach a Vietnamese render, because none of
it matches.

#### 3. The one globally-active CSS change cannot reach a capture

`.print-head .sl` went 9px → 11px for every locale (§11.1). Measured across all
six screens: **0 print-block elements inside any capture root** (they live in
the off-screen `aria-hidden` export block). `.paper-foot` inside §05's root is
still **10.5px** at `vi` — the dense-script raise does not apply.

#### 4. The harness's new locale pin has no rendering effect

`parity.spec.ts` now pins `locale: 'vi-VN'` (§8). To rule that out as a source
of movement, each of §03–§06 was captured twice — once with the pin, once with
the default `en-US` context and Vietnamese forced by cookie, both rendering
`<html lang="vi">`. Result at both viewports, all four screens: **0 differing
pixels.** The pin changes nothing; it only decides which language is rendered.

#### 5. What the sub-0.03pp pixel deltas actually are

Every screen's pixel percentage moved by between 0.000 and 0.026 pp. §01 and
§02 capture `.app`, which contains the app bar, so the switcher's own 32×26 box
is theirs. §03–§06 capture `.res-body`, which does not — and they still moved
by up to 0.006 pp with geometry identical.

The cause is **text-run splitting, and it is measured, not assumed.** Lifting a
sentence into the catalogue turns one JSX text child into several expressions,
and React separates adjacent text children with a comment. On §04:

```
.dv-head .now
  text     : "đang đi · 24–33 tuổi · Phu Thê · năm 10/10"
  children : 15 → text("đang đi") text(" · ") text("24") text("–") …
```

The string is **character-identical**. A comment creates no box, so
`getBoundingClientRect` is unchanged — which is exactly why the geometry gate
reports zero mismatches. But it does break a shaping run, so kerning is not
applied across each seam, and a fraction of a pixel per seam is what
`pixelmatch` is seeing. The same mechanism already existed pre-P5 (`.tl-row
.ages` renders `{start}–{end}` as three nodes and always did); P5 added seams.

This is the same class of residual §2 establishes for the geometry-clean
screens: sub-glyph rasterisation, not layout.

#### A figure that is lower for a reason that is not P5's

§01's **geometry-box count reads 39, not the recorded 40**. The count is of
*reference* elements and the reference is untouched by this phase. 39 is what
the selector list arithmetically produces —
1+1+1+1+1+1+1+1+1+1+1+1+1+4+4+1+4+4+4+3+1+1 — once
`#s1 .hero .acts .btn:nth-of-type(2)` is collapsed rather than hidden (§4). The
recorded 40 was measured while that mask still used `hide`.

All twelve pass the criterion above: the ten geometry-clean pairs by §2, and
§01 at both viewports by §3 — its mismatches are reference-markup artefacts
(a `<span>` where the app has a real `<button>`, a `<div>` where the app has a
real `<select>`) once the three surfaces the app does not have are excluded per
the settled decision in §5.1.

---

## 2. What the residual on the geometry-clean screens is

Ten screen/viewport pairs match box-for-box and still measure 0.43%–3.20%
differing pixels. That residual is text rasterisation, and here is why that is
a finding rather than a claim.

### 2.1 The differences are many small deltas, not few large ones

Raising the comparison threshold collapses the diff on the geometry-clean
screens and barely moves it on §01, which is the difference between a haze on
glyph edges and genuinely different content:

| Screen | thr 0.10 | thr 0.20 | thr 0.35 | thr 0.50 | median Δ |
|---|---:|---:|---:|---:|---:|
| §02 overview desktop | 2.086% | 0.841% | 0.506% | 0.262% | 39 |
| §03 chart desktop | 1.636% | 0.889% | 0.633% | 0.252% | 20 |
| §05 reading desktop | 1.848% | 1.100% | 0.767% | 0.423% | 47 |
| §06 horoscope desktop | 0.431% | 0.117% | 0.060% | 0.033% | 30 |
| §03 chart mobile | 0.429% | 0.292% | 0.195% | 0.067% | 22 |
| **§01 landing desktop** | **2.890%** | **2.65%** | **1.71%** | **1.53%** | 15 |
| **§01 landing mobile** | **2.819%** | **2.05%** | **1.73%** | **1.18%** | 33 |

Reproduce with `node tests/tools/classify.mjs <screen>-<viewport>`.

### 2.2 The residual scales with how much text is on screen

The same component measures differently depending only on text volume. §03 is
the same `ChartGrid` at both viewports; at 390 the element screenshot clips to
a narrower slice, so there is less type in frame:

- §03 desktop — 1136px of chart in frame — **1.636%**
- §03 mobile — 346px of chart in frame — **0.429%**

Geometry is identical (114 boxes) in both. Only the glyph count changed.

### 2.3 Metrics match; rasterisation does not

The mockup pulls IBM Plex and Noto Serif from Google's CDN as variable fonts.
The app self-hosts static instances of the same families through `next/font`.
Measured on §05, on the first bold run of the reading:

| | reference | candidate |
|---|---|---|
| computed family | `"Noto Serif", Georgia, serif` | `"Noto Serif", "Noto Serif Fallback", Georgia, serif` |
| computed weight | 600 | 600 |
| computed size | 14.5px | 14.5px |
| advance width of `Dậu` | **28.906px** | **28.906px** |

Identical advance, identical wrapping, identical box for all 24 measured
elements — and the diff image shows differences only on lines that contain a
bold run, while lines of plain 400-weight text are pixel-identical.

**An attempt to remove the variable was made and rejected.** Replaying the
app's own `@font-face` rules into the reference (same-origin, served from
`public/__parity/`) changed the *reference's* own metrics — §05 went from
1414px to 1334px tall, i.e. it stopped resolving Noto Serif and silently fell
back. That would have made the reference disagree with both itself and the app,
so the harness measures against the unmodified reference and reports the
residual honestly instead.

`PLAN.md` §10.3: *"Diffs concentrated on text antialiasing are acceptable."*
This is that case, and §2.1–2.3 is the evidence rather than the assertion.

> **Settled by firstmate, 2026-09-04:** the residual is accepted and is not to
> be chased further. The app stays on self-hosted `next/font` — it is the
> better engineering choice than pulling the same families from a CDN to make a
> number smaller — and the reference stays unmodified, since §2.3 shows that
> patching it breaks its own metrics.

---

## 3. §01 Landing — the only screen with geometry mismatches

Every one of them traces to the same root cause: **the mockup draws product
surfaces the app does not have** (settled in §5.1). After those three elements
are excluded (§4), what remains is:

| Mismatch | Reference | Candidate | Cause |
|---|---|---|---|
| `.band` height | 544px | 567px | the submit button |
| `.field[2]` / `.inp[2]` at 390px | 87.5 / 64px | 66.5 / 43px | the giờ sinh control |
| `.brand` width at 390px | 117.5px | 26px | the wordmark collapses to the mark so the language selector fits the bar — **intended, see §10.3** |
| `.appbar nav` at both viewports | 163px @ left 1255 / 205 | 200px @ left 1218 / 168 | the language selector is right-aligned inside the nav — **captain's instruction 2026-09-04, see §10** |

The first two are **reference-markup artefacts**, not design mismatches:

1. **The submit button.** The mockup renders every button as a `<span>`. An
   inline `<span>` ignores the mockup's own `.btn.wide { width: 100% }` rule and
   sizes its box to the glyph extent rather than the line box, so it measures
   162.3×44. A real `<button class="btn pri wide">` honouring that same rule is
   382×47.7. The app is following the mockup's stylesheet; the mockup is not.

2. **Giờ sinh at 390px.** The mockup's control is a `<div class="inp mono">`
   carrying the text `Ngọ · 11:00–12:59`, which wraps to two lines in a 148.5px
   column (64px tall). A real `<select>` renders one line (43px) and cannot
   wrap. Replacing the select with a non-input to match would remove a working
   form control.

Neither is fixable without making the app worse, so both are reported rather
than chased.

The last two are not artefacts at all: they are deliberate changes, decided
above this worktree and **authorised on 2026-09-04** — the language selector's
right-aligned placement (captain) and the wordmark collapse it forces at 390px.
§10 is their measurement and their reasoning. They are listed here so that
§01's counts — 2 at desktop, 15 at mobile — have an entry for every member, not
to suggest either is a defect.

---

## 4. Masks — every one, with its reason

Masks are applied to **both** sides unless the element exists only on the
reference. `hide` blanks the region and keeps its box; `collapse` takes it out
of the flow, used only where the excluded content's own width or height is the
thing that differs. Declared in `tests/parity/screens.ts`.

| # | Screen | Region | Mode | Why |
|---|---|---|---|---|
| 1 | all result tabs | `.fab` (candidate only) | hide | The chat FAB is fixed chrome floating over every result tab. The mockup draws no equivalent, and it overlaps the captured region. |
| 2 | §01 | `.appbar nav a:nth-of-type(2), :nth-of-type(3)` (reference only) | collapse | The mockup's appbar carries **Cách xem** and **Về thuật toán** — links to pages the app does not have. See §5. |
| 3 | §01 | `.hero .acts .btn:nth-of-type(2)` (reference only) | collapse | The mockup's hero offers **Xem lá số mẫu**. See §5. |
| 4 | §05 | `.paper-foot span:last-child` ↔ `[data-parity-volatile]` | collapse | The mockup prints `Trang 3 / 5`, a PDF page counter with no meaning on a scrolling screen; the app shows the reading's word count in the same slot. Collapsed rather than hidden because at 390px the two strings wrap the footer differently, and the wrap is a property of the excluded text. |
| 5 | §06 | `.chat` | hide | The mockup shows a mid-conversation with a model answer and a typing indicator. That state is only reachable through a live API call and cannot be made deterministic. The panel's own anatomy is unmasked on the chat capture and matches. |

**Measured cost of masks 2 and 3:** removing them takes §01 from 2.819% →
9.564% at mobile and adds 36 further geometry mismatches, all of them offsets
cascading from the taller reference appbar. That is the size of the gap in §5.

---

## 5. Divergences from the mockup, and why

Ordered by how much they matter.

### 5.1 Two nav links and a sample-chart button have no destination — **settled**

> **Decision:** ship the app's real navigation. **Decided by the captain,
> 2026-09-04.** Raised under `PLAN.md` §6 (*"stop and raise it, do not invent a
> treatment"*) rather than guessed at.

The mockup's landing shows a four-item appbar (`Trang chủ`, `Cách xem`,
`Về thuật toán`, `Lập lá số`) and two hero actions (`Lập lá số ngay`,
`Xem lá số mẫu`). The app has one page and one form. The three options were:
accept the app's real two-item nav and single CTA; build two content pages and
a production-reachable demo chart; or ship dead links.

**The app keeps its honest two-item nav and its single call to action.** No
content pages, no demo chart, and no dead or disabled links. The reference's
three extra elements are excluded from the §01 comparison by masks 2 and 3,
which stay exactly as they are.

**What accepting this bought, measured.** Removing masks 2 and 3 takes §01 from
2.819% to **9.564%** at 390×844 and adds **36 further geometry mismatches** —
all of them offsets cascading from the taller reference appbar, which wraps to
two lines at that width with four items in it. That number is the size of the
gap, recorded so a future reader can see what was accepted rather than having
to re-derive it.

**This is not a defect to correct later.** Building a `Cách xem` page, a
`Về thuật toán` page and a production-reachable sample chart is *additive
follow-up work* — new product surface, which `PLAN.md` §1 lists as a non-goal
for this task. If it is ever built, the masks come out and §01 converges on the
mockup without anything in the redesign changing.

### 5.2 Corrected colour tokens — deliberate, per `DESIGN.md` §4.5

`DESIGN.md` §4.5 corrects three tokens that fail WCAG AA in the mockup, and
§15 says the mockup should be corrected to match when next touched. The harness
does exactly that to the reference before comparing, in `REFERENCE_PATCH`:

```
--tx3:   #5c6d89 → #7d8ca8   (3.61:1 → 5.66:1)
--tx4:   #3b4860 → #717e98   (2.09:1 → 4.70:1)
--p-tx3: #8a7f6e → #6f6656   (3.66:1 → 5.30:1)
```

The failing values survive in the app only as `--tx-ghost` (decorative marks,
never text) and inside the print-variant token map, which is verified by
`tests/tools/token-audit.sh`.

### 5.3 The mockup's đại vận header contradicts its own table

The mockup's §04 header reads `đang đi · 24–33 tuổi · Phu Thê · năm 3/10` with
a 30% progress bar, while its own table gives that decade as **2017–2026** and
the document is dated **2026-09-03**. Those cannot both be true: 2026 is the
tenth year of 2017–2026, not the third.

`PLAN.md` §5.6 requires the bar be *"computed from the current year, not
hardcoded"*, so the app computes `năm 10/10` and a full bar. The difference is
a reference defect, and it is most of §04's 0.615% / 0.481%.

### 5.4 Reference document chrome removed before capture

The mockup is a design document: every screen sits in a device frame inside a
1240px page with 20px padding. `REFERENCE_PATCH` strips that chrome (`.doc`
padding, `.frame` border, `.frame-bar`, `.nav`, `.doc-head`, `.sec-bar`,
`.sec-note`, `.foot`) so the framed app is exactly viewport-wide and both sides
lay out at the same content width at the same nominal viewport. Nothing inside
`.app` is touched. This is why the captured widths agree exactly — 1440/1180 on
desktop, 390 on mobile — on every screen.

### 5.5 Smaller, deliberate departures

| What | Mockup | App | Why |
|---|---|---|---|
| Vận hạn "Sao mượn" | shown on đại hạn only | đại hạn borrows, lưu niên names the palace as it stands, lưu nguyệt shows no star row | A ten-year window over a vô chính diệu palace is read through its đối cung; a one-year window is not. Matches the mockup's own three cards. |
| Đại vận `mượn …` | shown on the running decade only | same | `PLAN.md` §5.6 puts vô chính diệu decades in `--tx4` italic; the running decade names what it borrows so it agrees with the Điểm nổi bật card. |
| Drawer tam hợp | `Sửu · Tỵ` | `Quan Lộc (Sửu) · Tài Bạch (Tỵ)` | `DESIGN.md` §9.3 requires the relationship mirrored **as text** for screen-reader users; naming the palaces does that, and still fits one line, so the geometry is unchanged. |
| Giờ Tý hint under the form | — | removed | `DESIGN.md` §12: labels are nouns, not instructions. Both Tý options are visible in the select. |
| Nơi sinh, Mô tả bản thân | not drawn | kept | Existing features feeding the Gemini prompt. Taken out of the flow for the §01 capture only (`candidateSetup`), never removed from the app. |

---

## 6. Token audit — `PLAN.md` §10.4

`./tests/tools/token-audit.sh`

```
── 1. retired palette hexes ──────────────────────────────────────────
retired hexes                                  0 hit(s)
── 2. the three values DESIGN.md §4.5 corrects ───────────────────────
superseded token values                        0 hit(s)
── 3. radii above 3px ────────────────────────────────────────────────
tailwind radius utilities                      0 hit(s)
border-radius over 3px in CSS                  0 hit(s)
── 4. atmosphere: blur, glow, shadow, gradient text ──────────────────
blur / backdrop / glow / gradient text         0 hit(s)
── 5. animate- utilities outside the motion layer ────────────────────
tailwind animate- utilities                    0 hit(s)
── 6. box-shadow, which is only the focus ring and the seg control ───
box-shadow outside the allowed set             0 hit(s)

TOKEN AUDIT: clean
```

Documented exceptions, encoded in the script:

- `#3b4860` survives once, as `--tx-ghost` — decorative marks only, never text.
- `#8a7f6e` and `#a89c88` survive once each, inside the print-variant token map
  (`PLAN.md` §8.4), where they are ink on paper rather than text on night.
- `box-shadow` is permitted for the cyan focus ring, the segmented control's
  `inset 0 -2px 0`, the palace/candidate relationship insets (`DESIGN.md` §9.2)
  and the đại vận row edge — all inset structure, no elevation.

The audit caught two real regressions during the build: `src/app/icon.svg` was
still drawn in the retired palette with a `feGaussianBlur` glow (redrawn as the
brand mark), and the palace relationship inset was not in the allowlist.

---

## 7. Export — `PLAN.md` §8, performed not asserted

`node tests/tools/export-pdf.mjs <out.pdf>` drives the real **Xuất PDF** button
in a real browser and saves the download.
`node tests/tools/pdf-render.mjs <out.pdf> <dir>` renders every page.

Result: **3 pages, all dark ink on light paper.**

| Page | Content | Verified |
|---|---|---|
| 1 | Document head, seal, `Trang 1 — Thông tin tổng quan`, the key/value summary | Ink `#221e18` on `#fbf8f1`; all eight rows legible |
| 2 | `Trang 2 — Lá số 12 cung`, the full print-variant grid | All 12 palaces; chính tinh, phụ tinh, sao lẻ, tứ hóa chips (Kỵ in vermilion), can chi, vòng Trường Sinh/Bác Sĩ, đại vận ranges, `[ Thân ]`, the Mệnh rule, the đại vận rule and tint, the centre panel |
| 3 | The reading on paper | Serif at 14.5px, section headings in vermilion, both `.sealq` citation blocks, the stamped seal, the footer |

Three defects were found by opening the file and fixed:

1. **Every palace cell painted solid teal.** The hover/relationship inset lives
   on `.pal::after` as `box-shadow: inset 0 0 0 0 var(--cyan)` — zero spread,
   invisible in a browser, but `html2canvas-pro` rasterises it as a solid fill.
   The print variant has no interaction states, so the layer is now removed
   there.
2. **The running đại vận cell stayed dark.** `#0d1a1e` was a literal hex, so
   the print token map could not reach it. It is now `--dv`, overridden in the
   print scope.
3. **The summary card on page 1 stayed dark.** The print token map was scoped
   to `.chart.print` only. It now applies to every print container
   (`.chart.print, .paper.print`), so cards, key/value lists and chips invert
   with it.

Known cosmetic limitation: `html2canvas-pro` does not render `::marker`, so
list bullets are absent from the PDF. The items keep their indent and bold year
labels and still read as a list.

---

## 8. Reproducing

```
npm run test        # 106 unit tests — relationship maths, branch map, đại vận,
                    #   print variant, vocabulary completeness, prompt packs, cache key
npm run parity      # 12 parity screens + 6 reduced-motion + 20 locale-stress tests
./tests/tools/token-audit.sh
node tests/tools/a11y-check.mjs                       # needs a server on :3000
node tests/tools/export-pdf.mjs /tmp/tuvi.pdf vi-VN   # locale is the second argument
node tests/tools/export-pdf.mjs /tmp/tuvi-ko.pdf ko-KR
node tests/tools/pdf-render.mjs /tmp/tuvi.pdf /tmp/tuvi-pages
```

`npm run parity` stops any running dev server and starts its own on port 3100.
Next 16 permits one dev server per project directory, and Turbopack will serve
a stale stylesheet to a headless client — which produced wrong numbers twice
during this build before the runner took ownership of the server. P5 added a
warm-up pass over every route before the first capture: on a cold `.next` the
harness could otherwise measure a page whose stylesheet was still arriving, and
report it as a page-wide geometry failure that was entirely an artefact.

Since P5 the app negotiates its locale from `Accept-Language`, and Playwright
sends `en-US` by default. `tests/parity/parity.spec.ts` and
`reduced-motion.spec.ts` therefore pin `locale: 'vi-VN'`. Without that the
harness compares an English render against the Vietnamese mockup, which it will
happily do, and every screen fails.


---

## 9. Accessibility — `PLAN.md` §10.5, measured

`node tests/tools/a11y-check.mjs`

### 9.1 Contrast

Sampled from live elements on the chart, with translucent layers composited
over what is actually behind them:

| Token in use | Size | Measured | Needs | |
|---|---:|---:|---:|:--|
| `--tx4` sao lẻ | 10px | **4.70:1** | 4.5 | ✅ |
| `--tx4` centre hint | 11px | 4.88:1 | 4.5 | ✅ |
| `--tx3` brightness | 9.5px | 5.65:1 | 4.5 | ✅ |
| `--tx3` vòng Trường Sinh | 9.5px | 5.65:1 | 4.5 | ✅ |
| `--tx3` legend | 11.5px | 5.87:1 | 4.5 | ✅ |
| `--sig` Hóa Kỵ chip, over its own tint | 10px | 5.07:1 | 4.5 | ✅ |
| `--tx2` can chi | 10.5px | 7.76:1 | 4.5 | ✅ |
| `--cyan` phụ tinh at .85 | 11px | 9.87:1 | 4.5 | ✅ |
| `--amber` chính tinh | 13.5px | 10.00:1 | 4.5 | ✅ |
| `--tx` palace name | 12.5px | 16.41:1 | 4.5 | ✅ |

Worst measured: **4.70:1**, the `--tx4` sao lẻ that `PLAN.md` §10.5 names as the
most likely failure. It passes because `DESIGN.md` §4.5's correction was
applied rather than the mockup's value.

### 9.2 Keyboard and layout

| Check | Result |
|---|---|
| `:focus-visible` on every interactive element | 62 focusable elements across landing / chart / reading / vận hạn — **0 without a visible ring** |
| Relationship set reachable without a pointer | Yes — bound to `focus` as well as `hover`, and mirrored as text in the drawer's fourth column. Asserted in `tests/unit/chart-grid.test.tsx`. |
| Body horizontal scroll | **0px overflow** at 1440, 390 and 320px on all four screens. The chart's own `.chart-scroll` is the only sideways scroller. |
| Reduced motion | 6 Playwright assertions in `tests/parity/reduced-motion.spec.ts`, all green: cells resolved, top rules drawn, relationship lines present but static, đại vận bar at its computed width, seal stamped, counters landed, `document.getAnimations()` empty — plus one inverse test proving the astrolabe does turn when motion is allowed. |
| Vietnamese at the smallest size shipped | `Tỵ Sửu Dậu Mệnh Phụ Mẫu Tật Ách Nô Bộc` rendered at 9px in real IBM Plex Mono (not a fallback), diacritics intact. `node tests/tools/fontcheck.mjs out.png` |

### 9.3 The app still works

Driven end to end against live `iztro` data, not the fixture: form → analyse →
result, all five tabs, palace drawer, decadal table. 12 palaces, no missing-cung
banner, the running decade marked. **No console or page errors on any route** —
which is how the astrolabe's server/client float drift was found and fixed
(`r3()` in `Astrolabe.tsx`).

---

# Phase P5 — Multilingual

`PLAN.md` §13b, `DESIGN.md` §15. Five locales: `vi` (default), `zh-Hans`,
`zh-Hant` (Cantonese), `ko`, `en`. Everything below is measured; the commands
are in §8.

## 10. The app-bar language selector — **captain, 2026-09-04**

> **Current arrangement.** The app bar reads
> `[brand] ......... [nav links] [language selector] [primary action]`.
> The selector is right-aligned, inside the nav cluster, immediately before the
> page's primary action. **Decided by the captain, 2026-09-04.**
>
> This **supersedes** the middle placement that firstmate ratified earlier the
> same day. §10.6 keeps that earlier reasoning as history so it is not mistaken
> for the current one — the whole point of writing it down is that a future
> reader does not "fix" the selector back into the middle and undo the
> captain's instruction.

### 10.1 What the arrangement costs, measured

Right-aligning the selector puts its width **inside the right-hand cluster**
instead of in the slack in the middle, so the nav gets wider and its left edge
moves. This was expected and authorised in advance.

| | `.appbar nav` before | after | change |
|---|---:|---:|---|
| Landing (`Trang chủ` + CTA) | 163px | **200px** | +37px, left edge −37px |
| Result (`Lập lá số mới` + `Xuất PDF`) | 194.1px | **231.1px** | +37px, left edge −37px |

37px is the selector's 32px plus one 5px nav gap. **The app bar's own height is
unchanged at 62.4px** on every page and both viewports, so nothing below the
bar moves.

Geometry mismatches added, both on §01:

```
§01 landing @ 1440×900
  .appbar nav[0]: ref 13,1255,163,35.5   cand 13,1218,200,35.5
§01 landing @ 390×844
  .appbar nav[0]: ref 13,205,163,35.5    cand 13,168,200,35.5
  .brand[0]:      ref 17.5,22,117.5,26   cand 17.5,22,26,26
```

### 10.2 Why only §01 reports it — read this before trusting "§02: 0"

The nav moved on **every** page that has one. The geometry gate reports it on
§01 only, and that is a property of the harness rather than of the app:

- §01's selector list contains **`.appbar nav`**, so the box that moved is
  measured.
- §02's list contains **`.appbar`** and not `.appbar nav`. The bar's own box —
  full width, 62.4px tall — is unchanged, so §02 reports zero.

§02's **pixels did move**: 2.089% → 2.119% at desktop and 3.212% → 3.277% at
mobile. That is the nav shifting 37px left, visible to `pixelmatch` and simply
not gated by §02's selector list. **"§02: 0 mismatches" here means "no box in
§02's list moved", not "nothing moved".**

### 10.3 The 390px case, re-checked

The captain asked specifically whether the new arrangement changes the
threshold at which the wordmark has to collapse. Measured on both pages at
390px, with the `max-width: 460px` collapse disabled:

| Page at 390px | Without the collapse | Verdict |
|---|---|---|
| Landing — nav 199.8px | bar **62.4px**, brand 117.4×26 | wordmark **fits**; collapse not needed |
| Result — nav 231.1px | bar **71.9px**, brand 98.9×**44.9** (wrapped) | wordmark **does not fit**; collapse still needed |

**So the collapse is still required, and the result page is what requires it.**
The landing alone would no longer need it.

It is kept at **one breakpoint for both pages** rather than scoped to the result
page. Scoping it would return §01 mobile's `.brand` to 117.5px and remove a
mismatch, which is precisely the wrong reason to do it: the brand would then
render differently on two pages at the same width, and the wordmark would
vanish as the reader navigated from the landing to the result. Consistent
chrome is worth more than a mismatch count.

### 10.4 How it reads

At 1440px the bar is `✦ Tử Vi Đẩu Số` … `Lập lá số mới · VI ▾ · Xuất PDF`. At
390px the wordmark collapses and it is `✦` … `Lập lá số mới · VI ▾ · Xuất PDF`.
Both were captured and looked at. The selector reads as a secondary control
between two buttons — smaller, dimmer, with its own dropdown affordance — and
the primary action stays visually last. Nothing is cramped at 390px and nothing
wraps.

### 10.5 What did not change

The bar height, the brand's left edge, and every box below the app bar are
identical at both viewports. §03–§06 are byte-identical to the previous run.
The selector is still 32px and still shows the locale's tag (`VI · 简 · 繁 · 한 ·
EN`), each in its own script, with the full endonyms on the `<option>`s.

### 10.6 History — the superseded middle placement

*Kept only so the current arrangement is not "corrected" back to it.*

The selector was first placed **between the brand and the nav**. `nav` is pushed
right by `margin-left:auto`, so a sibling before it takes its width out of the
middle and moves neither the brand nor the nav — which kept the app bar off the
parity screens' geometry entirely. That was chosen to satisfy `PLAN.md` §13b.6,
raised as a `needs-decision` because it still forced the wordmark to collapse at
390px, and **ratified by firstmate on 2026-09-04** with this reasoning:

> *"`PLAN.md` §13b.2 requires the switcher to live in the app bar, which rules
> out (c). The regression guard exists to catch i18n silently breaking layout,
> not to forbid a required new control from occupying space — and (a) honours it
> best in practice: one box moves versus roughly sixty under (b)."*

The captain overrode it the same day in favour of right-alignment, which is his
call. The trade he accepted is stated plainly in §10.1: the nav moves on every
page, and §01 carries two geometry mismatches instead of one.

The measurement that produced the original placement still stands and is still
useful, because it is what makes the collapse in §10.3 necessary rather than
cosmetic: **the app bar has only 18.5px of slack at 390px** once the brand and
the result page's nav have taken their width, and the reference mockup's own §02
bar measures identically — brand 117, nav 194, bar 62.4px. The design never had
room for a third control at that width; the only question was where the cost
would land.

---

## 11. Layout stress, per locale — `PLAN.md` §13b.6

`tests/parity/locale.spec.ts`, 20 tests, all green. These captures are **not**
compared to the mockup — the mockup is Vietnamese, so there is nothing to
compare a Korean render against. What is asserted is that the twelve-palace
grid survives the other scripts.

| Locale | Viewport | `data-script` | CJK/Hangul runs | Cell overflow | Clipped | Below 11px | Body scroll |
|---|---|---|---:|---:|---:|---:|---|
| `vi` | 1440×900 | latin | 21 | 0 | 0 | **0** | 1440/1440 |
| `vi` | 390×844 | latin | 17 | 0 | 0 | **0** | 390/390 |
| `zh-Hans` | 1440×900 | hans | 607 | 0 | 0 | **0** | 1440/1440 |
| `zh-Hans` | 390×844 | hans | 601 | 0 | 0 | **0** | 390/390 |
| `zh-Hant` | 1440×900 | hant | 607 | 0 | 0 | **0** | 1440/1440 |
| `zh-Hant` | 390×844 | hant | 601 | 0 | 0 | **0** | 390/390 |
| `ko` | 1440×900 | hangul | 607 | 0 | 0 | **0** | 1440/1440 |
| `ko` | 390×844 | hangul | 601 | 0 | 0 | **0** | 390/390 |
| `en` | 1440×900 | latin | 21 | 0 | 0 | **0** | 1440/1440 |
| `en` | 390×844 | latin | 17 | 0 | 0 | **0** | 390/390 |

The 17–21 dense runs at `vi` and `en` are the fixed 紫微斗數 marks — the centre
panel, the paper seal and the print header — which are Han in every locale.
They are why the 11px floor is enforced at `vi` too.

Screenshots: `tests/parity/out/locale-<locale>-<screen>-<viewport>.png`.
Per-run probes: `tests/parity/out/results/locale-*.json`.

### 11.1 Test 8 — the 11px floor found three real violations

`DESIGN.md` §15.3 says never below 11px, and measuring the rendered DOM rather
than reading the stylesheet caught three rules the eye had not:

| Rule | Was | Now | Note |
|---|---|---|---|
| `.print-head .sl` | 9px | **11px** | 紫微斗數 in the PDF header — Han in **every** locale, so this broke the floor at `vi` too. Fixed globally; the box is a fixed 44×44 grid cell, so nothing moved. |
| `.pal-f .rt`, `.borrow` | 10.5px | **11px** | can chi column and the borrow chip. Raised for dense scripts only. |
| `.paper-foot`, `.print-lab` | 10.5px | **11px** | paper document chrome. Raised for dense scripts only. |

`.print-foot` keeps its 10px: it carries digits and `tuvi.app` and no
translated word. `.dr` (đại vận range) keeps 10px for the same reason —
`DESIGN.md` §15.3 holds the numeral run at the Latin size deliberately, so the
grid's tabular alignment is not disturbed.

### 11.2 Test 7 — the leakage sweep, and its three exclusions

Every text node in the rendered DOM is swept for a Vietnamese diacritic at each
non-`vi` locale. **`vi` runs the identical sweep as the control and must find
Vietnamese** — otherwise an empty result elsewhere would prove only that the
sweep was broken.

Three kinds of text are Vietnamese by design and are excluded. Each is narrow
and named, because a broad exclusion is how a real leak hides:

1. `select.lang-sel` — every locale is listed in its own endonym, so
   `Tiếng Việt` appears in the Korean interface on purpose.
2. `.prose-interpretation` — the deterministic fixture ships **one canned
   Vietnamese reading** (`src/lib/fixture.ts`) because it exists to pin the
   *layout*. A real request produces the reading in the reader's language;
   that is what `tests/unit/prompt.test.ts` checks instead.
3. The subject's own name — data the reader typed.

Everything else is swept, including the off-screen print block that the PDF
export captures.

---

## 12. The vocabulary — what came from `iztro` and what did not

`src/lib/i18n/vocabulary.ts`, 193 concepts × 5 locales. `PLAN.md` §13b.3:
*"Do not generate them from memory alone — cross-check against the `iztro`
package … Where `iztro` has no entry, say so in the report rather than
inventing a term."* This is that report.

The table is **generated** from `iztro/lib/i18n/locales/{vi-VN,zh-CN,zh-TW,ko-KR,en-US}`,
so the Vietnamese, Simplified, Traditional and Korean columns are iztro's own
data except where listed below. Traditional is iztro's authored `zh-TW` column;
`tests/unit/vocabulary.test.ts` asserts eight pairs where the two Chinese
columns genuinely differ (`命宫`/`命宮`, `禄`/`祿`, `庙`/`廟`, `迁移`/`遷移`,
`仆役`/`僕役`, `官禄`/`官祿`, `廉贞`/`廉貞`, `七杀`/`七殺`) — if either column
were ever transformed from the other, that test fails.

### 12.1 Cells iztro has no real entry for

| Cells | iztro ships | Authored as |
|---|---|---|
| Korean brightness ×7 | `[+3]`…`[-3]` — numeric placeholders | 묘 · 왕 · 득 · 이 · 평 · 불 · 함, the Sino-Korean readings of 廟旺得利平不陷. `DESIGN.md` §15.2 confirms 묘 for miếu. |
| English brightness ×7 | `[+3]`…`[-3]` | exalted · prosperous · gained · benefited · even · weakened · fallen. `DESIGN.md` §15.2 gives *exalted* for miếu. |
| English tứ hóa ×4 | `A` · `B` · `C` · `D` | Prosperity · Authority · Merit · Adversity |
| `Đào Hoa` (桃花), all 5 | **absent from iztro's star table** | 桃花 · 桃花 · 도화 · Tao Hua. It is on the reference chart, so it has to resolve. |
| `vô chính diệu`, `mượn`, `tam hợp`, `xung chiếu` | **absent** — they are relations, not stars | 無正曜/无正曜 · 借 · 三合 · 沖照/冲照, and their Korean and English |

### 12.2 Four cells where iztro's own data is wrong

Each is a reading that does not correspond to its hanzi. Reported rather than
trusted:

| Concept | iztro | Corrected to | Why |
|---|---|---|---|
| `originalPalace` ko (來因) | 라인 | **내인** | 라인 is a romanisation of "line", not a reading of 來因 |
| `originalPalace` zh-Hant (來因) | 来因 | **來因** | the Simplified 来 leaked into the Traditional file |
| `tiande` ko (天德) | 복덕 | **천덕** | 복덕 is the reading of 福德, a different star |
| `suipo` ko (歲破) | 태파 | **세파** | 태 is the reading of 太, not 歲 |
| `jiekong` ko (截空) | 절중 | **절공** | 중 is the reading of 中, not 空 |

### 12.3 Two iztro readings deliberately left alone

Both are defensible in the Korean literature, so they stay as iztro has them
and are flagged rather than "corrected":

- `lucunMin` (祿存) → **록존**. Korean 두음법칙 would normally give 녹존, but
  록존 is common in Korean 자미두수 texts.
- `suijian` (歲建) → **태세**. That is 太歲, which many texts treat as a synonym
  of 歲建 rather than an error.

### 12.4 The English column is a policy, not a lookup

iztro's `en-US` is a set of **epithets**, not names: 紫微 is `emperor`, 左輔 is
`officer`, 命宮 is `soul`. `DESIGN.md` §15.2 asks for something else —
`MENH → 'Life Palace'` and `TU_VI → 'Zi Wei'` — so English is authored to that
policy:

- **Palaces** translate for comprehension: Life Palace, Wealth, Travel, Fortune.
- **Every star name** is the Mandarin transliteration of the Simplified cell in
  the same row: Zi Wei, Tian Ji, Zuo Fu, Wen Chang. Deterministic from the
  hanzi, and checkable against it in the same line of the table.
- The **twelve life stages** keep iztro's own English words, capitalised
  (Birth, Infancy, Adolescence … Nurture) — it is a real comprehension
  translation of 長生十二神.
- Stems and branches are iztro's lowercase pinyin, capitalised. One iztro
  typo is corrected: 午 reads `woo`; the pinyin is `wu`, which collides with 戊
  in English exactly as it does in Mandarin.

Two Vietnamese collisions are carried into English unchanged rather than
papered over with invented disambiguators: 蜚廉 and 飛廉 are both `Phi Liêm`
and both `Fei Lian`; 劫殺 and 劫煞 are both `Kiếp Sát` and both `Jie Sha`. The
`domain` argument to `term()` disambiguates the lookup; the display collision
is pre-existing and identical in Vietnamese.

### 12.5 Six spellings the app renders that iztro does not

Aliases, not concepts — each points at the iztro row it is the same term as:
`Mộc Dục`→`Mục Dục`, `Lực Sĩ`→`Lực Sỹ`, `Bác Sĩ`→`Bác Sỹ`,
`Phượng Các`→`Phụng Các`, `hãm`→`Hạn` (the chart legend's spelling),
`Tử Tức`→`Tử Nữ`.

---

## 13. The Gemini prompt and the context cache — `PLAN.md` §13b.4

### 13.1 The prompt is fully per locale

`src/lib/prompt/{vi,zh-Hans,zh-Hant,ko,en}.ts`. Each pack carries the system
instruction, the cache seed, the chained-reasoning task with its output
template, the chat instruction, and the labels on the chart data.

`tests/unit/prompt.test.ts` asserts **structural identity across all five**, so
a translation cannot quietly drop a section:

| Assertion | All five packs |
|---|---|
| `## 1.` … `## 11.` output sections, in order | ✅ |
| `[A]`…`[K]` internal reasoning steps | ✅ |
| Exactly 17 `□` self-check points | ✅ |
| Every `DataLabels` field non-empty, all five elements present | ✅ |
| No Vietnamese in the instructions or labels (non-`vi`) | ✅ |

The chart data handed to the model goes through `term(…, locale)` as well, so a
Korean reading is reasoning over 자미 and 명궁 rather than over `Tử Vi` and
`Mệnh` — `DESIGN.md` §15.5.

Two deliberate departures from a literal translation:

- **Cantonese takes formal 書面語** with Hong Kong lexicon (資料 not 数据,
  預設 not 默认, 伺服器, 匯出), and the system instruction says so in as many
  words, per `DESIGN.md` §15.5.
- **The length target is converted, not copied.** Vietnamese asks for ≥150
  words per palace and ≥5000 words total. A Chinese or Korean *character* is
  not a Vietnamese *word*, so those locales ask for ≥250 characters per palace
  and ≥8000 total — equivalent depth, not an equivalent number. English keeps
  the Vietnamese figures.

### 13.2 The cache is per locale and **is not slower**

`PLAN.md` §13b.4 names both the hazard and the constraint: the cache bundles
the system instruction, so one shared cache serves a Korean reader a Vietnamese
preamble — and *"a full analysis currently takes ~3 minutes. Do not make this
worse."*

Both hold, and the reason is that the expensive part of the cache is not the
system instruction:

| | Before | After |
|---|---|---|
| PDF uploads | 1 | **1** — `_findExistingFile()` looks for the uploaded `horoscopes-reference-book` before uploading, so the five caches reference the same file URI |
| Caches | 1 | 5, created lazily — only the **first ever** request in a locale pays a creation; the TTL is 90 days |
| Requests that hit a warm cache | all | all |
| `vi` cache display name | `horoscopes-knowledge-base` | **unchanged** — the default locale finds and reuses the cache that already exists in the deployed project and pays nothing |

`tests/unit/prompt.test.ts` asserts the five display names are distinct, and
that `vi`'s is still the original.

The in-memory analysis cache in `api/analyze/route.ts` is keyed by locale too:
the same birth data in two locales is two different readings.

### 13.3 Locale routing

`src/proxy.ts` — Next 16 renamed the `middleware` convention to `proxy`
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
Resolution order is **`?lang=` → cookie → `Accept-Language` → `vi`**, and the
answer is handed to the render on a request header, so the locale is fixed
before first paint and there is no flash of Vietnamese.

**The path is never rewritten or redirected.** `/result?tab=chart&fixture=tuvi-ty`
is the same URL it was before this phase — which is what lets the twelve parity
screens keep their addresses, and what keeps existing links working per
§13b.2. `?lang=ko` is remembered in a cookie, so a link can still be shared in
a chosen language without the app growing a `/[lang]` path segment.

---

## 14. Fonts — a measured departure from `DESIGN.md` §15.4's mechanism

§15.4 names Noto Sans/Serif SC, TC and KR, *"loaded only for the active
locale — CJK families are large and must never all ship at once"*.

The families are as specified. **The delivery is not `next/font/google`, and
the reason is measured:**

- `next/font`'s own Google-fonts data lists **no CJK subset** for these
  families — only `cyrillic`, `latin`, `latin-ext`, `vietnamese`
  (`next/dist/compiled/@next/font/dist/google/font-data.json`).
- With no subset to request, `findFontFilesInCss()` downloads and self-hosts
  **every** `@font-face` in the returned stylesheet. That stylesheet is
  **226 KB for Noto Sans SC alone**, before a single glyph — several hundred
  unicode-range slices per family. Six families of that at build time is
  precisely the "megabytes per locale" §15.7 forbids.

So the root layout links **one Google Fonts stylesheet, for the active locale
only** (`vi` and `en` link nothing at all). That is the delivery CJK webfonts
are designed for: one `@font-face` per unicode-range, and the browser fetches
only the slices whose glyphs are on the page — tens of kilobytes, not
megabytes. Behind Noto sits a system CJK stack (PingFang, Hiragino, Microsoft
YaHei/JhengHei, Apple SD Gothic Neo, Malgun Gothic, Source Han), so the text is
correct while the webfont loads and on a network that blocks it.

`IBM Plex Mono stays ahead of the CJK family in the mono stack`, per §15.4's
fallback-chain rule, so Latin digits and ranges (`24–33`, `2017–2026`) keep the
tabular alignment the grid depends on and only CJK glyphs fall through. This is
implemented as a `--cjk-mono` slot whose Latin default is the family that
already sat next in that stack, so **the Vietnamese and English rendering is
byte-identical** — which the §1 table confirms.

---

## 15. Export — the PDF in a CJK locale

`PLAN.md` §8's acceptance is *performed*, now in two locales:

```
node tests/tools/export-pdf.mjs /tmp/vi.pdf vi-VN
node tests/tools/export-pdf.mjs /tmp/ko.pdf ko-KR
node tests/tools/pdf-render.mjs  /tmp/ko.pdf /tmp/ko-pages
```

Both produce 3 pages of **dark ink on light paper**. Opened and looked at:

- **`vi` page 3** — the reading, correct diacritics, vermillion seal, left-ruled
  citation blocks. The pre-P5 acceptance is unchanged.
- **`ko` page 2** — the whole twelve-palace grid in Korean: 자미/칠살 with
  왕/평, 재백 44–53, 명궁 4–13 carrying 염정 록 and 파군 권, 차용 축 borrow
  chips, `[신]` Body Palace marker, and the 紫微斗數 seal legible at its new
  11px. No cell overflow, no clipped glyph, ink dark throughout.

`html2canvas-pro` rasterises the CJK webfont correctly; the zero-spread inset
`box-shadow` remains disabled on the print variant, as `AGENTS.md` requires.
