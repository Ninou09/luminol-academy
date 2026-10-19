import type { ThemeId, Token } from '@luminol/kids-learning';

import { aacPictureLabel } from './aac';
import { describePiece } from './pieces';
import type { Utterance } from './utterance';

export const THEME_LABELS: Record<ThemeId, string> = {
  shapes: 'الأشكال والألوان',
  food: 'الطعام',
  things: 'ألعاب وأماكن',
};

/**
 * Names what a game shows. Theme pictures are board words, so they reuse the
 * board's recordings.
 */
export function tokenUtterance(token: Token): Utterance {
  return token.kind === 'shape'
    ? describePiece(token.piece)
    : {
        key: `aac.card.${token.picture}`,
        text: aacPictureLabel(token.picture),
      };
}
