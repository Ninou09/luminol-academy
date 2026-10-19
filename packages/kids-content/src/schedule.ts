import type { ScheduleStep } from '@luminol/kids-learning';

import { phrase, skillTitle } from './phrases';
import type { Utterance } from './utterance';

export function scheduleStepTitle(step: ScheduleStep): Utterance {
  return step.kind === 'finish'
    ? phrase('activity.finish')
    : skillTitle(step.skillId);
}

/**
 * "أوّلًا …، ثمّ …", read aloud whenever the child returns to the schedule.
 * It is spoken as separate recorded parts, so every pair of activities a
 * session can hold is covered without recording each pair.
 */
export function scheduleAnnouncement(
  first: ScheduleStep,
  then: ScheduleStep | null,
): Utterance[] {
  const firstPart = [phrase('schedule.first'), scheduleStepTitle(first)];
  return then
    ? [...firstPart, phrase('schedule.then'), scheduleStepTitle(then)]
    : firstPart;
}
