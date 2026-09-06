<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## The design system is CSS, not Tailwind utilities

The UI is **Thiên Văn Đài**. Its whole visual system lives in
`src/app/globals.css` as semantic component classes — `.pal`, `.pal-b`,
`.pal-f`, `.maj`, `.mut`, `.centre`, `.tl-row`, `.paper`, `.rel-ov`, `.kv`,
`.hl`, `.card` — transcribed from the reference mockup. Components emit those
class names; they do not rebuild the styling in utilities. Tailwind is present
and fine for one-off layout, but **a new surface reuses an existing component
class or adds one to `globals.css`.** Two spellings of the same component is
how the direction rots.

**The reading is lamplight on screen and paper on export**, through the one
`variant="print"` switch `ChartGrid` uses: `.paper:not(.print)` remaps the
`--p*` family to the `--l*` tokens, `.paper.print` keeps the root values. Both
exports — PDF *and* image — capture the off-screen `.paper.print` section owned
by `result/page.tsx`, never what is on screen. Never add a second theming
mechanism, and never point an export at the screen node: a near-black PDF has
already shipped once (`PARITY.md` §7).

The centre of the chart is the **đại vận dial**, computed from the chart's own
`decadalPeriods` and pinned to `referenceYear` like the đại vận bar, with the
segment maths in `src/lib/branches.ts` and unit-tested. `PARITY.md` §16 records
the settled decision, what it superseded, and the two AA corrections it makes to
the mockup.

Non-negotiables, all mechanically enforced by `./tests/tools/token-audit.sh`:
one radius (`3px`), no blur/glow/elevation shadow/gradient text, colour only
from the tokens, and anything that counts or dates set in the mono family.
Run the audit after touching styles.

## Five locales, and where each kind of text lives

`vi` (default) · `zh-Hans` · `zh-Hant` (Cantonese) · `ko` · `en`. Three
different kinds of text, three different homes — putting one in another's file
is the mistake this structure exists to prevent:

| | Lives in | Rule |
|---|---|---|
| Interface strings | `src/lib/i18n/messages/<locale>.ts` | `vi.ts` is the type source; the other four must satisfy `Messages` exactly |
| Domain vocabulary | `src/lib/i18n/vocabulary.ts` | one table, 193 concepts × 5. **Sourced from `iztro`'s own locale data, never written from memory** — `PARITY.md` §12 lists every cell that departs from it and why |
| The model's prompt | `src/lib/prompt/<locale>.ts` | the reading is the product; the instruction language, the output language and the vocabulary all follow the reader |

The chart is always generated in `vi-VN` (`src/lib/iztro.ts`), so the Vietnamese
column is the join key and `term(x, 'vi')` is the identity. That is what keeps
the Vietnamese parity screens still, and it means switching locale never
regenerates a chart. Render domain values through `useI18n().v(value, domain)`,
never raw.

`src/proxy.ts` resolves the locale (`?lang=` → cookie → `Accept-Language` →
`vi`) and hands it to the render on a header. It never rewrites the path, so
every URL is what it was. Next 16 renamed `middleware` to `proxy`.

## Judging the reading, not just the prompt

`prompt.test.ts` tests the prompt; **`npm run eval` tests what the model says**
against the chart it was given — placement, coverage, language, length,
structure. `EVAL.md` is the record, `tests/eval/out/<run>/` the raw readings.

Two things that will save a future session real money and real embarrassment:

- **The checkers are unit-tested with synthetic readings** and run in
  `npm run test`. Never spend an API call proving a checker works.
- **"Star not on the chart" is a vacuous check.** A complete chart places all
  fourteen major and all fourteen minor stars somewhere. What is worth checking
  is *placement* — the star is real, the chart is real, and the reading puts it
  in the wrong palace. `EVAL.md` §2.3 has the reasoning and the false positives
  that produced it.

Four things about the prompt that are easy to get wrong:

- **Editing `pack.system` has NO EFFECT while a cache exists.** The context
  cache is found by `displayName` only (`gemini-cache.ts`), never by comparing
  its content, and the TTL is 90 days. A changed system instruction is
  therefore silently ignored. Put per-request rules in `pack.task`, which is
  sent every time — or change the cache's display name deliberately.
- **A conditional section must be removed, not discouraged.** Sections 10 and
  11 are wrapped in `⟦BAZI⟧` / `⟦SELF⟧` markers and stripped by `renderTask`
  when their data is absent, because an instruction saying "skip this section"
  was measured being ignored by four of five locales. The markers are authoring
  syntax and never reach the model; `prompt.test.ts` asserts that.
- **A `>` line in a reading is a CITATION, not a quotation.** D1: the model
  names the cung and the sao behind each judgement on its own line, which
  `renderMarkdown` turns into the `.sealq` block, and `splitCitation` peels off
  the chat answer's into its `.cite` row. Both surfaces share that parser
  (`src/lib/markdown.ts`), but the chat bubble is not a document surface: its
  `bubble` variant makes a heading a bold lead-in line and renders a `>` line
  as prose, never a blockquote. New block syntax goes in that one file. A
  citation may name a second palace (the đối cung) — the mockup's own does —
  so anything checking one must attribute each star to the palace it FOLLOWS,
  never to the first palace in the line. `tests/eval/checks.ts`
  `segmentByPalace` is that rule.
