import { z } from 'zod';

import type { AgeBand, SessionMinutes } from './profile';
import { SKILLS, type SkillId } from './skills';

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
  '3-4': ['cause-effect', 'match-shapes', 'sort-color'],
  '5-6': [
    'match-shapes',
    'sort-color',
    'cause-effect',
    'sort-size',
    'sort-shape',
  ],
  '7-8': ['match-shapes', 'sort-shape', 'sort-color', 'sort-size'],
  '9-10': ['match-shapes', 'sort-shape', 'sort-size', 'sort-color'],
};

export type ActivityStep = {
  kind: 'activity';
  id: string;
  skillId: SkillId;
  trials: number;
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
});
export type SessionPlanInput = z.infer<typeof sessionPlanInputSchema>;

export function skillsForAge(ageBand: AgeBand): readonly SkillId[] {
  return SKILL_ROTATION[ageBand];
}

export function planSession(input: SessionPlanInput): ScheduleStep[] {
  const { ageBand, sessionMinutes, previousSessions } =
    sessionPlanInputSchema.parse(input);
  const rotation = SKILL_ROTATION[ageBand];
  const count = ACTIVITIES_PER_SESSION[sessionMinutes];
  const activities: ActivityStep[] = [];
  for (let index = 0; index < count; index += 1) {
    const skillId = rotation[(previousSessions + index) % rotation.length];
    if (skillId === undefined) continue;
    activities.push({
      kind: 'activity',
      id: `${index}-${skillId}`,
      skillId,
      trials: SKILLS[skillId].trialsPerActivity,
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
