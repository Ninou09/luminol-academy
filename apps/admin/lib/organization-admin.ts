import {
  assertCorporateOrganizationScope,
  assertCorporateSeatTransition,
  CORPORATE_MEMBERSHIP_ROLES,
  CORPORATE_SEAT_STATUSES,
  CORPORATE_SEAT_TRANSITIONS,
} from '@luminol/professional';
import type {
  CorporateMembershipRole,
  CorporateSeatStatus,
} from '@luminol/professional';

export const ORGANIZATION_MEMBERSHIP_ROLES = CORPORATE_MEMBERSHIP_ROLES;
export const ORGANIZATION_SEAT_STATUSES = CORPORATE_SEAT_STATUSES;
export const ORGANIZATION_SEAT_TRANSITIONS = CORPORATE_SEAT_TRANSITIONS;

export type OrganizationMembershipRole = CorporateMembershipRole;
export type OrganizationSeatStatus = CorporateSeatStatus;

export const assertOrganizationScope = assertCorporateOrganizationScope;

export function getOrganizationSeatLifecycleUpdate(
  current: OrganizationSeatStatus,
  next: OrganizationSeatStatus,
  now: Date,
) {
  assertCorporateSeatTransition(current, next);

  if (next === 'ACTIVE') {
    return {
      status: next,
      activatedAt: now,
      completedAt: null,
      revokedAt: null,
    } as const;
  }

  if (next === 'COMPLETED') {
    return {
      status: next,
      completedAt: now,
      revokedAt: null,
    } as const;
  }

  return {
    status: next,
    revokedAt: now,
  } as const;
}
