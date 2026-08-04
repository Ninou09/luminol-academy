import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

const targets = {
  admin: {
    baseUrl: 'https://luminol-academy-admin.vercel.app',
    fileName: 'admin-state.json',
    label: 'administration',
  },
  portal: {
    baseUrl: 'https://luminol-academy-portal.vercel.app',
    fileName: 'portal-state.json',
    label: 'learner portal',
  },
};

const targetName = process.argv[2];
const target = targets[targetName];

if (!target) {
  console.error(
    'Usage: pnpm auth:capture <admin|portal> [base-url]\n' +
      'Example: pnpm auth:capture portal',
  );
  process.exit(1);
}

const baseUrl = process.argv[3] || target.baseUrl;
let appOrigin;

try {
  appOrigin = new URL(baseUrl).origin;
} catch {
  console.error(`Invalid base URL: ${baseUrl}`);
  process.exit(1);
}

const signInUrl = new URL('/sign-in', appOrigin).toString();
const authDirectory = resolve('.auth');
const statePath = resolve(authDirectory, target.fileName);
const readline = createInterface({ input, output });
const browser = await chromium.launch({ headless: false });

try {
  await mkdir(authDirectory, { recursive: true });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Opening the production ${target.label} sign-in page...`);
  console.log('Sign in manually with the restricted smoke account.');
  console.log('Never paste the password, cookies, or saved state into chat or an issue.');

  await page.goto(signInUrl, { waitUntil: 'domcontentloaded' });

  await readline.question(
    '\nAfter the authenticated dashboard is fully visible, return here and press Enter. ',
  );

  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

  const currentUrl = new URL(page.url());
  if (
    currentUrl.origin !== appOrigin ||
    currentUrl.pathname.startsWith('/sign-in')
  ) {
    throw new Error(
      `Authentication was not confirmed. The browser is still at ${page.url()}`,
    );
  }

  await context.storageState({ path: statePath });
  await context.close();

  console.log(`\nSaved restricted ${targetName} browser state to:`);
  console.log(statePath);
  console.log('This file contains active authentication material. Keep it private.');
} catch (error) {
  console.error('\nStorage-state capture failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  readline.close();
  await browser.close();
}
