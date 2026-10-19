import { PIECE_COLORS, SHAPES, type Piece } from './pieces';
import { randomInt, sample, shuffle, type Random } from './random';
import { createCauseEffectRound, createMatchingRound } from './rounds';
import type {
  CauseEffectLevel,
  MatchingLevel,
  MemoryLevel,
  PatternLevel,
  PatternUnit,
  PuzzleLevel,
} from './skills';
import { themeTokens, type ThemeId, type Token } from './themes';

function shapeToken(piece: Piece): Token {
  return { kind: 'shape', piece: { ...piece, size: 'medium' } };
}

/**
 * Picks tokens that are easy to tell apart. Shapes never repeat a shape, and
 * repeat a color only once all four colors are used.
 */
export function distinctTokens(
  theme: ThemeId,
  count: number,
  random: Random,
): Token[] {
  if (theme !== 'shapes') return sample(random, themeTokens(theme), count);
  const colors = shuffle(random, PIECE_COLORS);
  return sample(random, SHAPES, count).map((shape, index) =>
    shapeToken({
      shape,
      color: colors[index % colors.length] ?? 'blue',
      size: 'medium',
    }),
  );
}

export type ThemedMatchingRound = {
  target: Token;
  choices: Token[];
  correctIndex: number;
};

/** Shapes keep their color and shape distractor rules; pictures differ outright. */
export function createThemedMatchingRound(
  level: MatchingLevel,
  theme: ThemeId,
  random: Random,
): ThemedMatchingRound {
  if (theme === 'shapes') {
    const round = createMatchingRound(level, random);
    return {
      target: shapeToken(round.target),
      choices: round.choices.map(shapeToken),
      correctIndex: round.correctIndex,
    };
  }
  const tokens = distinctTokens(theme, level.choices, random);
  const target = tokens[0];
  if (!target) throw new Error('Matching needs at least one choice.');
  const choices = shuffle(random, tokens);
  return { target, choices, correctIndex: choices.indexOf(target) };
}

export type ThemedCauseEffectRound = {
  token: Token;
  targetScale: number;
  position: { x: number; y: number };
};

export function createThemedCauseEffectRound(
  level: CauseEffectLevel,
  theme: ThemeId,
  random: Random,
): ThemedCauseEffectRound {
  const { piece, targetScale, position } = createCauseEffectRound(
    level,
    random,
  );
  const token =
    theme === 'shapes'
      ? shapeToken(piece)
      : (distinctTokens(theme, 1, random)[0] ?? shapeToken(piece));
  return { token, targetScale, position };
}

const PATTERN_UNITS: Record<PatternUnit, readonly number[]> = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABB: [0, 1, 1],
  ABC: [0, 1, 2],
};

/** Every pattern shows five tokens before the gap the child fills. */
export const PATTERN_SHOWN = 5;

export type PatternRound = {
  sequence: Token[];
  answer: Token;
  choices: Token[];
  correctIndex: number;
};

export function createPatternRound(
  level: PatternLevel,
  theme: ThemeId,
  random: Random,
): PatternRound {
  const unit = PATTERN_UNITS[level.pattern];
  const distinct = Math.max(...unit) + 1;
  const tokens = distinctTokens(
    theme,
    Math.max(distinct, level.choices),
    random,
  );
  const full = Array.from(
    { length: PATTERN_SHOWN + 1 },
    (_, index) => tokens[unit[index % unit.length] ?? 0],
  ).filter((token): token is Token => token !== undefined);
  const answer = full[PATTERN_SHOWN];
  if (!answer) throw new Error('Pattern could not be built.');
  // The other tokens of the pattern come first, as they are the closest distractors.
  const distractors = tokens.filter((token) => token !== answer);
  const choices = shuffle(random, [
    answer,
    ...distractors.slice(0, level.choices - 1),
  ]);
  return {
    sequence: full.slice(0, PATTERN_SHOWN),
    answer,
    choices,
    correctIndex: choices.indexOf(answer),
  };
}

export type MemoryCard = { id: string; token: Token };

export function createMemoryBoard(
  level: MemoryLevel,
  theme: ThemeId,
  random: Random,
): MemoryCard[] {
  const tokens = distinctTokens(theme, level.pairs, random);
  return shuffle(
    random,
    tokens.flatMap((token, index) => [
      { id: `${index}-a`, token },
      { id: `${index}-b`, token },
    ]),
  );
}

export type PuzzlePiece = { token: Token; region: number };

export type PuzzleRound = {
  token: Token;
  pieces: 2 | 4;
  missing: number;
  choices: PuzzlePiece[];
  correctIndex: number;
};

/** The missing piece, with the same part cut from other pictures as distractors. */
export function createPuzzleRound(
  level: PuzzleLevel,
  theme: ThemeId,
  random: Random,
): PuzzleRound {
  const tokens = distinctTokens(theme, level.choices, random);
  const token = tokens[0];
  if (!token) throw new Error('A puzzle needs at least one choice.');
  const missing = randomInt(random, level.pieces);
  const choices = shuffle(
    random,
    tokens.map((candidate) => ({ token: candidate, region: missing })),
  );
  return {
    token,
    pieces: level.pieces,
    missing,
    choices,
    correctIndex: choices.findIndex((choice) => choice.token === token),
  };
}

export type Rect = { x: number; y: number; width: number; height: number };

/** Two pieces are left and right halves; four are quarters in reading order. */
export function regionRect(pieces: 2 | 4, region: number, size: number): Rect {
  if (pieces === 2) {
    return {
      x: (region % 2) * (size / 2),
      y: 0,
      width: size / 2,
      height: size,
    };
  }
  return {
    x: (region % 2) * (size / 2),
    y: Math.floor(region / 2) * (size / 2),
    width: size / 2,
    height: size / 2,
  };
}
