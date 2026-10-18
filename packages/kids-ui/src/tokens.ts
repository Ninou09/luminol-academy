import type { AnimationLevel, PieceColor } from '@luminol/kids-learning';

/**
 * Calm, low-saturation palette for the kids app. Every pairing used for text
 * is checked for WCAG contrast in tokens.test.ts.
 */
export const kidsColors = {
  canvas: '#F5F1EA',
  surface: '#FFFFFF',
  surfaceSoft: '#ECE6DC',
  ink: '#25333A',
  inkSoft: '#4F5F65',
  line: '#CFC6B8',
  accent: '#2F6B69',
  accentInk: '#FFFFFF',
  accentSoft: '#DCEBE8',
  hint: '#C98F2A',
  hintSoft: '#F6E7C4',
  focus: '#2F5F8A',
  danger: '#8E3A2D',
  dangerInk: '#FFFFFF',
  shadow: '#25333A',
} as const;

/** Game piece fills plus a darker outline for 3:1 non-text contrast. */
export const pieceColors: Record<
  PieceColor,
  { fill: string; outline: string }
> = {
  red: { fill: '#CC6B55', outline: '#7E3B2C' },
  blue: { fill: '#5486B8', outline: '#2D4F72' },
  yellow: { fill: '#E6B84A', outline: '#7A5B12' },
  green: { fill: '#64A274', outline: '#2F5C3B' },
};

export const kidsSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const kidsRadii = {
  control: 16,
  card: 24,
  pill: 999,
} as const;

/** Minimum touch targets: 64 for children, larger for primary child actions. */
export const touchTargets = {
  child: 64,
  childLarge: 96,
  parent: 48,
} as const;

export const kidsType = {
  parentBody: { fontSize: 17, lineHeight: 26 },
  body: { fontSize: 22, lineHeight: 34 },
  title: { fontSize: 28, lineHeight: 42 },
  display: { fontSize: 36, lineHeight: 54 },
} as const;

export type Motion = {
  enabled: boolean;
  /** Duration of a gentle response such as a soft grow, in milliseconds. */
  duration: number;
  /** How far a piece grows when it responds. */
  scale: number;
};

/** No flashing and no fast movement at any level. */
export const MOTION: Record<AnimationLevel, Motion> = {
  none: { enabled: false, duration: 0, scale: 1 },
  low: { enabled: true, duration: 700, scale: 1.05 },
  normal: { enabled: true, duration: 500, scale: 1.12 },
};

/** Slow breathing pace for the calm corner: four seconds in, six out. */
export const BREATHING = {
  inhaleMs: 4000,
  exhaleMs: 6000,
} as const;

export function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}
