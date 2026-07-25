export const enquiryStatuses = [
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
  'CLOSED',
  'SPAM',
] as const;

export type EnquiryStatusValue = (typeof enquiryStatuses)[number];

const enquiryTransitions: Record<
  EnquiryStatusValue,
  readonly EnquiryStatusValue[]
> = {
  NEW: ['IN_REVIEW', 'SPAM'],
  IN_REVIEW: ['CONTACTED', 'NEW', 'SPAM'],
  CONTACTED: ['CLOSED', 'IN_REVIEW'],
  CLOSED: ['IN_REVIEW'],
  SPAM: ['NEW'],
};

export function getEnquiryTransitions(status: EnquiryStatusValue) {
  return enquiryTransitions[status];
}

export function isEnquiryTransitionAllowed(
  fromStatus: EnquiryStatusValue,
  toStatus: EnquiryStatusValue,
) {
  return enquiryTransitions[fromStatus].includes(toStatus);
}

export const enrollmentStatuses = [
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;

export type EnrollmentStatusValue = (typeof enrollmentStatuses)[number];

const enrollmentTransitions: Record<
  EnrollmentStatusValue,
  readonly EnrollmentStatusValue[]
> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['ACTIVE'],
  CANCELLED: ['PENDING'],
};

export function getEnrollmentTransitions(status: EnrollmentStatusValue) {
  return enrollmentTransitions[status];
}

export function isEnrollmentTransitionAllowed(
  fromStatus: EnrollmentStatusValue,
  toStatus: EnrollmentStatusValue,
) {
  return enrollmentTransitions[fromStatus].includes(toStatus);
}

export function calculateCompletionRate(
  completedEnrollments: number,
  trackedEnrollments: number,
) {
  if (trackedEnrollments <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round((completedEnrollments / trackedEnrollments) * 100)),
  );
}

export function displayPersonName(
  firstName: string | null,
  lastName: string | null,
  fallback: string,
) {
  const name = [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || fallback;
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
