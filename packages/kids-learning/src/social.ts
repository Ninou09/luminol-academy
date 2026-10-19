import type { AacPicture } from './aac';
import { sample, shuffle, type Random } from './random';

/** Feelings with face pictures on the communication board, clearest first. */
export const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'scared',
  'tired',
] as const satisfies readonly AacPicture[];
export type Emotion = (typeof EMOTIONS)[number];

/** Short stories with the feeling they usually bring; words live in content. */
export const SITUATIONS = {
  gift: 'happy',
  park: 'happy',
  'broken-toy': 'sad',
  'friend-left': 'sad',
  'toy-taken': 'angry',
  'tower-knocked': 'angry',
  thunder: 'scared',
  'barking-dog': 'scared',
  'long-day': 'tired',
  'long-walk': 'tired',
} as const satisfies Record<string, Emotion>;
export type SituationId = keyof typeof SITUATIONS;
export const SITUATION_IDS = Object.keys(SITUATIONS) as SituationId[];

/** Everyday moments and the polite words that go with each of them. */
export const GREETINGS = [
  'good-morning',
  'goodbye',
  'thanks',
  'peace',
  'good-night',
  'please',
  'excuse-me',
] as const;
export type GreetingId = (typeof GREETINGS)[number];

export type EmotionLevel = {
  choices: number;
};

export type GreetingLevel = {
  choices: number;
};

export type TurnLevel = {
  /** How many turns the app takes before it is the child's turn. */
  appTurns: number;
};

export type ChoiceRound<
  Target extends string,
  Choice extends string = Target,
> = {
  target: Target;
  choices: Choice[];
  correctIndex: number;
};

/**
 * Find a feeling's face. EMOTIONS is ordered from the clearest feeling, and
 * early levels draw from the clearest ones only.
 */
export function createEmotionRound(
  level: EmotionLevel,
  random: Random,
): ChoiceRound<Emotion> {
  const pool = EMOTIONS.slice(0, Math.max(level.choices + 1, 3));
  const [target, ...distractors] = sample(random, pool, level.choices);
  if (!target) throw new Error('An emotion round needs at least one choice.');
  const choices = shuffle(random, [target, ...distractors]);
  return { target, choices, correctIndex: choices.indexOf(target) };
}

/** A story and the faces to choose from, always including its feeling. */
export function createSituationRound(
  level: EmotionLevel,
  random: Random,
): ChoiceRound<SituationId, Emotion> {
  const [target] = sample(random, SITUATION_IDS, 1);
  if (!target) throw new Error('There are no situations.');
  const feeling: Emotion = SITUATIONS[target];
  const others = sample(
    random,
    EMOTIONS.filter((emotion) => emotion !== feeling),
    level.choices - 1,
  );
  const choices = shuffle(random, [feeling, ...others]);
  return { target, choices, correctIndex: choices.indexOf(feeling) };
}

/** A moment and the words to say; the moment's id is its correct answer. */
export function createGreetingRound(
  level: GreetingLevel,
  random: Random,
): ChoiceRound<GreetingId> {
  const [target, ...distractors] = sample(random, GREETINGS, level.choices);
  if (!target) throw new Error('A greeting round needs at least one choice.');
  const choices = shuffle(random, [target, ...distractors]);
  return { target, choices, correctIndex: choices.indexOf(target) };
}
