import { describe, expect, it } from 'vitest';

import {
  getOperationsTaskTransitions,
  isOperationsTaskTransitionAllowed,
  operationsDecisionNoteSchema,
} from './operations-tasks';

describe('operations task lifecycle', () => {
  it('lets workers complete, cancel and reopen ordinary tasks', () => {
    expect(getOperationsTaskTransitions('TASK', 'OPEN', 'worker')).toEqual([
      'DONE',
      'CANCELLED',
    ]);
    expect(getOperationsTaskTransitions('TASK', 'DONE', 'worker')).toEqual([
      'OPEN',
    ]);
    expect(
      getOperationsTaskTransitions('TASK', 'CANCELLED', 'approver'),
    ).toEqual([]);
  });

  it('reserves approval decisions for approvers', () => {
    expect(
      isOperationsTaskTransitionAllowed(
        'APPROVAL',
        'OPEN',
        'APPROVED',
        'worker',
      ),
    ).toBe(false);
    expect(
      isOperationsTaskTransitionAllowed(
        'APPROVAL',
        'OPEN',
        'APPROVED',
        'approver',
      ),
    ).toBe(true);
    expect(getOperationsTaskTransitions('APPROVAL', 'OPEN', 'worker')).toEqual([
      'CANCELLED',
    ]);
    expect(
      getOperationsTaskTransitions('APPROVAL', 'APPROVED', 'approver'),
    ).toEqual([]);
  });

  it('bounds decision notes', () => {
    expect(operationsDecisionNoteSchema.parse('  ')).toBeNull();
    expect(() => operationsDecisionNoteSchema.parse('x'.repeat(241))).toThrow();
  });
});
