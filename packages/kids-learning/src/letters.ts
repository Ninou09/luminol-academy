import { z } from 'zod';

import { randomInt, sample, shuffle, type Random } from './random';

export const LETTER_IDS = [
  'alif',
  'ba',
  'ta',
  'tha',
  'jim',
  'hha',
  'kha',
  'dal',
  'dhal',
  'ra',
  'zay',
  'sin',
  'shin',
  'sad',
  'dad',
  'tta',
  'zza',
  'ayn',
  'ghayn',
  'fa',
  'qaf',
  'kaf',
  'lam',
  'mim',
  'nun',
  'ha',
  'waw',
  'ya',
] as const;
export const letterIdSchema = z.enum(LETTER_IDS);
export type LetterId = z.infer<typeof letterIdSchema>;

/** The isolated letter. Positional forms come from the font's own shaping. */
export const LETTER_CHARS: Record<LetterId, string> = {
  alif: 'ا',
  ba: 'ب',
  ta: 'ت',
  tha: 'ث',
  jim: 'ج',
  hha: 'ح',
  kha: 'خ',
  dal: 'د',
  dhal: 'ذ',
  ra: 'ر',
  zay: 'ز',
  sin: 'س',
  shin: 'ش',
  sad: 'ص',
  dad: 'ض',
  tta: 'ط',
  zza: 'ظ',
  ayn: 'ع',
  ghayn: 'غ',
  fa: 'ف',
  qaf: 'ق',
  kaf: 'ك',
  lam: 'ل',
  mim: 'م',
  nun: 'ن',
  ha: 'ه',
  waw: 'و',
  ya: 'ي',
};

/** These six never join the letter after them, so they have only two forms. */
export const NON_JOINING: ReadonlySet<LetterId> = new Set([
  'alif',
  'dal',
  'dhal',
  'ra',
  'zay',
  'waw',
]);

export const LETTER_POSITIONS = [
  'isolated',
  'initial',
  'medial',
  'final',
] as const;
export type LetterPosition = (typeof LETTER_POSITIONS)[number];

const ZWJ = '‍';

/**
 * The letter as written at a position in a word. Zero-width joiners make the
 * font draw the connected form, so no glyph data is bundled.
 */
export function letterForm(id: LetterId, position: LetterPosition): string {
  const char = LETTER_CHARS[id];
  const joins = !NON_JOINING.has(id);
  switch (position) {
    case 'isolated':
      return char;
    case 'initial':
      return joins ? `${char}${ZWJ}` : char;
    case 'medial':
      return joins ? `${ZWJ}${char}${ZWJ}` : `${ZWJ}${char}`;
    case 'final':
      return `${ZWJ}${char}`;
  }
}

/** Letters that are easy to confuse, mostly the same body with other dots. */
export const SIMILAR_LETTERS: readonly (readonly LetterId[])[] = [
  ['ba', 'ta', 'tha', 'nun', 'ya'],
  ['jim', 'hha', 'kha'],
  ['dal', 'dhal', 'ra', 'zay'],
  ['sin', 'shin', 'sad', 'dad'],
  ['fa', 'qaf', 'waw', 'mim'],
  ['tta', 'zza'],
  ['ayn', 'ghayn'],
  ['alif', 'lam', 'kaf'],
];

export type LetterChoiceLevel = {
  choices: number;
  /** When true, distractors look like the target. */
  similar: boolean;
};

export type LetterFormsLevel = {
  position: Exclude<LetterPosition, 'isolated'>;
  choices: number;
};

export type LetterRound = {
  target: LetterId;
  choices: LetterId[];
  correctIndex: number;
};

function finish(random: Random, target: LetterId, distractors: LetterId[]) {
  const choices = shuffle(random, [target, ...distractors]);
  return { target, choices, correctIndex: choices.indexOf(target) };
}

/** Find the same letter, or the letter that makes a sound. */
export function createLetterRound(
  level: LetterChoiceLevel,
  random: Random,
): LetterRound {
  if (level.similar) {
    const groups = SIMILAR_LETTERS.filter(
      (group) => group.length >= level.choices,
    );
    const group = groups[randomInt(random, groups.length)];
    if (group) {
      const [target, ...distractors] = sample(random, group, level.choices);
      if (target) return finish(random, target, distractors);
    }
  }
  const [target, ...distractors] = sample(random, LETTER_IDS, level.choices);
  if (!target) throw new Error('A letter round needs at least one choice.');
  return finish(random, target, distractors);
}

/** Find the form a letter takes at the start, middle or end of a word. */
export function createLetterFormsRound(
  level: LetterFormsLevel,
  random: Random,
): LetterRound {
  // Non-joining letters look the same at the start and in isolation.
  const pool =
    level.position === 'final'
      ? LETTER_IDS
      : LETTER_IDS.filter((id) => !NON_JOINING.has(id));
  const [target, ...distractors] = sample(random, pool, level.choices);
  if (!target) throw new Error('A forms round needs at least one choice.');
  return finish(random, target, distractors);
}

export type CountLevel = {
  max: number;
  choices: number;
};

export type CountRound = {
  count: number;
  choices: number[];
  correctIndex: number;
};

/** How many are there? Distractors are the nearest other numbers in range. */
export function createCountRound(
  level: CountLevel,
  random: Random,
): CountRound {
  const count = 1 + randomInt(random, level.max);
  const nearby = Array.from({ length: level.max }, (_, index) => index + 1)
    .filter((value) => value !== count)
    .sort(
      (left, right) =>
        Math.abs(left - count) - Math.abs(right - count) || left - right,
    );
  const choices = [count, ...nearby.slice(0, level.choices - 1)].sort(
    (left, right) => left - right,
  );
  return { count, choices, correctIndex: choices.indexOf(count) };
}
