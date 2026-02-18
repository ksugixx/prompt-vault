import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: ['default', ['allure-vitest/reporter', { resultsDir: '../allure-results' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
    env: {
      JWT_SECRET: 'test-secret-key-for-unit-tests',
    },
  },
});
