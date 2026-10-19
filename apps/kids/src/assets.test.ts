import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  AAC_PICTURES,
  GAME_ONLY_PICTURES,
  ROUTINE_PICTURES,
  STORY_SCENES,
} from '@luminol/kids-learning';
import { kidsColors } from '@luminol/kids-ui';
import { z } from 'zod';

const APP_ROOT = join(__dirname, '..');
const ASSETS = join(APP_ROOT, 'assets');

/** Every bundled media file keeps its source, alt text, crop intent and approval. */
const mediaSchema = z.object({
  assets: z.array(
    z.object({
      file: z.string().min(1),
      source: z.string().min(10),
      alt: z.string().min(5),
      cropIntent: z.string().min(10),
      approval: z.object({
        status: z.enum(['approved', 'pending']),
        by: z.string().min(1),
        date: z.iso.date(),
      }),
      derivedFrom: z.string().optional(),
    }),
  ),
});

const appSchema = z.object({
  expo: z.object({
    icon: z.string(),
    backgroundColor: z.string(),
    android: z.object({
      blockedPermissions: z.array(z.string()),
      adaptiveIcon: z.object({
        foregroundImage: z.string(),
        backgroundColor: z.string(),
      }),
    }),
  }),
});

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [relative(ASSETS, path)];
  });
}

const media = mediaSchema.parse(
  JSON.parse(readFileSync(join(ASSETS, 'media.json'), 'utf8')),
);
const app = appSchema.parse(
  JSON.parse(readFileSync(join(APP_ROOT, 'app.json'), 'utf8')),
);

describe('bundled media', () => {
  it('records metadata for every asset file and nothing else', () => {
    const listed = media.assets.map((asset) => asset.file).sort();
    const onDisk = filesUnder(ASSETS)
      .filter((file) => file !== 'media.json')
      .sort();
    expect(listed).toEqual(onDisk);
  });

  it('records every communication board picture', () => {
    const files = new Set(media.assets.map((asset) => asset.file));
    for (const picture of AAC_PICTURES) {
      expect(files).toContain(`aac/${picture}.png`);
    }
  });

  it('only derives assets from other recorded assets', () => {
    const files = new Set(media.assets.map((asset) => asset.file));
    for (const asset of media.assets) {
      if (asset.derivedFrom) expect(files).toContain(asset.derivedFrom);
    }
  });
});

describe('app config', () => {
  it('points at recorded icon files', () => {
    const files = media.assets.map((asset) => `./assets/${asset.file}`);
    expect(files).toContain(app.expo.icon);
    expect(files).toContain(app.expo.android.adaptiveIcon.foregroundImage);
    for (const path of [
      app.expo.icon,
      app.expo.android.adaptiveIcon.foregroundImage,
    ]) {
      expect(existsSync(join(APP_ROOT, path))).toBe(true);
    }
  });

  it('never asks for the advertising id, as Designed for Families requires', () => {
    expect(app.expo.android.blockedPermissions).toContain(
      'com.google.android.gms.permission.AD_ID',
    );
  });

  it('uses the kids design tokens for native colors', () => {
    expect(app.expo.backgroundColor.toUpperCase()).toBe(kidsColors.canvas);
    expect(app.expo.android.adaptiveIcon.backgroundColor.toUpperCase()).toBe(
      kidsColors.accent,
    );
  });
});

describe('game pictures', () => {
  const files = new Set(media.assets.map((asset) => asset.file));

  it('records every theme picture, story scene and routine picture', () => {
    for (const picture of GAME_ONLY_PICTURES) {
      expect(files).toContain(`themes/${picture}.png`);
    }
    for (const scene of STORY_SCENES) {
      expect(files).toContain(`scenes/${scene}.png`);
    }
    for (const picture of ROUTINE_PICTURES) {
      expect(files).toContain(`routines/${picture}.png`);
    }
  });
});
