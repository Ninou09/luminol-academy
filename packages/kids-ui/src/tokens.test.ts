import { PIECE_COLORS } from '@luminol/kids-learning';
import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  kidsColors,
  MOTION,
  pieceColors,
  touchTargets,
} from './tokens';

describe('kids tokens', () => {
  it('meets WCAG AAA for body text and AA for secondary text', () => {
    for (const background of [
      kidsColors.canvas,
      kidsColors.surface,
      kidsColors.surfaceSoft,
    ]) {
      expect(contrastRatio(kidsColors.ink, background)).toBeGreaterThanOrEqual(
        7,
      );
      expect(
        contrastRatio(kidsColors.inkSoft, background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps button text readable', () => {
    expect(
      contrastRatio(kidsColors.accentInk, kidsColors.accent),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(kidsColors.dangerInk, kidsColors.danger),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(kidsColors.ink, kidsColors.accentSoft),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(kidsColors.ink, kidsColors.hintSoft),
    ).toBeGreaterThanOrEqual(7);
  });

  it('outlines every game piece and hint ring with at least 3:1 contrast', () => {
    for (const color of PIECE_COLORS) {
      expect(
        contrastRatio(pieceColors[color].outline, kidsColors.surface),
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrastRatio(pieceColors[color].outline, pieceColors[color].fill),
      ).toBeGreaterThanOrEqual(2);
    }
    expect(
      contrastRatio(kidsColors.hint, kidsColors.surface),
    ).toBeGreaterThanOrEqual(2.5);
    expect(
      contrastRatio(kidsColors.focus, kidsColors.canvas),
    ).toBeGreaterThanOrEqual(3);
  });

  it('uses child touch targets of at least 64 points', () => {
    expect(touchTargets.child).toBeGreaterThanOrEqual(64);
    expect(touchTargets.childLarge).toBeGreaterThan(touchTargets.child);
  });

  it('turns motion off entirely at the none level and keeps it slow otherwise', () => {
    expect(MOTION.none).toEqual({ enabled: false, duration: 0, scale: 1 });
    expect(MOTION.low.duration).toBeGreaterThanOrEqual(MOTION.normal.duration);
    expect(MOTION.normal.duration).toBeGreaterThanOrEqual(400);
    expect(MOTION.normal.scale).toBeLessThanOrEqual(1.15);
  });
});
