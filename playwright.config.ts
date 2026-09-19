import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000' },
  projects: [
    { name: 'public', testIgnore: '**/programme-enquiry-card.spec.ts' },
    {
      name: 'programme-fixture',
      testMatch: '**/programme-enquiry-card.spec.ts',
      use: { baseURL: 'http://127.0.0.1:3001' },
    },
  ],
  webServer: [
    {
      command: isCI
        ? 'pnpm --filter @luminol/web start'
        : 'pnpm --filter @luminol/web dev',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !isCI,
    },
    {
      command: 'node tests/fixtures/programme-server.cjs',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
