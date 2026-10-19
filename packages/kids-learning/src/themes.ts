import { z } from 'zod';

import { AAC_PICTURES, type AacPicture } from './aac';
import { PIECE_COLORS, SHAPES, type Piece } from './pieces';

/**
 * Interest themes reskin the picture games. Every theme only uses reviewed
 * artwork: code-drawn shapes, pictures from the communication board, or the
 * theme pictures bundled in apps/kids/assets/themes.
 */
export const THEMES = [
  'shapes',
  'food',
  'things',
  'animals',
  'vehicles',
  'space',
] as const;
export const themeSchema = z.enum(THEMES);
export type ThemeId = z.infer<typeof themeSchema>;

/** Pictures used only by the games; each has a file in apps/kids/assets/themes. */
export const GAME_ONLY_PICTURES = [
  'cat',
  'dog',
  'bird',
  'fish',
  'camel',
  'horse',
  'sheep',
  'rabbit',
  'bus',
  'train',
  'plane',
  'boat',
  'bike',
  'truck',
  'helicopter',
  'tractor',
  'sun',
  'crescent',
  'star',
  'rocket',
  'planet',
  'astronaut',
] as const;
export type GameOnlyPicture = (typeof GAME_ONLY_PICTURES)[number];

/** A picture a game can show: a board picture or a game-only picture. */
export type GamePicture = AacPicture | GameOnlyPicture;

export function isAacPicture(picture: GamePicture): picture is AacPicture {
  return (AAC_PICTURES as readonly string[]).includes(picture);
}

/**
 * The pictures of each theme. Food and things are board words, so their
 * recordings are shared with the board.
 */
export const THEME_PICTURES = {
  food: ['apple', 'banana', 'bread', 'dates', 'egg', 'rice', 'milk', 'juice'],
  things: ['ball', 'car', 'book', 'home', 'school', 'park'],
  animals: ['cat', 'dog', 'bird', 'fish', 'camel', 'horse', 'sheep', 'rabbit'],
  vehicles: [
    'bus',
    'train',
    'plane',
    'boat',
    'bike',
    'truck',
    'helicopter',
    'tractor',
  ],
  space: ['sun', 'crescent', 'star', 'rocket', 'planet', 'astronaut'],
} as const satisfies Record<Exclude<ThemeId, 'shapes'>, readonly GamePicture[]>;

/** One thing a game shows: a code-drawn shape or a theme picture. */
export type Token =
  { kind: 'shape'; piece: Piece } | { kind: 'picture'; picture: GamePicture };

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
