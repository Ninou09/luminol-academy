import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000' },
  webServer: {
    command: isCI
      ? 'pnpm --filter @luminol/web start'
      : 'pnpm --filter @luminol/web dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !isCI,
  },
});
