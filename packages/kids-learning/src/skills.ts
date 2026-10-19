import type {
  CountLevel,
  LetterChoiceLevel,
  LetterFormsLevel,
} from './letters';
import type { AgeBand } from './profile';
import type { EmotionLevel, GreetingLevel, TurnLevel } from './social';

export type GameKind =
  | 'matching'
  | 'sorting'
  | 'cause-effect'
  | 'pattern'
  | 'memory'
  | 'puzzle'
  | 'letter-match'
  | 'letter-sound'
  | 'letter-forms'
  | 'trace'
  | 'count'
  | 'emotion'
  | 'situation'
  | 'turns'
  | 'greetings';
export type SortDimension = 'color' | 'shape' | 'size';

/**
 * `different`: distractors differ in both shape and color.
 * `same-color`: distractors share the target color, so shape must be noticed.
 * `same-shape`: distractors share the target shape, so color must be noticed.
 */
export type MatchingDistractors = 'different' | 'same-color' | 'same-shape';

export type MatchingLevel = {
  choices: number;
  distractors: MatchingDistractors;
};

export type SortingLevel = {
  bins: number;
  /** When true, the attributes that are not being sorted also change. */
  varyOthers: boolean;
};

export type CauseEffectLevel = {
  /** Target size as a share of the shorter side of the play area. */
  targetScale: number;
  /** When true, the target appears somewhere new on every trial. */
  moves: boolean;
};

export type PatternUnit = 'AB' | 'AAB' | 'ABB' | 'ABC';

export type PatternLevel = {
  pattern: PatternUnit;
  choices: number;
};

export type MemoryLevel = {
  pairs: number;
};

export type PuzzleLevel = {
  /** Halves or quarters; one piece is missing. */
  pieces: 2 | 4;
  choices: number;
};

export type TraceLevel = {
  /** `path` draws the whole letter, `dots` only checkpoints, `start` one dot. */
  guide: 'path' | 'dots' | 'start';
  /** Early levels use letters with one simple stroke. */
  letters: 'simple' | 'all';
};

type SkillBase<Id extends string> = {
  id: Id;
  ageBands: readonly AgeBand[];
  trialsPerActivity: number;
};

export type MatchingSkill = SkillBase<'match-shapes'> & {
  game: 'matching';
  levels: readonly MatchingLevel[];
};

export type SortingSkill = SkillBase<
  'sort-color' | 'sort-shape' | 'sort-size'
> & {
  game: 'sorting';
  dimension: SortDimension;
  levels: readonly SortingLevel[];
};

export type CauseEffectSkill = SkillBase<'cause-effect'> & {
  game: 'cause-effect';
  levels: readonly CauseEffectLevel[];
};

export type PatternSkill = SkillBase<'pattern-next'> & {
  game: 'pattern';
  levels: readonly PatternLevel[];
};

export type MemorySkill = SkillBase<'memory-pairs'> & {
  game: 'memory';
  levels: readonly MemoryLevel[];
};

export type PuzzleSkill = SkillBase<'puzzle-complete'> & {
  game: 'puzzle';
  levels: readonly PuzzleLevel[];
};

export type LetterMatchSkill = SkillBase<'letter-match'> & {
  game: 'letter-match';
  levels: readonly LetterChoiceLevel[];
};

export type LetterSoundSkill = SkillBase<'letter-sound'> & {
  game: 'letter-sound';
  levels: readonly LetterChoiceLevel[];
};

export type LetterFormsSkill = SkillBase<'letter-forms'> & {
  game: 'letter-forms';
  levels: readonly LetterFormsLevel[];
};

export type TraceSkill = SkillBase<'letter-trace'> & {
  game: 'trace';
  levels: readonly TraceLevel[];
};

export type CountSkill = SkillBase<'count-objects'> & {
  game: 'count';
  levels: readonly CountLevel[];
};

export type EmotionSkill = SkillBase<'emotion-find'> & {
  game: 'emotion';
  levels: readonly EmotionLevel[];
};

export type SituationSkill = SkillBase<'emotion-situation'> & {
  game: 'situation';
  levels: readonly EmotionLevel[];
};

export type TurnSkill = SkillBase<'turn-taking'> & {
  game: 'turns';
  levels: readonly TurnLevel[];
};

export type GreetingSkill = SkillBase<'greetings'> & {
  game: 'greetings';
  levels: readonly GreetingLevel[];
};

export type Skill =
  | EmotionSkill
  | SituationSkill
  | TurnSkill
  | GreetingSkill
  | LetterMatchSkill
  | LetterSoundSkill
  | LetterFormsSkill
  | TraceSkill
  | CountSkill
  | MatchingSkill
  | SortingSkill
  | CauseEffectSkill
  | PatternSkill
  | MemorySkill
  | PuzzleSkill;
export type SkillId = Skill['id'];

const ALL_AGES = ['3-4', '5-6', '7-8', '9-10'] as const;

