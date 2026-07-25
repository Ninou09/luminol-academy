import { describe, expect, it } from 'vitest';
import { colors, fonts, spacing } from './index';

describe('Luminol design tokens', () => {
  it('keeps the core identity stable', () => {
    expect(colors.ink).toBe('#102A43');
    expect(colors.gold).toBe('#C79A3B');
    expect(colors.canvas).toBe('#FAFAF8');
  });

  it('includes Arabic typography and fluid layout tokens', () => {
    expect(fonts.arabic).toContain('IBM Plex Sans Arabic');
    expect(spacing.page).toContain('clamp');
  });
});
