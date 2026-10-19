import type { AacPicture } from './aac';
import { pickOne, sample, shuffle, type Random } from './random';

/** Feelings with face pictures on the communication board, clearest first. */
export const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'scared',
  'tired',
] as const satisfies readonly AacPicture[];
export type Emotion = (typeof EMOTIONS)[number];

/**
 * Faces come as a boy and a girl. Seeing a feeling on more than one face
 * helps it carry over beyond one picture.
 */
export const FACE_CHARACTERS = ['boy', 'girl'] as const;
export type FaceCharacter = (typeof FACE_CHARACTERS)[number];

export const EMOTION_FACES = {
  boy: {
    happy: 'happy',
    sad: 'sad',
    angry: 'angry',
    scared: 'scared',
    tired: 'tired',
  },
  girl: {
    happy: 'happy-girl',
    sad: 'sad-girl',
    angry: 'angry-girl',
    scared: 'scared-girl',
    tired: 'tired-girl',
  },
} as const satisfies Record<FaceCharacter, Record<Emotion, AacPicture>>;

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

/**
 * Scene pictures for the stories that have one; each has a file in
 * apps/kids/assets/scenes. The other stories are told in words only.
 */
export const SITUATION_SCENES = {
  gift: 'sami-gift',
  'broken-toy': 'sami-broken-car',
  'toy-taken': 'sami-toy-taken',
  'tower-knocked': 'sami-tower-falling',
  thunder: 'sami-storm-window',
  'barking-dog': 'sami-barking-dog',
  'long-walk': 'sami-long-path',
} as const satisfies Partial<Record<SituationId, string>>;
export type StoryScene =
  (typeof SITUATION_SCENES)[keyof typeof SITUATION_SCENES];
export const STORY_SCENES = Object.values(SITUATION_SCENES) as StoryScene[];

export function situationScene(id: SituationId): StoryScene | null {
  return Object.hasOwn(SITUATION_SCENES, id)
    ? SITUATION_SCENES[id as keyof typeof SITUATION_SCENES]
    : null;
}

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
): ChoiceRound<Emotion> & { character: FaceCharacter } {
  const pool = EMOTIONS.slice(0, Math.max(level.choices + 1, 3));
  const [target, ...distractors] = sample(random, pool, level.choices);
  if (!target) throw new Error('An emotion round needs at least one choice.');
  const choices = shuffle(random, [target, ...distractors]);
  // All faces in a round belong to the same child, so only the feeling differs.
  const character = pickOne(random, FACE_CHARACTERS);
  return { target, choices, correctIndex: choices.indexOf(target), character };
}

/**
 * A story and the faces to choose from, always including its feeling. The
 * stories are about Sami, so they always use the boy's faces.
 */
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
