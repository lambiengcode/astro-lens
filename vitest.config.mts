import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// `vite` resolves to two copies here (Next pulls a rolldown build), so the
// plugin types do not line up. The plugins themselves are fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugins = [tsconfigPaths(), react()] as any;

export default defineConfig({
  plugins,
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: true,
  },
});
