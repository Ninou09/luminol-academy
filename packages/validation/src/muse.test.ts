import { expect, test } from 'vitest';
import {
  museCommandSchema,
  museKnowledgeSchema,
  museFollowUpSchema,
} from './muse';

test('rejects hidden autonomous execution fields and unbounded commands', () => {
  const command = {
    requestId: '54185969-ab22-493d-9fa3-b52881fcbeff',
    prompt: 'ملخص اليوم',
    locale: 'ar',
  };
  expect(museCommandSchema.safeParse(command).success).toBe(true);
  expect(
    museCommandSchema.safeParse({ ...command, execute: true }).success,
  ).toBe(false);
  expect(
    museCommandSchema.safeParse({ ...command, prompt: 'x'.repeat(1001) })
      .success,
  ).toBe(false);
});
test('requires a source, supported locale, and real calendar dates', () => {
  expect(
    museKnowledgeSchema.safeParse({
      title: 'Course FAQ',
      content: 'Verified answer',
      source: '',
      agent: 'courses',
      locale: 'ar',
    }).success,
  ).toBe(false);
  expect(
    museFollowUpSchema.safeParse({
      requestId: '54185969-ab22-493d-9fa3-b52881fcbeff',
      enquiryId: 'one',
      nextFollowUpOn: '2026-02-30',
      nextAction: 'Review lead',
    }).success,
  ).toBe(false);
});
