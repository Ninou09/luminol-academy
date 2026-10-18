import { z } from 'zod';

export const AAC_CATEGORIES = [
  'core',
  'needs',
  'food',
  'feelings',
  'people',
  'places',
] as const;
export const aacCategorySchema = z.enum(AAC_CATEGORIES);
export type AacCategory = z.infer<typeof aacCategorySchema>;

/** Bundled pictures; each has a matching file in apps/kids/assets/aac. */
export const AAC_PICTURES = [
  'want',
  'yes',
  'no',
  'more',
  'finished',
  'help',
  'stop',
  'break',
  'water',
  'food',
  'toilet',
  'sleep',
  'hurts',
  'hug',
  'bread',
  'milk',
  'juice',
  'apple',
  'banana',
  'dates',
  'rice',
  'egg',
  'happy',
  'sad',
  'angry',
  'scared',
  'tired',
  'mother',
  'mother-2',
  'father',
  'teacher',
  'play',
  'park',
  'home',
  'school',
  'car',
  'book',
  'ball',
] as const;
export const aacPictureSchema = z.enum(AAC_PICTURES);
export type AacPicture = z.infer<typeof aacPictureSchema>;

type BuiltinCardSpec = {
  category: AacCategory;
  /** The first picture is the default; parents may choose another. */
  pictures: readonly [AacPicture, ...AacPicture[]];
};

/** Built-in cards in board order. "mother" offers two pictures. */
export const AAC_BUILTIN_CARDS = {
  want: { category: 'core', pictures: ['want'] },
  yes: { category: 'core', pictures: ['yes'] },
  no: { category: 'core', pictures: ['no'] },
  more: { category: 'core', pictures: ['more'] },
  finished: { category: 'core', pictures: ['finished'] },
  help: { category: 'core', pictures: ['help'] },
  stop: { category: 'core', pictures: ['stop'] },
  break: { category: 'core', pictures: ['break'] },
  water: { category: 'needs', pictures: ['water'] },
  food: { category: 'needs', pictures: ['food'] },
  toilet: { category: 'needs', pictures: ['toilet'] },
  sleep: { category: 'needs', pictures: ['sleep'] },
  hurts: { category: 'needs', pictures: ['hurts'] },
  hug: { category: 'needs', pictures: ['hug'] },
  bread: { category: 'food', pictures: ['bread'] },
  milk: { category: 'food', pictures: ['milk'] },
  juice: { category: 'food', pictures: ['juice'] },
  apple: { category: 'food', pictures: ['apple'] },
  banana: { category: 'food', pictures: ['banana'] },
  dates: { category: 'food', pictures: ['dates'] },
  rice: { category: 'food', pictures: ['rice'] },
  egg: { category: 'food', pictures: ['egg'] },
  happy: { category: 'feelings', pictures: ['happy'] },
  sad: { category: 'feelings', pictures: ['sad'] },
  angry: { category: 'feelings', pictures: ['angry'] },
  scared: { category: 'feelings', pictures: ['scared'] },
  tired: { category: 'feelings', pictures: ['tired'] },
  mother: { category: 'people', pictures: ['mother', 'mother-2'] },
  father: { category: 'people', pictures: ['father'] },
  teacher: { category: 'people', pictures: ['teacher'] },
  play: { category: 'places', pictures: ['play'] },
  park: { category: 'places', pictures: ['park'] },
  home: { category: 'places', pictures: ['home'] },
  school: { category: 'places', pictures: ['school'] },
  car: { category: 'places', pictures: ['car'] },
  book: { category: 'places', pictures: ['book'] },
  ball: { category: 'places', pictures: ['ball'] },
} as const satisfies Record<string, BuiltinCardSpec>;

export type AacCardId = keyof typeof AAC_BUILTIN_CARDS;
export const AAC_CARD_IDS = Object.keys(AAC_BUILTIN_CARDS) as AacCardId[];
export const aacCardIdSchema = z.enum(
  AAC_CARD_IDS as [AacCardId, ...AacCardId[]],
);

export const MAX_SENTENCE_LENGTH = 6;
export const MAX_CUSTOM_CARDS = 60;
export const AAC_LABEL_MAX_LENGTH = 30;

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/**
 * Parent media lives under the app's private documents folder, one folder
 * per child. Paths are relative so they survive app updates, and the strict
 * pattern rules out traversal outside that folder.
 */
export const photoPathSchema = z
  .string()
  .regex(new RegExp(`^children/${UUID}/aac/${UUID}\\.jpg$`));
export const voicePathSchema = z
  .string()
  .regex(new RegExp(`^children/${UUID}/aac/${UUID}\\.m4a$`));

export const aacLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(AAC_LABEL_MAX_LENGTH)
  .refine((value) => !/[\p{Cc}<>]/u.test(value), {
    message: 'Label contains unsupported characters.',
  });

export const pictureChoiceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('builtin'), id: aacPictureSchema }),
  z.object({ kind: z.literal('photo'), path: photoPathSchema }),
]);
export type PictureChoice = z.infer<typeof pictureChoiceSchema>;

