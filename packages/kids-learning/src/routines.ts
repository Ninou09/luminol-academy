import { z } from 'zod';

import {
  aacLabelSchema,
  pictureChoiceSchema,
  voicePathSchema,
  type AacPicture,
  type PictureChoice,
} from './aac';
import { pickOne, sample, shuffle, type Random } from './random';
import type { StoryScene } from './social';
import type { GameOnlyPicture } from './themes';

/** Step pictures for everyday routines; each has a file in apps/kids/assets/routines. */
export const ROUTINE_PICTURES = [
  'wash-wet',
  'wash-soap',
  'wash-rinse',
  'wash-dry',
  'teeth-paste',
  'teeth-brush',
  'teeth-rinse',
  'teeth-cup',
  'dress-shirt',
  'dress-trousers',
  'dress-socks',
  'dress-shoes',
  'wudu-hands',
  'wudu-mouth',
  'wudu-nose',
  'wudu-face',
  'wudu-arms',
  'wudu-head',
  'wudu-ears',
  'wudu-feet',
  'prayer-boy-stand',
  'prayer-boy-bow',
  'prayer-boy-rise',
  'prayer-boy-prostrate',
  'prayer-boy-sit',
  'prayer-boy-salam',
  'prayer-girl-stand',
  'prayer-girl-bow',
  'prayer-girl-rise',
  'prayer-girl-prostrate',
  'prayer-girl-sit',
  'prayer-girl-salam',
] as const;
export const routinePictureSchema = z.enum(ROUTINE_PICTURES);
export type RoutinePicture = z.infer<typeof routinePictureSchema>;

/**
 * Routines and social stories are both ordered steps with a picture and a
 * sentence. A routine is followed step by step ("I did it"); a story is read
 * page by page.
 */
export const SEQUENCE_KINDS = ['routine', 'story'] as const;
export const sequenceKindSchema = z.enum(SEQUENCE_KINDS);
export type SequenceKind = z.infer<typeof sequenceKindSchema>;

export const MAX_SEQUENCE_STEPS = 12;
export const MAX_SEQUENCES = 30;
export const STEP_TEXT_MAX_LENGTH = 80;

/** A step's sentence: longer than a board word, still one short sentence. */
export const stepTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(STEP_TEXT_MAX_LENGTH)
  .refine((value) => !/[\p{Cc}<>]/u.test(value), {
    message: 'Text contains unsupported characters.',
  });

/** What a parent can put on a step: a board picture, a routine picture or a photo. */
export const stepPictureChoiceSchema = z.union([
  pictureChoiceSchema,
  z.object({ kind: z.literal('routine'), id: routinePictureSchema }),
]);
export type StepPictureChoice = z.infer<typeof stepPictureChoiceSchema>;

export const sequenceStepSchema = z.object({
  id: z.uuid(),
  text: stepTextSchema,
  picture: stepPictureChoiceSchema,
  voicePath: voicePathSchema.nullable(),
});
export type SequenceStep = z.infer<typeof sequenceStepSchema>;

/** A routine or story a parent made for one child. */
export const sequenceSchema = z.object({
  id: z.uuid(),
  kind: sequenceKindSchema,
  title: aacLabelSchema,
  steps: z.array(sequenceStepSchema).min(1).max(MAX_SEQUENCE_STEPS),
});
export type Sequence = z.infer<typeof sequenceSchema>;

export const childSequencesSchema = z.object({
  items: z.array(sequenceSchema).max(MAX_SEQUENCES),
});
export type ChildSequences = z.infer<typeof childSequencesSchema>;

export const EMPTY_SEQUENCES: ChildSequences = { items: [] };

export function upsertSequence(
  sequences: ChildSequences,
  sequence: Sequence,
): ChildSequences {
  const exists = sequences.items.some((item) => item.id === sequence.id);
  return {
    items: exists
      ? sequences.items.map((item) =>
          item.id === sequence.id ? sequence : item,
        )
      : [...sequences.items, sequence],
  };
}

export function removeSequence(
  sequences: ChildSequences,
  id: string,
): ChildSequences {
  return { items: sequences.items.filter((item) => item.id !== id) };
}

