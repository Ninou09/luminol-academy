import { z } from 'zod';

import {
  disabledSkillsSchema,
  type AgeBand,
  type SessionMinutes,
} from './profile';
import { SKILLS, type GameKind, type SkillId } from './skills';
import { interestsSchema, type ThemeId } from './themes';

/**
 * Session length is expressed as a number of short activities, not a clock:
 * the child never sees a timer, and a slow trial never cuts an activity short.
 */
export const ACTIVITIES_PER_SESSION: Record<SessionMinutes, number> = {
  5: 2,
  10: 3,
  15: 4,
  20: 5,
};

/** Rotation order per age band; the first entries suit that age best. */
const SKILL_ROTATION: Record<AgeBand, readonly SkillId[]> = {
  '3-4': [
    'cause-effect',
    'match-shapes',
    'memory-pairs',
    'sort-color',
    'puzzle-complete',
    'turn-taking',
    'count-objects',
    'emotion-find',
  ],
  '5-6': [
    'match-shapes',
    'sort-color',
    'memory-pairs',
    'cause-effect',
    'pattern-next',
    'puzzle-complete',
    'sort-size',
    'letter-match',
    'count-objects',
    'sort-shape',
    'letter-trace',
    'letter-sound',
    'emotion-find',
    'turn-taking',
    'emotion-situation',
    'greetings',
    'sequence-steps',
  ],
  '7-8': [
    'match-shapes',
    'sort-shape',
    'pattern-next',
    'memory-pairs',
    'puzzle-complete',
    'sort-color',
    'letter-sound',
    'letter-trace',
    'sort-size',
    'letter-forms',
    'count-objects',
    'emotion-situation',
    'greetings',
    'turn-taking',
    'emotion-find',
    'sequence-steps',
  ],
  '9-10': [
    'match-shapes',
    'sort-shape',
    'pattern-next',
    'puzzle-complete',
    'memory-pairs',
    'sort-size',
    'letter-forms',
    'letter-sound',
    'sort-color',
    'letter-trace',
    'count-objects',
    'greetings',
    'emotion-situation',
    'turn-taking',
    'emotion-find',
    'sequence-steps',
  ],
};

/** Games that show pictures and can wear a child's interest theme. */
const THEMED_GAMES: ReadonlySet<GameKind> = new Set([
  'matching',
  'cause-effect',
  'pattern',
  'memory',
  'puzzle',
  'count',
]);

export type ActivityStep = {
  kind: 'activity';
  id: string;
  skillId: SkillId;
  trials: number;
  /** Sorting is about shape, color and size, so it always uses shapes. */
  theme: ThemeId;
};

/** The "then" at the end of every schedule: a calm celebration. */
export type FinishStep = { kind: 'finish'; id: 'finish' };

export type ScheduleStep = ActivityStep | FinishStep;

export const sessionPlanInputSchema = z.object({
  ageBand: z.enum(['3-4', '5-6', '7-8', '9-10']),
  sessionMinutes: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
  ]),
  /** How many sessions this child has started before, used for rotation. */
  previousSessions: z.int().min(0),
  interests: interestsSchema.default(['shapes']),
  disabledSkills: disabledSkillsSchema.default([]),
  /** Activities the current plan does not include; never scheduled. */
  lockedSkills: disabledSkillsSchema.default([]),
});
export type SessionPlanInput = z.input<typeof sessionPlanInputSchema>;

export function skillsForAge(ageBand: AgeBand): readonly SkillId[] {
  return SKILL_ROTATION[ageBand];
}

/**
 * The age band's rotation without locked activities and without the ones a
 * parent switched off. If every activity the plan includes is off, all of
 * them are used so a session never comes up empty.
 */
export function enabledSkills(
  ageBand: AgeBand,
  disabledSkills: readonly SkillId[],
  lockedSkills: readonly SkillId[] = [],
): readonly SkillId[] {
  const unlocked = SKILL_ROTATION[ageBand].filter(
    (skillId) => !lockedSkills.includes(skillId),
  );
  const enabled = unlocked.filter(
    (skillId) => !disabledSkills.includes(skillId),
  );
  return enabled.length > 0 ? enabled : unlocked;
}

export function planSession(input: SessionPlanInput): ScheduleStep[] {
  const {
    ageBand,
    sessionMinutes,
    previousSessions,
    interests,
    disabledSkills,
    lockedSkills,
  } = sessionPlanInputSchema.parse(input);
  const rotation = enabledSkills(ageBand, disabledSkills, lockedSkills);
  const count = ACTIVITIES_PER_SESSION[sessionMinutes];
  const activities: ActivityStep[] = [];
  let themed = 0;
  for (let index = 0; index < count; index += 1) {
    const skillId = rotation[(previousSessions + index) % rotation.length];
    if (skillId === undefined) continue;
    let theme: ThemeId = 'shapes';
    if (THEMED_GAMES.has(SKILLS[skillId].game)) {
      theme =
        interests[(previousSessions + themed) % interests.length] ?? 'shapes';
      themed += 1;
    }
    activities.push({
      kind: 'activity',
      id: `${index}-${skillId}`,
      skillId,
      trials: SKILLS[skillId].trialsPerActivity,
      theme,
    });
  }
  return [...activities, { kind: 'finish', id: 'finish' }];
}

/** The "first → then" pair shown at the top of the schedule screen. */
export function firstThen(
  steps: readonly ScheduleStep[],
  completed: number,
): { first: ScheduleStep; then: ScheduleStep | null } | null {
  const first = steps[completed];
  if (first === undefined) return null;
  return { first, then: steps[completed + 1] ?? null };
}