export const SKILLS = {
  'cause-effect': {
    id: 'cause-effect',
    game: 'cause-effect',
    ageBands: ['3-4', '5-6'],
    trialsPerActivity: 6,
    levels: [
      { targetScale: 0.7, moves: false },
      { targetScale: 0.5, moves: false },
      { targetScale: 0.35, moves: true },
      { targetScale: 0.25, moves: true },
    ],
  },
  'match-shapes': {
    id: 'match-shapes',
    game: 'matching',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [
      { choices: 2, distractors: 'different' },
      { choices: 3, distractors: 'different' },
      { choices: 4, distractors: 'different' },
      { choices: 4, distractors: 'same-color' },
      { choices: 4, distractors: 'same-shape' },
    ],
  },
  'sort-color': {
    id: 'sort-color',
    game: 'sorting',
    dimension: 'color',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [
      { bins: 2, varyOthers: false },
      { bins: 2, varyOthers: true },
      { bins: 3, varyOthers: true },
      { bins: 4, varyOthers: true },
    ],
  },
  'sort-shape': {
    id: 'sort-shape',
    game: 'sorting',
    dimension: 'shape',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { bins: 2, varyOthers: false },
      { bins: 2, varyOthers: true },
      { bins: 3, varyOthers: true },
      { bins: 4, varyOthers: true },
    ],
  },
  'sort-size': {
    id: 'sort-size',
    game: 'sorting',
    dimension: 'size',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { bins: 2, varyOthers: false },
      { bins: 2, varyOthers: true },
      { bins: 3, varyOthers: false },
      { bins: 3, varyOthers: true },
    ],
  },
  'pattern-next': {
    id: 'pattern-next',
    game: 'pattern',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { pattern: 'AB', choices: 2 },
      { pattern: 'AB', choices: 3 },
      { pattern: 'AAB', choices: 3 },
      { pattern: 'ABB', choices: 3 },
      { pattern: 'ABC', choices: 3 },
    ],
  },
  'memory-pairs': {
    id: 'memory-pairs',
    game: 'memory',
    ageBands: ALL_AGES,
    trialsPerActivity: 6,
    levels: [{ pairs: 2 }, { pairs: 3 }, { pairs: 4 }, { pairs: 6 }],
  },
  'puzzle-complete': {
    id: 'puzzle-complete',
    game: 'puzzle',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [
      { pieces: 2, choices: 2 },
      { pieces: 2, choices: 3 },
      { pieces: 4, choices: 3 },
      { pieces: 4, choices: 4 },
    ],
  },
  'letter-match': {
    id: 'letter-match',
    game: 'letter-match',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { choices: 2, similar: false },
      { choices: 3, similar: false },
      { choices: 4, similar: false },
      { choices: 3, similar: true },
      { choices: 4, similar: true },
    ],
  },
  'letter-sound': {
    id: 'letter-sound',
    game: 'letter-sound',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { choices: 2, similar: false },
      { choices: 3, similar: false },
      { choices: 4, similar: false },
      { choices: 3, similar: true },
      { choices: 4, similar: true },
    ],
  },
  'letter-forms': {
    id: 'letter-forms',
    game: 'letter-forms',
    ageBands: ['7-8', '9-10'],
    trialsPerActivity: 5,
    levels: [
      { position: 'final', choices: 2 },
      { position: 'final', choices: 3 },
      { position: 'initial', choices: 3 },
      { position: 'medial', choices: 3 },
      { position: 'medial', choices: 4 },
    ],
  },
  'letter-trace': {
    id: 'letter-trace',
    game: 'trace',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 3,
    levels: [
      { guide: 'path', letters: 'simple' },
      { guide: 'dots', letters: 'simple' },
      { guide: 'path', letters: 'all' },
      { guide: 'dots', letters: 'all' },
      { guide: 'start', letters: 'all' },
    ],
  },
  'count-objects': {
    id: 'count-objects',
    game: 'count',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [
      { max: 3, choices: 2 },
      { max: 5, choices: 3 },
      { max: 10, choices: 3 },
      { max: 10, choices: 4 },
      { max: 20, choices: 4 },
    ],
  },
  'emotion-find': {
    id: 'emotion-find',
    game: 'emotion',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [{ choices: 2 }, { choices: 3 }, { choices: 4 }, { choices: 5 }],
  },
  'emotion-situation': {
    id: 'emotion-situation',
    game: 'situation',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 4,
    levels: [{ choices: 2 }, { choices: 3 }, { choices: 4 }],
  },
  'turn-taking': {
    id: 'turn-taking',
    game: 'turns',
    ageBands: ALL_AGES,
    trialsPerActivity: 5,
    levels: [{ appTurns: 1 }, { appTurns: 2 }, { appTurns: 3 }],
  },
  greetings: {
    id: 'greetings',
    game: 'greetings',
    ageBands: ['5-6', '7-8', '9-10'],
    trialsPerActivity: 4,
    levels: [{ choices: 2 }, { choices: 3 }, { choices: 4 }],
  },
} as const satisfies { [Id in SkillId]: Skill & { id: Id } };

export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];

export function isSkillId(value: string): value is SkillId {
  return Object.hasOwn(SKILLS, value);
}

export function getSkill(id: SkillId): Skill {
  return SKILLS[id];
}

export function maxLevel(skill: Skill): number {
  return skill.levels.length;
}

/** Levels are 1-based; out-of-range values are clamped to the nearest level. */
export function levelSpec<S extends Skill>(
  skill: S,
  level: number,
): S['levels'][number] {
  const index = Math.min(Math.max(level, 1), skill.levels.length) - 1;
  const spec = skill.levels[index];
  if (spec === undefined) {
    throw new Error(`Skill ${skill.id} has no levels.`);
  }
  return spec;
}
