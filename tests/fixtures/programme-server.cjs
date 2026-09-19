// Start a separate Next.js process with the test-only CMS transport. The
// ordinary public browser project keeps its existing CMS-free server.
// Requires `pnpm --filter @luminol/web build`, as already performed by CI.
const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

const root = resolve(__dirname, '../..');
const app = resolve(root, 'apps/web');
const cli = require.resolve('next/dist/bin/next', { paths: [app] });
// NextURL normalizes loopback IPs to localhost. Keep the server bind origin
// identical so locale rewrites remain internal instead of redirecting to self.
const child = spawn(
  process.execPath,
  [
    '--require',
    resolve(__dirname, 'programme-cms.cjs'),
    cli,
    'start',
    '--hostname',
    'localhost',
    '--port',
    '3001',
  ],
  {
    cwd: app,
    env: {
      ...process.env,
      LUMINOL_PROGRAMME_FIXTURE: 'isolated-browser-test',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'e2eprogrammefixture',
      NEXT_PUBLIC_SANITY_DATASET: 'fixtures',
    },
    stdio: 'inherit',
  },
);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
