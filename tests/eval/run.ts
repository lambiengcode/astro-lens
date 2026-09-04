import fs from 'node:fs';
import path from 'node:path';
import { LOCALES, type Locale } from '@/lib/i18n/locales';
import { GOLDEN_CHARTS, type GoldenChart } from './charts';
import { runChecks, type CheckResult } from './checks';

// ============================================================
// READING-QUALITY EVAL — P6 Part A
// ============================================================
//
//   npm run eval                      every locale, every golden chart
//   npm run eval -- --locale ko       one locale
//   npm run eval -- --chart a-tuvi-ty one chart
//   npm run eval -- --tag baseline    label the run (EVAL.md and out/ folder)
//   npm run eval -- --reuse           re-run the CHECKS on saved readings,
//                                     spending no API quota
//   PROMPT_FORMAT=toon npm run eval   run the TOON arm (P6 Part B)
//
// Deliberately NOT wired into `npm run test` or CI. A full run is ten model
// calls at roughly three minutes each; that is real time and real quota, and it
// is run on purpose.

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.resolve(import.meta.dirname, 'out');

// ── args ────────────────────────────────────────────────────────────────────

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const only = arg('locale');
const onlyChart = arg('chart');
const tag = arg('tag') ?? 'run';
const reuse = flag('reuse');
const concurrency = Number(arg('concurrency') ?? 2);

const locales: Locale[] = only
  ? (LOCALES.includes(only as Locale) ? [only as Locale] : (() => {
      console.error(`unknown locale "${only}" — expected one of ${LOCALES.join(', ')}`);
      process.exit(2);
    })())
  : [...LOCALES];

const charts: GoldenChart[] = onlyChart
  ? GOLDEN_CHARTS.filter((c) => c.id === onlyChart)
  : GOLDEN_CHARTS;

if (!charts.length) {
  console.error(`unknown chart "${onlyChart}" — expected one of ${GOLDEN_CHARTS.map((c) => c.id).join(', ')}`);
  process.exit(2);
}

// ── .env ────────────────────────────────────────────────────────────────────
// `src/lib/gemini.ts` reads the key at module load, so it is loaded before the
// dynamic import below rather than at the top of this file.

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const value = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  }
}

// ── result shape ────────────────────────────────────────────────────────────

interface Row {
  chart: string;
  locale: Locale;
  ok: boolean;
  error?: string;
  seconds: number;
  promptTokens: number | null;
  checks: CheckResult[];
}

const readingPath = (t: string, chart: string, locale: Locale) =>
  path.join(OUT, t, `${chart}-${locale}.md`);

// ── one cell ────────────────────────────────────────────────────────────────

async function evaluate(golden: GoldenChart, locale: Locale): Promise<Row> {
  const { analyzeChart, buildAnalysisPrompt } = await import('@/lib/gemini');
  const { countPromptTokens } = await import('./tokens');

  const label = `${golden.id} · ${locale}`;
  const file = readingPath(tag, golden.id, locale);
  const started = Date.now();

  let reading: string;
  let promptTokens: number | null = null;

  try {
    const prompt = buildAnalysisPrompt(golden.chart, locale, golden.input.name, golden.input.selfDescription);
    promptTokens = await countPromptTokens(prompt);

    if (reuse) {
      if (!fs.existsSync(file)) {
        return { chart: golden.id, locale, ok: false, seconds: 0, promptTokens,
                 error: `--reuse but no saved reading at ${path.relative(ROOT, file)}`, checks: [] };
      }
      reading = fs.readFileSync(file, 'utf8');
      console.log(`  ${label}: reusing saved reading (${reading.length} chars)`);
    } else {
      console.log(`  ${label}: generating… (~3 min)`);
      reading = await analyzeChart(golden.chart, locale, golden.input.name, golden.input.selfDescription);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, reading);
    }
  } catch (e) {
    return { chart: golden.id, locale, ok: false, seconds: (Date.now() - started) / 1000,
             promptTokens, error: e instanceof Error ? e.message : String(e), checks: [] };
  }

  const seconds = (Date.now() - started) / 1000;
  if (!reading.trim()) {
    return { chart: golden.id, locale, ok: false, seconds, promptTokens,
             error: 'the model returned an empty reading', checks: [] };
  }

  const checks = runChecks({
    reading, chart: golden.chart, locale,
    subjectName: golden.input.name,
    selfDescription: golden.input.selfDescription,
    expect: golden.expect,
  });
  const ok = checks.every((c) => c.pass);
  console.log(`  ${label}: ${ok ? 'PASS' : 'FAIL'} — ${checks.filter((c) => !c.pass).map((c) => c.id).join(', ') || 'all five checks'} (${seconds.toFixed(0)}s)`);
  return { chart: golden.id, locale, ok, seconds, promptTokens, checks };
}

// ── pool ────────────────────────────────────────────────────────────────────

async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

// ── report ──────────────────────────────────────────────────────────────────

const CHECK_TITLE: Record<string, string> = {
  hallucination: 'Hallucination — every star named is on the chart',
  coverage: 'Coverage — all twelve palaces discussed',
  language: 'Language — right script, no leakage',
  length: 'Length — meets the target the prompt demands',
  structure: 'Structure — the eleven sections, present and in order',
};

