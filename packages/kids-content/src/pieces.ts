import {
  avatarPiece,
  type Avatar,
  type Piece,
  type PieceColor,
  type PieceSize,
  type Shape,
  type SortBin,
} from '@luminol/kids-learning';

import type { Utterance } from './utterance';

type Gender = 'masculine' | 'feminine';

const SHAPE_NAMES: Record<Shape, { name: string; gender: Gender }> = {
  circle: { name: 'دائرة', gender: 'feminine' },
  square: { name: 'مربع', gender: 'masculine' },
  triangle: { name: 'مثلث', gender: 'masculine' },
  star: { name: 'نجمة', gender: 'feminine' },
  heart: { name: 'قلب', gender: 'masculine' },
  diamond: { name: 'معيّن', gender: 'masculine' },
};

const COLOR_NAMES: Record<PieceColor, Record<Gender, string>> = {
  red: { masculine: 'أحمر', feminine: 'حمراء' },
  blue: { masculine: 'أزرق', feminine: 'زرقاء' },
  yellow: { masculine: 'أصفر', feminine: 'صفراء' },
  green: { masculine: 'أخضر', feminine: 'خضراء' },
};

const SIZE_NAMES: Record<PieceSize, Record<Gender, string>> = {
  small: { masculine: 'صغير', feminine: 'صغيرة' },
  medium: { masculine: 'متوسط', feminine: 'متوسطة' },
  large: { masculine: 'كبير', feminine: 'كبيرة' },
};

function definite(word: string): string {
  return `ال${word}`;
}

export function shapeName(shape: Shape): Utterance {
  return { key: `shape.${shape}`, text: SHAPE_NAMES[shape].name };
}

export function colorName(color: PieceColor): Utterance {
  return { key: `color.${color}`, text: COLOR_NAMES[color].masculine };
}

export function sizeName(size: PieceSize): Utterance {
  return { key: `size.${size}`, text: SIZE_NAMES[size].masculine };
}

/**
 * Names a piece with correct Arabic agreement, e.g. "الدائرة الحمراء" or
 * "المربع الأزرق الكبير".
 */
export function describePiece(
  piece: Piece,
  options: { definite?: boolean; includeSize?: boolean } = {},
): Utterance {
  const { definite: isDefinite = true, includeSize = false } = options;
  const { name, gender } = SHAPE_NAMES[piece.shape];
  const words = [name, COLOR_NAMES[piece.color][gender]];
  if (includeSize) words.push(SIZE_NAMES[piece.size][gender]);
  const text = (isDefinite ? words.map(definite) : words).join(' ');
  const key = [
    'piece',
    isDefinite ? 'definite' : 'indefinite',
    piece.shape,
    piece.color,
    ...(includeSize ? [piece.size] : []),
  ].join('.');
  return { key, text };
}

export function binLabel(bin: SortBin): Utterance {
  switch (bin.dimension) {
    case 'color':
      return colorName(bin.value);
    case 'shape':
      return shapeName(bin.value);
    case 'size':
      return sizeName(bin.value);
  }
}

export function avatarLabel(avatar: Avatar): Utterance {
  return describePiece(avatarPiece(avatar), { definite: false });
}
