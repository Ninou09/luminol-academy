import {
  LETTER_CHARS,
  LETTER_IDS,
  type LetterId,
  type NumeralStyle,
} from '@luminol/kids-learning';

import type { Utterance } from './utterance';

const LETTER_NAMES: Record<LetterId, string> = {
  alif: 'ألف',
  ba: 'باء',
  ta: 'تاء',
  tha: 'ثاء',
  jim: 'جيم',
  hha: 'حاء',
  kha: 'خاء',
  dal: 'دال',
  dhal: 'ذال',
  ra: 'راء',
  zay: 'زاي',
  sin: 'سين',
  shin: 'شين',
  sad: 'صاد',
  dad: 'ضاد',
  tta: 'طاء',
  zza: 'ظاء',
  ayn: 'عين',
  ghayn: 'غين',
  fa: 'فاء',
  qaf: 'قاف',
  kaf: 'كاف',
  lam: 'لام',
  mim: 'ميم',
  nun: 'نون',
  ha: 'هاء',
  waw: 'واو',
  ya: 'ياء',
};

const FATHA = 'َ';

export function letterNameUtterance(id: LetterId): Utterance {
  return { key: `letter.name.${id}`, text: LETTER_NAMES[id] };
}

/** The letter's sound with a short "a": "بَ". Alif carries a hamza: "أَ". */
export function letterSoundUtterance(id: LetterId): Utterance {
  const base = id === 'alif' ? 'أ' : LETTER_CHARS[id];
  return { key: `letter.sound.${id}`, text: `${base}${FATHA}` };
}

export function letterUtterances(): Utterance[] {
  return LETTER_IDS.flatMap((id) => [
    letterNameUtterance(id),
    letterSoundUtterance(id),
  ]);
}

/** Counting words as said when counting objects aloud. */
const NUMBER_WORDS = [
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
  'عشرون',
] as const;

export const MAX_SPOKEN_NUMBER = NUMBER_WORDS.length;

export function numberUtterance(value: number): Utterance {
  const text = NUMBER_WORDS[value - 1];
  if (text === undefined) {
    throw new Error(`No spoken word for ${value}.`);
  }
  return { key: `number.${value}`, text };
}

export function numberUtterances(): Utterance[] {
  return NUMBER_WORDS.map((_, index) => numberUtterance(index + 1));
}

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';

/** Digits the child sees, in the style the parent chose. */
export function formatNumber(value: number, style: NumeralStyle): string {
  const western = String(value);
  return style === 'western'
    ? western
    : western.replace(/\d/g, (digit) => ARABIC_INDIC[Number(digit)] ?? digit);
}