/** Moves a step one place earlier (-1) or later (+1); the ends stay put. */
export function moveStep<Step>(
  steps: readonly Step[],
  index: number,
  delta: -1 | 1,
): Step[] {
  const target = index + delta;
  const result = [...steps];
  const current = result[index];
  const other = result[target];
  if (current === undefined || other === undefined) return result;
  result[index] = other;
  result[target] = current;
  return result;
}

/** Every parent photo and recording the sequences point to. */
export function sequenceMedia(sequences: ChildSequences): Set<string> {
  const paths = new Set<string>();
  for (const sequence of sequences.items) {
    for (const step of sequence.steps) {
      if (step.picture.kind === 'photo') paths.add(step.picture.path);
      if (step.voicePath) paths.add(step.voicePath);
    }
  }
  return paths;
}

/** Files the old sequences used that the new ones no longer need. */
export function releasedSequenceMedia(
  before: ChildSequences,
  after: ChildSequences,
): string[] {
  const kept = sequenceMedia(after);
  return [...sequenceMedia(before)].filter((path) => !kept.has(path));
}

/** A picture on a step: a parent's choice, or bundled game art and scenes. */
export type StepPicture =
  | PictureChoice
  | { kind: 'routine'; id: RoutinePicture }
  | { kind: 'game'; id: GameOnlyPicture }
  | { kind: 'scene'; id: StoryScene };

const board = (id: AacPicture): StepPicture => ({ kind: 'builtin', id });
const game = (id: GameOnlyPicture): StepPicture => ({ kind: 'game', id });
const scene = (id: StoryScene): StepPicture => ({ kind: 'scene', id });

/** `religious` stories only appear when a parent switches the pack on. */
export type StoryPack = 'core' | 'religious';

/**
 * Built-in social stories, told only with reviewed pictures. The sentences
 * live in content under `story.<id>.<page>`.
 */
export const BUILTIN_STORIES = {
  angry: {
    pack: 'core',
    pages: [
      board('angry'),
      board('stop'),
      board('break'),
      board('hug'),
      board('happy'),
    ],
  },
  help: {
    pack: 'core',
    pages: [
      board('help'),
      board('teacher'),
      board('mother'),
      board('want'),
      board('happy'),
    ],
  },
  school: {
    pack: 'core',
    pages: [
      board('home'),
      game('bus'),
      board('school'),
      board('teacher'),
      board('play'),
      board('home'),
    ],
  },
  bedtime: {
    pack: 'core',
    pages: [
      board('food'),
      board('toilet'),
      board('book'),
      board('hug'),
      board('sleep'),
    ],
  },
  change: {
    pack: 'core',
    pages: [
      board('park'),
      scene('sami-storm-window'),
      board('home'),
      board('book'),
      board('happy'),
    ],
  },
  ramadan: {
    pack: 'religious',
    pages: [
      game('crescent'),
      game('sun'),
      board('dates'),
      board('food'),
      game('star'),
      board('happy'),
    ],
  },
  eid: {
    pack: 'religious',
    pages: [
      game('crescent'),
      board('hug'),
      board('home'),
      scene('sami-gift'),
      board('break'),
      board('happy'),
    ],
  },
} as const satisfies Record<
  string,
  { pack: StoryPack; pages: readonly StepPicture[] }
>;
export type BuiltinStoryId = keyof typeof BUILTIN_STORIES;
export const BUILTIN_STORY_IDS = Object.keys(
  BUILTIN_STORIES,
) as BuiltinStoryId[];

/** The built-in stories a child sees, with the religious pack only if on. */
export function availableStories(religiousPack: boolean): BuiltinStoryId[] {
  return BUILTIN_STORY_IDS.filter(
    (id) => religiousPack || BUILTIN_STORIES[id].pack === 'core',
  );
}

export function isBuiltinStoryId(value: string): value is BuiltinStoryId {
  return Object.hasOwn(BUILTIN_STORIES, value);
}

/** Prayer pictures show a boy or a girl; parents choose which. */
export const PRAYER_PICTURE_SETS = ['boy', 'girl'] as const;
export const prayerPicturesSchema = z.enum(PRAYER_PICTURE_SETS);
export type PrayerPictures = z.infer<typeof prayerPicturesSchema>;

