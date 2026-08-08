import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.FLAGSHIP_BASE_URL ?? 'http://127.0.0.1:3000';
const accessUrl = process.env.FLAGSHIP_ACCESS_URL;
const outputDirectory = 'artifacts/flagship-screenshots';
const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  psychology: '/schools/psychology',
  languages: '/schools/languages',
  training: '/schools/training',
};
const captures = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      viewport: capture.viewport,
      deviceScaleFactor: 1,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    if (accessUrl) {
      await page.goto(accessUrl, { waitUntil: 'networkidle' });
    }

    for (const [name, route] of Object.entries(routes)) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        const step = Math.max(320, Math.floor(window.innerHeight * 0.72));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => window.setTimeout(resolve, 90));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);
      await page.screenshot({
        path: `${outputDirectory}/${name}-${capture.name}.jpg`,
        fullPage: true,
        type: 'jpeg',
        quality: 84,
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