/** A parent's changes to one built-in card for one child. */
export const cardOverrideSchema = z.object({
  hidden: z.boolean(),
  picture: pictureChoiceSchema.nullable(),
  voicePath: voicePathSchema.nullable(),
});
export type CardOverride = z.infer<typeof cardOverrideSchema>;

export const customCardSchema = z.object({
  id: z.uuid(),
  label: aacLabelSchema,
  category: aacCategorySchema,
  photoPath: photoPathSchema,
  voicePath: voicePathSchema.nullable(),
  hidden: z.boolean(),
});
export type CustomCard = z.infer<typeof customCardSchema>;

export const aacBoardSchema = z.object({
  overrides: z.partialRecord(aacCardIdSchema, cardOverrideSchema),
  customCards: z.array(customCardSchema).max(MAX_CUSTOM_CARDS),
});
export type AacBoard = z.infer<typeof aacBoardSchema>;

export const EMPTY_AAC_BOARD: AacBoard = { overrides: {}, customCards: [] };

export const NO_OVERRIDE: CardOverride = {
  hidden: false,
  picture: null,
  voicePath: null,
};

export type BoardCard =
  | {
      source: 'builtin';
      id: AacCardId;
      category: AacCategory;
      picture: PictureChoice;
      voicePath: string | null;
      hidden: boolean;
    }
  | {
      source: 'custom';
      id: string;
      label: string;
      category: AacCategory;
      picture: PictureChoice;
      voicePath: string | null;
      hidden: boolean;
    };

export function builtinPictures(id: AacCardId): readonly AacPicture[] {
  return AAC_BUILTIN_CARDS[id].pictures;
}

/** A built-in picture override only counts if that card offers the picture. */
function builtinPicture(
  id: AacCardId,
  choice: PictureChoice | null,
): PictureChoice {
  const pictures: readonly AacPicture[] = AAC_BUILTIN_CARDS[id].pictures;
  if (choice?.kind === 'photo') return choice;
  if (choice?.kind === 'builtin' && pictures.includes(choice.id)) return choice;
  return { kind: 'builtin', id: pictures[0] ?? 'want' };
}

/** Every card for a child in board order: built-in cards, then the parent's own. */
export function resolveBoard(board: AacBoard): BoardCard[] {
  const builtins: BoardCard[] = AAC_CARD_IDS.map((id) => {
    const override = board.overrides[id] ?? NO_OVERRIDE;
    return {
      source: 'builtin',
      id,
      category: AAC_BUILTIN_CARDS[id].category,
      picture: builtinPicture(id, override.picture),
      voicePath: override.voicePath,
      hidden: override.hidden,
    };
  });
  const customs: BoardCard[] = board.customCards.map((card) => ({
    source: 'custom',
    id: card.id,
    label: card.label,
    category: card.category,
    picture: { kind: 'photo', path: card.photoPath },
    voicePath: card.voicePath,
    hidden: card.hidden,
  }));
  return [...builtins, ...customs];
}

export function visibleCards(
  board: AacBoard,
  category: AacCategory,
): BoardCard[] {
  return resolveBoard(board).filter(
    (card) => card.category === category && !card.hidden,
  );
}

export function findCard(board: AacBoard, id: string): BoardCard | null {
  return resolveBoard(board).find((card) => card.id === id) ?? null;
}

/** Adds a card to the sentence; a full sentence stays as it is. */
export function addToSentence(
  sentence: readonly string[],
  cardId: string,
): string[] {
  return sentence.length >= MAX_SENTENCE_LENGTH
    ? [...sentence]
    : [...sentence, cardId];
}

export function removeLastWord(sentence: readonly string[]): string[] {
  return sentence.slice(0, -1);
}

export function setOverride(
  board: AacBoard,
  id: AacCardId,
  override: CardOverride,
): AacBoard {
  const overrides = { ...board.overrides };
  const isDefault =
    !override.hidden &&
    override.picture === null &&
    override.voicePath === null;
  if (isDefault) delete overrides[id];
  else overrides[id] = override;
  return { ...board, overrides };
}

export function upsertCustomCard(board: AacBoard, card: CustomCard): AacBoard {
  const exists = board.customCards.some((existing) => existing.id === card.id);
  return {
    ...board,
    customCards: exists
      ? board.customCards.map((existing) =>
          existing.id === card.id ? card : existing,
        )
      : [...board.customCards, card],
  };
}

export function removeCustomCard(board: AacBoard, id: string): AacBoard {
  return {
    ...board,
    customCards: board.customCards.filter((card) => card.id !== id),
  };
}

/** Every parent photo and recording the board still points to. */
export function referencedMedia(board: AacBoard): Set<string> {
  const paths = new Set<string>();
  for (const override of Object.values(board.overrides)) {
    if (override.picture?.kind === 'photo') paths.add(override.picture.path);
    if (override.voicePath) paths.add(override.voicePath);
  }
  for (const card of board.customCards) {
    paths.add(card.photoPath);
    if (card.voicePath) paths.add(card.voicePath);
  }
  return paths;
}

/** Files the old board used that the new board no longer needs. */
export function releasedMedia(before: AacBoard, after: AacBoard): string[] {
  const kept = referencedMedia(after);
  return [...referencedMedia(before)].filter((path) => !kept.has(path));
}
