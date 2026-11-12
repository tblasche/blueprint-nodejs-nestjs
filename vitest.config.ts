import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    testTimeout: 10000,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/infrastructure/db/generated/**'],
      reportsDirectory: './coverage',
      reporter: ['clover', 'cobertura', 'lcov', 'text']
    }
  }
});
