import { defineConfig } from 'vite';
import path from 'node:path';

// The eval harness runs app code (`analyzeChart`, the vocabulary table) from a
// plain script. `vite-node` ships with vitest, so this needs no new dependency;
// it only has to resolve the `@/` alias that tsconfig.json declares.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '../../src') } },
});
