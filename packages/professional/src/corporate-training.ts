import { z } from 'zod';

export const CORPORATE_SEAT_STATUSES = [
  'INVITED',
  'ACTIVE',
  'COMPLETED',
  'REVOKED',
] as const;

export type CorporateSeatStatus = (typeof CORPORATE_SEAT_STATUSES)[number];

export const CORPORATE_SEAT_TRANSITIONS = {
  INVITED: ['ACTIVE', 'REVOKED'],
  ACTIVE: ['COMPLETED', 'REVOKED'],
  COMPLETED: [],
  REVOKED: [],
} as const satisfies Record<
  CorporateSeatStatus,
  readonly CorporateSeatStatus[]
>;

export const CORPORATE_ORGANIZATION_STATUSES = [
  'ACTIVE',
  'SUSPENDED',
  'ARCHIVED',
] as const;

export type CorporateOrganizationStatus =
  (typeof CORPORATE_ORGANIZATION_STATUSES)[number];

export const CORPORATE_MEMBERSHIP_ROLES = [
  'OWNER',
  'MANAGER',
  'LEARNER',
] as const;

export type CorporateMembershipRole =
  (typeof CORPORATE_MEMBERSHIP_ROLES)[number];

export const CORPORATE_MANAGER_DATA_KINDS = [
  'SEAT_UTILIZATION',
  'ASSIGNMENT_PROGRESS',
  'COMPLETION_TOTALS',
  'ASSESSMENT_ANSWERS',
  'PSYCHOLOGY_CONTENT',
  'ENQUIRY_MESSAGES',
  'PERSONAL_FINANCE',
  'PRIVATE_CERTIFICATE_METADATA',
] as const;

export type CorporateManagerDataKind =
  (typeof CORPORATE_MANAGER_DATA_KINDS)[number];

export const corporateOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(160),
  seatLimit: z.number().int().positive(),
});

export const corporateOrganizationGovernanceSchema = z.object({
  organizationId: z.string().min(1),
  status: z.enum(CORPORATE_ORGANIZATION_STATUSES),
});

export const corporateSeatSchema = z.object({
  seatId: z.string().min(1),
  organizationId: z.string().min(1),
  learnerId: z.string().min(1),
  status: z.enum(CORPORATE_SEAT_STATUSES),
});

export const corporateMembershipSchema = z.object({
  membershipId: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(CORPORATE_MEMBERSHIP_ROLES),
  active: z.boolean(),
});

export const corporateTeamSchema = z.object({
  teamId: z.string().min(1),
  organizationId: z.string().min(1),
  name: z.string().trim().min(2).max(160),
  archived: z.boolean().default(false),
});

export const corporateProgressRecordSchema = z.object({
  organizationId: z.string().min(1),
  progressPercent: z.number().min(0).max(100),
  completed: z.boolean(),
});

export const corporateManagerDataKindSchema = z.enum(
  CORPORATE_MANAGER_DATA_KINDS,
);

export const CORPORATE_MANAGER_DATA_POLICY = {
  SEAT_UTILIZATION: true,
  ASSIGNMENT_PROGRESS: true,
  COMPLETION_TOTALS: true,
  ASSESSMENT_ANSWERS: false,
  PSYCHOLOGY_CONTENT: false,
  ENQUIRY_MESSAGES: false,
  PERSONAL_FINANCE: false,
  PRIVATE_CERTIFICATE_METADATA: false,
} as const satisfies Record<CorporateManagerDataKind, boolean>;

export type CorporateOrganization = z.infer<typeof corporateOrganizationSchema>;
export type CorporateOrganizationGovernance = z.infer<
  typeof corporateOrganizationGovernanceSchema
>;
export type CorporateSeat = z.infer<typeof corporateSeatSchema>;
export type CorporateMembership = z.infer<typeof corporateMembershipSchema>;
export type CorporateTeam = z.infer<typeof corporateTeamSchema>;
export type CorporateProgressRecord = z.infer<
  typeof corporateProgressRecordSchema
>;

export interface CorporateProgressSummary {
  assignmentCount: number;
  completedAssignments: number;
  activeAssignments: number;
  averageProgressPercent: number;
}

export function assertCorporateOrganizationScope(
  actorOrganizationId: string,
  targetOrganizationId: string,
) {
  const actorId = z.string().min(1).parse(actorOrganizationId);
  const targetId = z.string().min(1).parse(targetOrganizationId);

  if (actorId !== targetId) {
    throw new Error('Corporate organization scope mismatch');
  }
}

