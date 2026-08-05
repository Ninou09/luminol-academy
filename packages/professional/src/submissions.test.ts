import { describe, expect, it } from 'vitest';

import {
  assertSubmissionTransition,
  determineReviewOutcome,
  projectSubmissionSchema,
} from './submissions';

describe('professional project submissions', () => {
  it('accepts a valid learner project submission', () => {
    expect(
      projectSubmissionSchema.parse({
        learnerId: 'learner-1',
        projectId: 'project-1',
        artifactUrl: 'https://example.com/portfolio/project-1',
        reflection:
          'This project demonstrates how I applied the course competencies.',
      }),
    ).toMatchObject({ learnerId: 'learner-1', projectId: 'project-1' });
  });

  it('rejects invalid lifecycle transitions', () => {
    expect(() => assertSubmissionTransition('DRAFT', 'APPROVED')).toThrow(
      'Invalid submission transition',
    );
  });

  it('allows a revised submission to be submitted again', () => {
    expect(() =>
      assertSubmissionTransition('REVISION_REQUIRED', 'SUBMITTED'),
    ).not.toThrow();
  });

  it('requires revision even when the numeric score is passing', () => {
    expect(
      determineReviewOutcome({
        reviewerId: 'reviewer-1',
        score: 82,
        feedback:
          'Strong work, but the evidence section needs a clearer explanation.',
        requiresRevision: true,
      }),
    ).toMatchObject({ status: 'REVISION_REQUIRED', passed: false });
  });

  it('approves submissions at the passing boundary', () => {
    expect(
      determineReviewOutcome({
        reviewerId: 'reviewer-1',
        score: 70,
        feedback:
          'The project meets the required competency evidence standard.',
        requiresRevision: false,
      }),
    ).toMatchObject({ status: 'APPROVED', passed: true });
  });

  it('rejects submissions below the passing boundary', () => {
    expect(
      determineReviewOutcome({
        reviewerId: 'reviewer-1',
        score: 69,
        feedback:
          'The submission does not yet demonstrate the required competencies.',
        requiresRevision: false,
      }),
    ).toMatchObject({ status: 'REJECTED', passed: false });
  });
});
