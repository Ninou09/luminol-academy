import {
  AAC_CARD_IDS,
  AAC_CATEGORIES,
  type AacCardId,
  type AacCategory,
  type AacPicture,
  type BoardCard,
} from '@luminol/kids-learning';

import type { Utterance } from './utterance';

/** Card words as they appear on the card and are spoken. */
const CARD_LABELS: Record<AacCardId, string> = {
  want: 'أريد',
  yes: 'نعم',
  no: 'لا',
  more: 'أكثر',
  finished: 'انتهيت',
  help: 'ساعدني',
  stop: 'توقّف',
  break: 'استراحة',
  water: 'ماء',
  food: 'طعام',
  toilet: 'حمّام',
  sleep: 'نوم',
  hurts: 'يؤلمني',
  hug: 'عناق',
  bread: 'خبز',
  milk: 'حليب',
  juice: 'عصير',
  apple: 'تفاحة',
  banana: 'موزة',
  dates: 'تمر',
  rice: 'أرز',
  egg: 'بيضة',
  happy: 'سعيد',
  sad: 'حزين',
  angry: 'غاضب',
  scared: 'خائف',
  tired: 'متعب',
  mother: 'أمي',
  father: 'أبي',
  teacher: 'المعلّم',
  play: 'لعب',
  park: 'حديقة',
  home: 'البيت',
  school: 'المدرسة',
  car: 'سيارة',
  book: 'كتاب',
  ball: 'كرة',
};

const CATEGORY_LABELS: Record<AacCategory, string> = {
  core: 'كلمات مهمّة',
  needs: 'حاجاتي',
  food: 'طعام',
  feelings: 'مشاعري',
  people: 'الناس',
  places: 'أماكن وأشياء',
};

/** Describes each bundled picture for parents choosing between pictures. */
const PICTURE_LABELS: Record<AacPicture, string> = {
  ...(Object.fromEntries(
    AAC_CARD_IDS.map((id) => [id, CARD_LABELS[id]]),
  ) as Record<AacCardId, string>),
  mother: 'أمي بحجاب',
  'mother-2': 'أمي دون حجاب',
};

export function aacCardLabel(id: AacCardId): string {
  return CARD_LABELS[id];
}

export function aacPictureLabel(picture: AacPicture): string {
  return PICTURE_LABELS[picture];
}

export function aacCategoryUtterance(category: AacCategory): Utterance {
  return { key: `aac.category.${category}`, text: CATEGORY_LABELS[category] };
}

/**
 * The word a card says. Parents' own cards are read by the device voice
 * unless the parent recorded one, so they have no recording key to share.
 */
export function aacCardUtterance(card: BoardCard): Utterance {
  return card.source === 'builtin'
    ? { key: `aac.card.${card.id}`, text: CARD_LABELS[card.id] }
    : { key: `aac.custom.${card.id}`, text: card.label };
}

export function aacBuiltinUtterances(): Utterance[] {
  return AAC_CARD_IDS.map((id) => ({
    key: `aac.card.${id}`,
    text: CARD_LABELS[id],
  }));
}

export function aacCategoryUtterances(): Utterance[] {
  return AAC_CATEGORIES.map(aacCategoryUtterance);
}
