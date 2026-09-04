#!/usr/bin/env node
// Runs the parity harness against a FRESH dev server.
//
// Two constraints force this wrapper: Next 16 allows only one dev server per
// project directory, and Turbopack's CSS hot-reload will happily serve a stale
// stylesheet to a headless client. Stale evidence is worse than no evidence,
// so the run owns its server: stop whatever is up, start a new one, measure,
// stop it again.
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = process.env.PARITY_PORT ?? '3100';

const quiet = (cmd) => { try { execSync(cmd, { stdio: 'ignore' }); } catch { /* nothing to stop */ } };

const waitFor = async (url, ms = 120_000) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`dev server never came up at ${url}`);
};

console.log('· stopping any running dev server');
quiet('pkill -f "next dev"');
await new Promise((r) => setTimeout(r, 1500));

console.log(`· starting a fresh dev server on ${PORT}`);
const server = spawn('npx', ['next', 'dev', '--port', PORT], { cwd: ROOT, stdio: 'ignore' });
let code = 1;
try {
  await waitFor(`http://localhost:${PORT}/`);

  // Compile every route before measuring anything. Turbopack compiles a route
  // on its first request, and the harness loads with `domcontentloaded`: on a
  // cold `.next` the first capture can be taken while the stylesheet and the
  // fonts are still arriving, which reads as a page-wide geometry failure that
  // is entirely an artefact of the run. Two passes, because the first one is
  // what pays the compile.
  console.log('· warming routes');
  const ROUTES = ['/?fixture=tuvi-ty', '/result?fixture=tuvi-ty&tab=overview',
                  '/result?fixture=tuvi-ty&tab=chart', '/result?fixture=tuvi-ty&tab=daivan',
                  '/result?fixture=tuvi-ty&tab=interpretation',
                  '/result?fixture=tuvi-ty&tab=horoscope'];
  for (let pass = 0; pass < 2; pass++) {
    for (const route of ROUTES) {
      try { await (await fetch(`http://localhost:${PORT}${route}`)).text(); } catch { /* retried next pass */ }
    }
  }
  await new Promise((r) => setTimeout(r, 2000));

  console.log('· running parity');
  code = await new Promise((resolve) => {
    spawn('npx', ['playwright', 'test', '--config=tests/parity/playwright.config.ts'],
      { cwd: ROOT, stdio: 'inherit', env: { ...process.env, PARITY_PORT: PORT } })
      .on('exit', resolve);
  });
} finally {
  server.kill('SIGTERM');
}
process.exit(code ?? 1);
