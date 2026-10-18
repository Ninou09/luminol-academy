import {
  PIECE_COLORS,
  SHAPES,
  type Piece,
  type PieceColor,
  type PieceSize,
  type Shape,
} from './pieces';
import { pickOne, sample, shuffle, type Random } from './random';
import type {
  CauseEffectLevel,
  MatchingLevel,
  SortDimension,
  SortingLevel,
} from './skills';

export type MatchingRound = {
  target: Piece;
  choices: Piece[];
  correctIndex: number;
};

function others<T>(items: readonly T[], excluded: T): T[] {
  return items.filter((item) => item !== excluded);
}

export function createMatchingRound(
  level: MatchingLevel,
  random: Random,
): MatchingRound {
  const target: Piece = {
    shape: pickOne(random, SHAPES),
    color: pickOne(random, PIECE_COLORS),
    size: 'medium',
  };
  const distractorCount = level.choices - 1;
  let distractors: Piece[];

  switch (level.distractors) {
    case 'different':
      distractors = sample(
        random,
        others(SHAPES, target.shape),
        distractorCount,
      ).map((shape) => ({
        shape,
        color: pickOne(random, others(PIECE_COLORS, target.color)),
        size: 'medium',
      }));
      break;
    case 'same-color':
      distractors = sample(
        random,
        others(SHAPES, target.shape),
        distractorCount,
      ).map((shape) => ({ shape, color: target.color, size: 'medium' }));
      break;
    case 'same-shape':
      distractors = sample(
        random,
        others(PIECE_COLORS, target.color),
        distractorCount,
      ).map((color) => ({ shape: target.shape, color, size: 'medium' }));
      break;
  }

  const choices = shuffle(random, [target, ...distractors]);
  return { target, choices, correctIndex: choices.indexOf(target) };
}

export type SortBin =
  | { dimension: 'color'; value: PieceColor }
  | { dimension: 'shape'; value: Shape }
  | { dimension: 'size'; value: PieceSize };

/** Canonical orders keep bins in predictable places from round to round. */
function inCanonicalOrder<T>(
  canonical: readonly T[],
  picked: readonly T[],
): T[] {
  return canonical.filter((item) => picked.includes(item));
}

const SIZE_BINS: Record<number, readonly PieceSize[]> = {
  2: ['large', 'small'],
  3: ['large', 'medium', 'small'],
};

export function createSortingBins(
  dimension: SortDimension,
  level: SortingLevel,
  random: Random,
): SortBin[] {
  switch (dimension) {
    case 'color':
      return inCanonicalOrder(
        PIECE_COLORS,
        sample(random, PIECE_COLORS, level.bins),
      ).map((value) => ({ dimension, value }));
    case 'shape':
      return inCanonicalOrder(SHAPES, sample(random, SHAPES, level.bins)).map(
        (value) => ({ dimension, value }),
      );
    case 'size': {
      const sizes = SIZE_BINS[level.bins];
      if (sizes === undefined) {
        throw new Error(
          `Size sorting supports 2 or 3 bins, not ${level.bins}.`,
        );
      }
      return sizes.map((value) => ({ dimension, value }));
    }
  }
}

export type SortingItem = {
  piece: Piece;
  correctBin: number;
};

export function binMatches(bin: SortBin, piece: Piece): boolean {
  switch (bin.dimension) {
    case 'color':
      return piece.color === bin.value;
    case 'shape':
      return piece.shape === bin.value;
    case 'size':
      return piece.size === bin.value;
  }
}

const FIXED_SHAPE: Shape = 'circle';
const FIXED_COLOR: PieceColor = 'blue';

export function createSortingItem(
  bins: readonly SortBin[],
  level: SortingLevel,
  random: Random,
): SortingItem {
  const correctBin = Math.floor(random() * bins.length);
  const bin = bins[correctBin];
  if (bin === undefined) {
    throw new Error('Sorting needs at least one bin.');
  }
  const shape = level.varyOthers ? pickOne(random, SHAPES) : FIXED_SHAPE;
  const color = level.varyOthers ? pickOne(random, PIECE_COLORS) : FIXED_COLOR;
  const size: PieceSize = 'medium';
  let piece: Piece;
  switch (bin.dimension) {
    case 'color':
      piece = { shape, color: bin.value, size };
      break;
    case 'shape':
      piece = { shape: bin.value, color, size };
      break;
    case 'size':
      piece = { shape, color, size: bin.value };
      break;
  }
  return { piece, correctBin };
}

export type CauseEffectRound = {
  piece: Piece;
  targetScale: number;
  /** Center of the target as a share of the play area, 0–1 on each axis. */
  position: { x: number; y: number };
};

export function createCauseEffectRound(
  level: CauseEffectLevel,
  random: Random,
): CauseEffectRound {
  const margin = level.targetScale / 2;
  const place = () =>
    level.moves ? margin + random() * (1 - level.targetScale) : 0.5;
  return {
    piece: {
      shape: pickOne(random, SHAPES),
      color: pickOne(random, PIECE_COLORS),
      size: 'medium',
    },
    targetScale: level.targetScale,
    position: { x: place(), y: place() },
  };
}
