import type { AgeBand } from './profile';

export type GameKind = 'matching' | 'sorting' | 'cause-effect';
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

export type Skill = MatchingSkill | SortingSkill | CauseEffectSkill;
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
