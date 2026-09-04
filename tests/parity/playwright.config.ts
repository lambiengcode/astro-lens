import { defineConfig } from '@playwright/test';

// A dedicated port so the parity run never shares a server — and never a
// stylesheet — with the dev server a human has open.
const PORT = process.env.PARITY_PORT ?? '3100';

export default defineConfig({
  testDir: __dirname,
  testMatch: /(parity|reduced-motion|locale)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  // PLAN.md §10.2 conditions (viewport, deviceScaleFactor, colorScheme,
  // reducedMotion) are set per context in the spec, so every capture is
  // explicit about them rather than inheriting.
  use: { baseURL: `http://localhost:${PORT}` },
  // The server is owned by tests/parity/run.mjs — Next 16 allows only one dev
  // server per project directory, so the wrapper stops the running one and
  // starts a fresh compile before the harness measures anything.
});
