import {
  GAME_ONLY_PICTURES,
  isAacPicture,
  type GameOnlyPicture,
  type ThemeId,
  type Token,
} from '@luminol/kids-learning';

import { aacPictureLabel } from './aac';
import { describePiece } from './pieces';
import type { Utterance } from './utterance';

export const THEME_LABELS: Record<ThemeId, string> = {
  shapes: 'الأشكال والألوان',
  food: 'الطعام',
  things: 'ألعاب وأماكن',
  animals: 'الحيوانات',
  vehicles: 'وسائل النقل',
  space: 'السماء والفضاء',
};

const GAME_PICTURE_NAMES: Record<GameOnlyPicture, string> = {
  cat: 'قطة',
  dog: 'كلب',
  bird: 'عصفور',
  fish: 'سمكة',
  camel: 'جمل',
  horse: 'حصان',
  sheep: 'خروف',
  rabbit: 'أرنب',
  bus: 'حافلة',
  train: 'قطار',
  plane: 'طائرة',
  boat: 'قارب',
  bike: 'درّاجة',
  truck: 'شاحنة',
  helicopter: 'مروحيّة',
  tractor: 'جرّار',
  sun: 'شمس',
  crescent: 'هلال',
  star: 'نجمة',
  rocket: 'صاروخ',
  planet: 'كوكب',
  astronaut: 'رائد فضاء',
};

export function gamePictureName(picture: GameOnlyPicture): Utterance {
  return { key: `picture.${picture}`, text: GAME_PICTURE_NAMES[picture] };
}

export function gamePictureUtterances(): Utterance[] {
  return GAME_ONLY_PICTURES.map(gamePictureName);
}

/**
 * Names what a game shows. Board pictures are board words, so they reuse the
 * board's recordings.
 */
export function tokenUtterance(token: Token): Utterance {
  if (token.kind === 'shape') return describePiece(token.piece);
  return isAacPicture(token.picture)
    ? {
        key: `aac.card.${token.picture}`,
        text: aacPictureLabel(token.picture),
      }
    : gamePictureName(token.picture);
}
