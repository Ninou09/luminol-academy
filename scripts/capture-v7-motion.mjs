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
  await page.waitForTimeout(1600);

  const primaryCta = page.locator('.v4-hero-actions a').first();
  if (await primaryCta.count()) {
    await primaryCta.hover();
    await page.waitForTimeout(700);
  }

  const metrics = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
  }));
  const step = Math.max(520, Math.floor(metrics.viewport * 0.72));

  for (let y = 0; y < metrics.height; y += step) {
    await page.evaluate((top) => {
      window.scrollTo({ top, behavior: 'smooth' });
    }, y);
    await page.waitForTimeout(520);
  }

  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(900);

  const branchLinks = page.locator('.v4-branch-link');
  const branchCount = await branchLinks.count();
  if (branchCount) {
    await branchLinks.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    for (let index = 0; index < Math.min(branchCount, 3); index += 1) {
      await branchLinks.nth(index).hover();
      await page.waitForTimeout(850);
    }
  }

  const film = page.locator('.v5-film-media').first();
  if (await film.count()) {
    await film.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await film.hover();
    await page.waitForTimeout(950);
  }

  const conversion = page.locator('.v6-conversion-rail');
  if (await conversion.count()) {
    await conversion.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const conversionCta = conversion.locator('a').first();
    if (await conversionCta.count()) {
      await conversionCta.hover();
      await page.waitForTimeout(750);
    }
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1400);

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