const PRAYER_POSES = [
  'stand',
  'bow',
  'rise',
  'prostrate',
  'sit',
  'salam',
] as const;

function prayerSteps(set: PrayerPictures): RoutinePicture[] {
  return PRAYER_POSES.map((pose): RoutinePicture => `prayer-${set}-${pose}`);
}

/**
 * Built-in routines, in the order the steps are done. The sentences live in
 * content under `routine.<id>.<step>`.
 */
export const BUILTIN_ROUTINES = {
  handwashing: {
    pack: 'core',
    steps: () => ['wash-wet', 'wash-soap', 'wash-rinse', 'wash-dry'],
  },
  toothbrushing: {
    pack: 'core',
    steps: () => ['teeth-paste', 'teeth-brush', 'teeth-rinse', 'teeth-cup'],
  },
  dressing: {
    pack: 'core',
    steps: () => [
      'dress-shirt',
      'dress-trousers',
      'dress-socks',
      'dress-shoes',
    ],
  },
  wudu: {
    pack: 'religious',
    steps: () => [
      'wudu-hands',
      'wudu-mouth',
      'wudu-nose',
      'wudu-face',
      'wudu-arms',
      'wudu-head',
      'wudu-ears',
      'wudu-feet',
    ],
  },
  prayer: {
    pack: 'religious',
    steps: prayerSteps,
  },
} as const satisfies Record<
  string,
  { pack: StoryPack; steps: (set: PrayerPictures) => RoutinePicture[] }
>;
export type BuiltinRoutineId = keyof typeof BUILTIN_ROUTINES;
export const BUILTIN_ROUTINE_IDS = Object.keys(
  BUILTIN_ROUTINES,
) as BuiltinRoutineId[];

export function isBuiltinRoutineId(value: string): value is BuiltinRoutineId {
  return Object.hasOwn(BUILTIN_ROUTINES, value);
}

export function availableRoutines(religiousPack: boolean): BuiltinRoutineId[] {
  return BUILTIN_ROUTINE_IDS.filter(
    (id) => religiousPack || BUILTIN_ROUTINES[id].pack === 'core',
  );
}

export function routineSteps(
  id: BuiltinRoutineId,
  prayerPictures: PrayerPictures,
): RoutinePicture[] {
  return BUILTIN_ROUTINES[id].steps(prayerPictures);
}

export type SequenceLevel = {
  /** How many of a routine's steps the child puts in order. */
  steps: number;
};

export type SequenceRound = {
  routine: BuiltinRoutineId;
  /** Step numbers (0-based, in routine order) that the child orders. */
  order: number[];
  /** The same steps as they are dealt on screen. */
  dealt: number[];
};

/**
 * Put a routine's steps in order. Fewer steps than the routine has are
 * taken in their real order, so the answer is always the routine itself.
 */
export function createSequenceRound(
  level: SequenceLevel,
  religiousPack: boolean,
  random: Random,
): SequenceRound {
  const routine = pickOne(random, availableRoutines(religiousPack));
  const length = BUILTIN_ROUTINES[routine].steps('boy').length;
  const all = Array.from({ length }, (_, index) => index);
  const order = sample(random, all, Math.min(level.steps, length)).sort(
    (a, b) => a - b,
  );
  let dealt = shuffle(random, order);
  // Never deal the steps already in order, or there is nothing to do.
  if (order.length > 1 && dealt.every((step, index) => step === order[index])) {
    dealt = [...dealt.slice(1), ...dealt.slice(0, 1)];
  }
  return { routine, order, dealt };
}

/** Routine pictures a parent may pick, with wudu and prayer only in the pack. */
export function routinePicturesFor(religiousPack: boolean): RoutinePicture[] {
  const allowed = new Set(
    availableRoutines(religiousPack).flatMap((id) =>
      PRAYER_PICTURE_SETS.flatMap((set) => routineSteps(id, set)),
    ),
  );
  return ROUTINE_PICTURES.filter((picture) => allowed.has(picture));
}
