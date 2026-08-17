export const COHORT_STATUSES = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;

export const COHORT_INSTRUCTOR_ROLES = [
  'LEAD',
  'ASSISTANT',
  'REVIEWER',
] as const;

export type CohortStatus = (typeof COHORT_STATUSES)[number];
export type CohortInstructorRole = (typeof COHORT_INSTRUCTOR_ROLES)[number];

const COHORT_STATUS_TRANSITIONS: Record<CohortStatus, readonly CohortStatus[]> =
  {
    PLANNED: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

export function getCohortStatusTransitions(status: CohortStatus) {
  return COHORT_STATUS_TRANSITIONS[status];
}

export function isCohortStatusTransitionAllowed(
  from: CohortStatus,
  to: CohortStatus,
) {
  return COHORT_STATUS_TRANSITIONS[from].includes(to);
}

export function parseOptionalLocalDateTime(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid cohort date');
  return date;
}

export function displayCohortPersonName(person: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return name ? `${name} · ${person.email}` : person.email;
}