- **Vietnamese in a `ko`/`zh` reading is almost always OUR bug.** `term()` looks
  up a whole value, so any code that splits a field before translating it must
  split exactly right — a tứ hóa entry is `"<hoá> <sao>"` and the sao is usually
  two words. Read the assembled prompt before blaming the model. `EVAL.md` §7.3.

## Before changing anything visual

Read `PARITY.md`. It records what was measured against the reference, which
divergences are deliberate, and which are reference defects — including the
three colour tokens that are deliberately *not* the mockup's values, the
settled decision (§5.1) that the landing keeps the app's real two-item nav
rather than the four-item one the mockup draws, and the settled decision (§10)
that the language selector is **right-aligned** in the app bar — captain's
instruction, 2026-09-04 — with the wordmark collapsing to the brand mark below
460px so it fits. §10.6 records an earlier, superseded placement; it is history,
not the current reason. Do not "fix" any of these back towards the mockup, and
do not move the selector back into the middle of the bar.

## Commands

| | |
|---|---|
| `npm run test` | Vitest — relationship maths, branch mapping, đại vận progress, print variant |
| `npm run parity` | Playwright — 12 parity screens + reduced-motion + 20 per-locale layout-stress tests |
| `npm run eval` | Reading quality — what the model SAYS, checked against the chart. **Real API calls, ~20 min. Never in `npm run test` or CI.** `--locale`, `--chart`, `--reuse`, `--tag`. See `EVAL.md`. |
| `./tests/tools/token-audit.sh` | The token/radius/atmosphere greps |
| `npm run typecheck` / `npm run lint` / `npm run build` | The usual gates |

`src/app/api/candidates/route.ts` carries three pre-existing
`@typescript-eslint/no-explicit-any` errors. They are known and out of scope;
lint is "green" when those three are the only output.

## Things that will waste your time otherwise

- **Anything headless must pin `locale: 'vi-VN'`.** The app negotiates its
  locale from `Accept-Language` and Playwright sends `en-US`, so a harness that
  does not say which locale it wants will compare an English render against the
  Vietnamese mockup and fail every screen. `parity.spec.ts`,
  `reduced-motion.spec.ts` and `export-pdf.mjs` all pin it.
- **`next build` and `next dev` share `.next`.** Running a build and then a dev
  server in the same directory can leave the dev server returning 404 for every
  route. `rm -rf .next` and restart.
- **CJK fonts cannot come from `next/font/google`.** It has no CJK subset for
  the Noto families, so it would self-host every unicode-range slice — a 226 KB
  stylesheet's worth per family, at build time. The root layout links one
  Google Fonts stylesheet for the active locale instead, with a system CJK
  stack behind it. `PARITY.md` §14 has the measurement.
- **Turbopack serves stale CSS to headless clients.** A Playwright run against
  a long-lived `next dev` will happily measure a stylesheet you already
  changed. `npm run parity` therefore stops any running dev server and starts
  its own (`tests/parity/run.mjs`) — Next 16 allows only one dev server per
  project directory, which is why it must stop yours first.
- **Fonts must load the `vietnamese` subset** (`src/app/layout.tsx`). Without
  it the browser falls back per glyph and diacritics change weight mid-word.
  Verify with `node tests/tools/fontcheck.mjs out.png`, which renders
  `Tỵ Sửu Dậu Mệnh Phụ Mẫu Tật Ách Nô Bộc` at 9px mono.
- **Never put a bare `overflow:hidden` on animated Vietnamese text.** It
  decapitates dấu nặng and dấu hỏi. Use the padding/negative-margin pair — see
  `.hero h1 .ln` in `globals.css`.
- **`html2canvas-pro` rasterises a zero-spread inset `box-shadow` as a solid
  fill.** It once painted every palace cell opaque in the exported PDF. The
  print variant disables that layer; keep it that way.
- **DESIGN.md §15.3's 11px floor is enforced on the rendered DOM**, not by
  reading the stylesheet — `tests/parity/locale.spec.ts` walks every text node.
  It found three rules the eye had not, including one that broke the floor at
  `vi` (紫微斗數 is Han in every locale). A new rule under 11px that can carry a
  translated word needs an entry in the `[data-script]` block at the foot of
  `globals.css`; a digits-only rule does not.
- **The export path is the paper surface, not the dark one.** If you touch
  `result/page.tsx`'s capture code, export a PDF and open it. `PARITY.md` §7
  has the two commands.

## The architecture diagram

`docs/architecture-{light,dark}.png` and the standalone viewer
`docs/astro-lens-architecture.html` are generated from
`docs/astro-lens.architecture.json` by the `archify` skill. Amend the JSON and
regenerate; never redraw the images by hand. All five READMEs embed the pair
through a `<picture>` block so it follows the reader's GitHub theme.

## The development-only fixture

`?fixture=tuvi-ty` on `/` and `/result` loads a canned textbook chart
(`src/lib/fixture.ts`) with the đại vận reference date pinned, so parity
snapshots do not rot at the year boundary. `loadFixture` returns `null` when
`NODE_ENV === 'production'`, so it cannot be reached in the deployed app —
verified against a real `next start` build. Route it through those helpers;
do not add a second door.

## Maintaining this file

Keep this file short and true. Record only knowledge that is durable and
useful to almost every future session on this repo. Prefer a pointer to the
authoritative file, command, or doc over copying the detail here — anything
duplicated will drift. Delete entries that stop being true rather than adding
caveats to them.
