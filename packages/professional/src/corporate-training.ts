import { z } from 'zod';

export const CORPORATE_SEAT_STATUSES = [
  'INVITED',
  'ACTIVE',
  'COMPLETED',
  'REVOKED',
] as const;

export type CorporateSeatStatus = (typeof CORPORATE_SEAT_STATUSES)[number];

export const corporateOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(160),
  seatLimit: z.number().int().positive(),
});

export const corporateSeatSchema = z.object({
  seatId: z.string().min(1),
  organizationId: z.string().min(1),
  learnerId: z.string().min(1),
  status: z.enum(CORPORATE_SEAT_STATUSES),
});

export type CorporateOrganization = z.infer<typeof corporateOrganizationSchema>;
export type CorporateSeat = z.infer<typeof corporateSeatSchema>;

export function summarizeSeatAllocation(
  organization: CorporateOrganization,
  seats: readonly CorporateSeat[],
) {
  const validatedOrganization = corporateOrganizationSchema.parse(organization);
  const validatedSeats = seats.map((seat) => corporateSeatSchema.parse(seat));

  const organizationSeats = validatedSeats.filter(
    (seat) => seat.organizationId === validatedOrganization.organizationId,
  );
  const allocatedSeats = organizationSeats.filter((seat) => seat.status !== 'REVOKED').length;
  const activeSeats = organizationSeats.filter((seat) => seat.status === 'ACTIVE').length;
  const completedSeats = organizationSeats.filter((seat) => seat.status === 'COMPLETED').length;
  const availableSeats = Math.max(0, validatedOrganization.seatLimit - allocatedSeats);

  return {
    seatLimit: validatedOrganization.seatLimit,
    allocatedSeats,
    activeSeats,
    completedSeats,
    availableSeats,
    utilizationPercent: Math.round((allocatedSeats / validatedOrganization.seatLimit) * 100),
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
  const allowedTransitions: Record<CorporateSeatStatus, readonly CorporateSeatStatus[]> = {
    INVITED: ['ACTIVE', 'REVOKED'],
    ACTIVE: ['COMPLETED', 'REVOKED'],
    COMPLETED: [],
    REVOKED: [],
  };

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Invalid corporate seat transition: ${current} -> ${next}`);
  }
}
