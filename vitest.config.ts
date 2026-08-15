import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'server-only': fileURLToPath(
        new URL('./test/server-only.ts', import.meta.url),
      ),
    },
  },
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
