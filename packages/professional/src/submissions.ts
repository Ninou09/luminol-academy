import { z } from 'zod';

export const PROFESSIONAL_SUBMISSION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
] as const;

export type ProfessionalSubmissionStatus =
  (typeof PROFESSIONAL_SUBMISSION_STATUSES)[number];

export const projectSubmissionSchema = z.object({
  learnerId: z.string().min(1),
  projectId: z.string().min(1),
  artifactUrl: z.string().url(),
  reflection: z.string().min(20).max(5000),
});

export const projectReviewSchema = z.object({
  reviewerId: z.string().min(1),
  score: z.number().min(0).max(100),
  feedback: z.string().min(10).max(5000),
  requiresRevision: z.boolean(),
});

const allowedTransitions: Record<
  ProfessionalSubmissionStatus,
  readonly ProfessionalSubmissionStatus[]
> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['REVISION_REQUIRED', 'APPROVED', 'REJECTED'],
  REVISION_REQUIRED: ['SUBMITTED'],
  APPROVED: [],
  REJECTED: [],
};

export function assertSubmissionTransition(
  from: ProfessionalSubmissionStatus,
  to: ProfessionalSubmissionStatus,
) {
  if (!allowedTransitions[from].includes(to)) {
    throw new Error(`Invalid submission transition: ${from} -> ${to}`);
  }
}

export function determineReviewOutcome(
  input: z.input<typeof projectReviewSchema>,
) {
  const review = projectReviewSchema.parse(input);

  if (review.requiresRevision) {
    return {
      status: 'REVISION_REQUIRED' as const,
      passed: false,
      review,
    };
  }

  return {
    status: review.score >= 70 ? ('APPROVED' as const) : ('REJECTED' as const),
    passed: review.score >= 70,
    review,
  };
}
