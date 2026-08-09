import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/**/*.test.ts',
      'apps/web/**/*.test.ts',
      'apps/portal/**/*.test.ts',
      'apps/admin/**/*.test.ts',
      'scripts/**/*.test.mjs',
    ],
    environment: 'node',
  },
});
