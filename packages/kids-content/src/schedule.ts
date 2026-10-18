import type { ScheduleStep } from '@luminol/kids-learning';

import { phrase, skillTitle } from './phrases';
import type { Utterance } from './utterance';

export function scheduleStepTitle(step: ScheduleStep): Utterance {
  return step.kind === 'finish'
    ? phrase('activity.finish')
    : skillTitle(step.skillId);
}

/** "أوّلًا …، ثمّ …", read aloud whenever the child returns to the schedule. */
export function scheduleAnnouncement(
  first: ScheduleStep,
  then: ScheduleStep | null,
): Utterance {
  const firstTitle = scheduleStepTitle(first);
  const firstPart = `${phrase('schedule.first').text} ${firstTitle.text}`;
  if (!then) return { key: `schedule.${firstTitle.key}`, text: firstPart };
  const thenTitle = scheduleStepTitle(then);
  return {
    key: `schedule.${firstTitle.key}.${thenTitle.key}`,
    text: `${firstPart}، ${phrase('schedule.then').text} ${thenTitle.text}`,
  };
}
