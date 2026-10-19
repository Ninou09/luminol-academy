import { z } from 'zod';

import type { AacPicture } from './aac';
import { PIECE_COLORS, SHAPES, type Piece } from './pieces';

/**
 * Interest themes reskin the picture games. Every theme only uses reviewed
 * artwork: code-drawn shapes, or pictures from the communication board.
 */
export const THEMES = ['shapes', 'food', 'things'] as const;
export const themeSchema = z.enum(THEMES);
export type ThemeId = z.infer<typeof themeSchema>;

/** Board pictures that are also board words, so their recordings are shared. */
export const THEME_PICTURES = {
  food: ['apple', 'banana', 'bread', 'dates', 'egg', 'rice', 'milk', 'juice'],
  things: ['ball', 'car', 'book', 'home', 'school', 'park'],
} as const satisfies Record<Exclude<ThemeId, 'shapes'>, readonly AacPicture[]>;

/** One thing a game shows: a code-drawn shape or a theme picture. */
export type Token =
  { kind: 'shape'; piece: Piece } | { kind: 'picture'; picture: AacPicture };

export function tokenKey(token: Token): string {
  return token.kind === 'shape'
    ? `shape.${token.piece.shape}.${token.piece.color}`
    : `picture.${token.picture}`;
}

export function tokensEqual(left: Token, right: Token): boolean {
  return tokenKey(left) === tokenKey(right);
}

/** Every token a theme offers; shapes are all medium-sized shape and color pairs. */
export function themeTokens(theme: ThemeId): Token[] {
  if (theme === 'shapes') {
    return SHAPES.flatMap((shape) =>
      PIECE_COLORS.map((color) => ({
        kind: 'shape' as const,
        piece: { shape, color, size: 'medium' as const },
      })),
    );
  }
  return THEME_PICTURES[theme].map((picture) => ({
    kind: 'picture' as const,
    picture,
  }));
}

/** The largest number of distinct tokens any game may ask a theme for. */
export const MIN_THEME_TOKENS = 6;

export const interestsSchema = z
  .array(themeSchema)
  .min(1)
  .refine((values) => new Set(values).size === values.length, {
    message: 'Interests must not repeat.',
  });
