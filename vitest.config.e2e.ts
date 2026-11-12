import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.e2e-spec.ts'],
    testTimeout: 90000,
    hookTimeout: 90000
  }
});
