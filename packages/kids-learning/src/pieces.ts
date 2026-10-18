import { z } from 'zod';

/** Shapes and colors are drawn in code, so no external imagery is needed. */
export const SHAPES = [
  'circle',
  'square',
  'triangle',
  'star',
  'heart',
  'diamond',
] as const;
export const shapeSchema = z.enum(SHAPES);
export type Shape = z.infer<typeof shapeSchema>;

export const PIECE_COLORS = ['red', 'blue', 'yellow', 'green'] as const;
export const pieceColorSchema = z.enum(PIECE_COLORS);
export type PieceColor = z.infer<typeof pieceColorSchema>;

export const PIECE_SIZES = ['small', 'medium', 'large'] as const;
export const pieceSizeSchema = z.enum(PIECE_SIZES);
export type PieceSize = z.infer<typeof pieceSizeSchema>;

export const pieceSchema = z.object({
  shape: shapeSchema,
  color: pieceColorSchema,
  size: pieceSizeSchema,
});
export type Piece = z.infer<typeof pieceSchema>;

export function piecesEqual(left: Piece, right: Piece): boolean {
  return (
    left.shape === right.shape &&
    left.color === right.color &&
    left.size === right.size
  );
}

export function pieceKey(piece: Piece): string {
  return `${piece.shape}.${piece.color}.${piece.size}`;
}