function report(rows: Row[], elapsed: number): string {
  const when = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const failed = rows.filter((r) => !r.ok);
  const L: string[] = [];

  L.push(`# EVAL.md — reading quality`, '');
  L.push(`What the model actually says, checked against the chart it was given.`);
  L.push(`Produced by \`npm run eval\`; see \`tests/eval/\`. **Not** part of`);
  L.push(`\`npm run test\` — a full run is ${rows.length} model calls and real quota.`, '');
  L.push(`- **Run:** \`${tag}\`${reuse ? ' (checks re-run on saved readings, no API calls)' : ''}`);
  L.push(`- **Prompt format:** \`${process.env.PROMPT_FORMAT === 'toon' ? 'toon' : 'text'}\``);
  L.push(`- **When:** ${when} UTC`);
  L.push(`- **Wall clock:** ${(elapsed / 60).toFixed(1)} min at concurrency ${concurrency}`);
  L.push(`- **Readings:** \`tests/eval/out/${tag}/\` — every one saved, so a failure can be read`);
  L.push('');

  L.push(`## Result`, '');
  L.push(`**${rows.length - failed.length} of ${rows.length} cells pass all five checks.**`, '');

  L.push(`| Chart | Locale | Halluc. | Coverage | Language | Length | Structure | Prompt tokens | Time |`);
  L.push(`|---|---|:--:|:--:|:--:|:--:|:--:|--:|--:|`);
  for (const r of rows) {
    const cell = (id: string) => {
      if (r.error) return '—';
      const c = r.checks.find((x) => x.id === id);
      return c ? (c.pass ? '✅' : '❌') : '—';
    };
    L.push(`| ${r.chart} | ${r.locale} | ${cell('hallucination')} | ${cell('coverage')} | `
      + `${cell('language')} | ${cell('length')} | ${cell('structure')} | `
      + `${r.promptTokens?.toLocaleString('en-US') ?? '—'} | ${r.seconds.toFixed(0)}s |`);
  }
  L.push('');

  L.push(`## The golden charts`, '');
  for (const c of GOLDEN_CHARTS) {
    L.push(`- **\`${c.id}\`** — ${c.title}. ${c.shape}`);
  }
  L.push('');

  L.push(`## Per cell`, '');
  for (const r of rows) {
    L.push(`### \`${r.chart}\` · \`${r.locale}\``, '');
    if (r.error) {
      L.push(`**ERRORED** — ${r.error}`, '');
      continue;
    }
    for (const c of r.checks) {
      L.push(`- ${c.pass ? '✅' : '❌'} **${CHECK_TITLE[c.id] ?? c.id}** — ${c.summary}`);
      for (const o of c.offenders.slice(0, 25)) L.push(`    - \`${o.replace(/`/g, "'")}\``);
      if (c.offenders.length > 25) L.push(`    - …and ${c.offenders.length - 25} more`);
      for (const n of (c.notes ?? []).slice(0, 15)) L.push(`    - _note_ \`${n.replace(/`/g, "'")}\``);
    }
    L.push('');
  }

  if (failed.length) {
    L.push(`## What a failure means here`, '');
    L.push(`These checks are deterministic and the chart is ground truth, so a ❌ is`);
    L.push(`a real property of the reading — not a flaky assertion. The one that`);
    L.push(`needs judgement is **hallucination**: a star named but absent is usually`);
    L.push(`a fabrication, but it can also be a legitimate negation ("this chart has`);
    L.push(`no Hóa Kỵ") or a classical pattern named in passing. That is why the`);
    L.push(`surrounding sentence is recorded above rather than just the star name.`, '');
  }
  return L.join('\n') + '\n';
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();
  if (!reuse && !process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set — put it in .env, or run with --reuse to check saved readings.');
    process.exit(2);
  }

  const cells = charts.flatMap((c) => locales.map((l) => ({ chart: c, locale: l })));
  console.log(`eval: ${cells.length} cell(s), tag "${tag}"${reuse ? ', reusing saved readings' : ''}`);
  const started = Date.now();
  const rows = await pool(cells, reuse ? cells.length : concurrency, (c) => evaluate(c.chart, c.locale));
  const elapsed = (Date.now() - started) / 1000;

  // A tagged run is evidence for a comparison and lives with its readings;
  // only an untagged run writes the top-level EVAL.md, which is the authored
  // record of what the harness found and what it means.
  fs.mkdirSync(path.join(OUT, tag), { recursive: true });
  const target = tag === 'run'
    ? path.join(ROOT, 'EVAL.md')
    : path.join(OUT, tag, 'report.md');
  fs.writeFileSync(target, report(rows, elapsed));
  fs.writeFileSync(path.join(OUT, tag, 'results.json'), JSON.stringify(rows, null, 2) + '\n');

  const failed = rows.filter((r) => !r.ok);
  console.log(`\n${rows.length - failed.length}/${rows.length} cells pass — ${path.relative(ROOT, target)}`);
  // A failing eval is information, not a broken build. It still exits non-zero
  // so a wrapper can notice, but nothing in CI runs this.
  process.exit(failed.length ? 1 : 0);
}

main();