export function assertCorporateManagerAccess(
  membership: CorporateMembership,
  targetOrganizationId: string,
) {
  const validatedMembership = corporateMembershipSchema.parse(membership);

  assertCorporateOrganizationScope(
    validatedMembership.organizationId,
    targetOrganizationId,
  );

  if (!validatedMembership.active) {
    throw new Error('Corporate membership is inactive');
  }

  if (
    validatedMembership.role !== 'OWNER' &&
    validatedMembership.role !== 'MANAGER'
  ) {
    throw new Error('Corporate manager access required');
  }
}

export function canCorporateManagerViewData(role: unknown, dataKind: unknown) {
  const validatedRole = z.enum(CORPORATE_MEMBERSHIP_ROLES).safeParse(role);
  const validatedDataKind = corporateManagerDataKindSchema.safeParse(dataKind);

  if (!validatedRole.success || !validatedDataKind.success) {
    return false;
  }

  if (validatedRole.data !== 'OWNER' && validatedRole.data !== 'MANAGER') {
    return false;
  }

  return CORPORATE_MANAGER_DATA_POLICY[validatedDataKind.data];
}

export function assertCorporateSeatMutationScope(
  organizationId: string,
  seat: CorporateSeat,
) {
  const targetOrganizationId = z.string().min(1).parse(organizationId);
  const validatedSeat = corporateSeatSchema.parse(seat);

  if (validatedSeat.organizationId !== targetOrganizationId) {
    throw new Error('Corporate seat organization scope mismatch');
  }
}

export function summarizeCorporateProgress(
  organizationId: string,
  records: readonly CorporateProgressRecord[],
): CorporateProgressSummary {
  const targetOrganizationId = z.string().min(1).parse(organizationId);
  const validatedRecords = records.map((record) =>
    corporateProgressRecordSchema.parse(record),
  );
  const organizationRecords = validatedRecords.filter(
    (record) => record.organizationId === targetOrganizationId,
  );
  const assignmentCount = organizationRecords.length;
  const completedAssignments = organizationRecords.filter(
    (record) => record.completed,
  ).length;
  const progressTotal = organizationRecords.reduce(
    (total, record) => total + record.progressPercent,
    0,
  );

  return {
    assignmentCount,
    completedAssignments,
    activeAssignments: assignmentCount - completedAssignments,
    averageProgressPercent:
      assignmentCount === 0 ? 0 : Math.round(progressTotal / assignmentCount),
  };
}

export function summarizeSeatAllocation(
  organization: CorporateOrganization,
  seats: readonly CorporateSeat[],
) {
  const validatedOrganization = corporateOrganizationSchema.parse(organization);
  const validatedSeats = seats.map((seat) => corporateSeatSchema.parse(seat));

  const organizationSeats = validatedSeats.filter(
    (seat) => seat.organizationId === validatedOrganization.organizationId,
  );
  const allocatedSeats = organizationSeats.filter(
    (seat) => seat.status !== 'REVOKED',
  ).length;
  const activeSeats = organizationSeats.filter(
    (seat) => seat.status === 'ACTIVE',
  ).length;
  const completedSeats = organizationSeats.filter(
    (seat) => seat.status === 'COMPLETED',
  ).length;
  const availableSeats = Math.max(
    0,
    validatedOrganization.seatLimit - allocatedSeats,
  );

  return {
    seatLimit: validatedOrganization.seatLimit,
    allocatedSeats,
    activeSeats,
    completedSeats,
    availableSeats,
    utilizationPercent: Math.round(
      (allocatedSeats / validatedOrganization.seatLimit) * 100,
    ),
    isAtCapacity: allocatedSeats >= validatedOrganization.seatLimit,
  };
}

export function canAllocateCorporateSeat(
  organization: CorporateOrganization,
  seats: readonly CorporateSeat[],
) {
  return !summarizeSeatAllocation(organization, seats).isAtCapacity;
}

export function assertCorporateSeatTransition(
  current: CorporateSeatStatus,
  next: CorporateSeatStatus,
) {
  if (!CORPORATE_SEAT_TRANSITIONS[current].includes(next)) {
    throw new Error(`Invalid corporate seat transition: ${current} -> ${next}`);
  }
}
