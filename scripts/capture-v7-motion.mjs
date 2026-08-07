import { mkdir, rename } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.FLAGSHIP_BASE_URL ?? 'http://127.0.0.1:3000';
const outputDirectory = 'artifacts/v7-review';
const videoDirectory = `${outputDirectory}/video-temp`;

await mkdir(videoDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  reducedMotion: 'no-preference',
  recordVideo: {
    dir: videoDirectory,
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();
const video = page.video();

try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  const primaryCta = page.locator('.v4-hero-actions a').first();
  if (await primaryCta.count()) {
    await primaryCta.hover();
    await page.waitForTimeout(700);
  }

  const destinations = [0.58, 1.18, 1.9, 2.65, 3.55, 4.5, 5.4, 6.3];
  for (const multiplier of destinations) {
    await page.evaluate((value) => {
      window.scrollTo({ top: window.innerHeight * value, behavior: 'smooth' });
    }, multiplier);
    await page.waitForTimeout(1150);
  }

  const branchLinks = page.locator('.v4-branch-link');
  const branchCount = await branchLinks.count();
  if (branchCount) {
    await branchLinks.first().scrollIntoViewIfNeeded();
    for (let index = 0; index < Math.min(branchCount, 3); index += 1) {
      await branchLinks.nth(index).hover();
      await page.waitForTimeout(900);
    }
  }

  const film = page.locator('.v5-film-media').first();
  if (await film.count()) {
    await film.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await film.hover();
    await page.waitForTimeout(1000);
  }

  const conversion = page.locator('.v6-conversion-rail');
  if (await conversion.count()) {
    await conversion.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const conversionCta = conversion.locator('a').first();
    if (await conversionCta.count()) {
      await conversionCta.hover();
      await page.waitForTimeout(800);
    }
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1600);

  await page.screenshot({
    path: `${outputDirectory}/home-desktop.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 86,
  });
} finally {
  await page.close();
  const videoPath = await video?.path();
  await context.close();
  await browser.close();

  if (videoPath) {
    await rename(videoPath, `${outputDirectory}/home-motion.webm`);
  }
}
