import { z } from 'zod';

import {
  aacLabelSchema,
  pictureChoiceSchema,
  voicePathSchema,
  type AacPicture,
  type PictureChoice,
} from './aac';
import type { StoryScene } from './social';
import type { GameOnlyPicture } from './themes';

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

export const sequenceStepSchema = z.object({
  id: z.uuid(),
  text: stepTextSchema,
  picture: pictureChoiceSchema,
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
