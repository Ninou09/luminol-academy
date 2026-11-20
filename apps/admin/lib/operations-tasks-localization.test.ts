import {
  operationsTaskKinds,
  operationsTaskPriorities,
  operationsTaskStatuses,
} from '@luminol/validation/operations-tasks';
import { describe, expect, it } from 'vitest';

import {
  getOperationsTasksCopy,
  getTodayCopy,
  operationsTaskFeedbackCodes,
  parseOperationsTaskFeedback,
} from './operations-tasks-localization';

describe('operations tasks localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'covers every kind, status, priority and feedback code in %s',
    (locale) => {
      const copy = getOperationsTasksCopy(locale);
      expect(copy.approvalBoundary).toBeTruthy();
      expect(getTodayCopy(locale).title).toBeTruthy();
      for (const kind of operationsTaskKinds)
        expect(copy.kind[kind]).toBeTruthy();
      for (const status of operationsTaskStatuses) {
        expect(copy.status[status]).toBeTruthy();
        expect(copy.moveTo[status]).toBeTruthy();
      }
      for (const priority of operationsTaskPriorities) {
        expect(copy.priority[priority]).toBeTruthy();
      }
      for (const code of operationsTaskFeedbackCodes) {
        expect(copy.feedback[code]).toBeTruthy();
      }
    },
  );

  it('states that approvals do not act automatically', () => {
    expect(getOperationsTasksCopy('en').approvalBoundary).toContain(
      'Nothing is posted, sent or paid automatically',
    );
    expect(parseOperationsTaskFeedback('stale')).toBe('stale');
    expect(parseOperationsTaskFeedback('x')).toBeNull();
  });
});
