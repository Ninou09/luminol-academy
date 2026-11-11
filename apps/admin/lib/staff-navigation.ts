import type { PermissionKey } from '@luminol/types';

export const staffDestinations = [
  { key: 'overview', href: '/', permission: 'academy:manage' },
  { key: 'enquiries', href: '/enquiries', permission: 'enquiry:work' },
  { key: 'team', href: '/team', permission: 'team:manage' },
] as const satisfies readonly {
  key: string;
  href: string;
  permission: PermissionKey;
}[];

export type StaffDestination = (typeof staffDestinations)[number];
export type StaffDestinationKey = StaffDestination['key'];

export type PermissionCheck = (permission: PermissionKey) => boolean;

export function getStaffDestinations(can: PermissionCheck) {
  return staffDestinations.filter(({ permission }) => can(permission));
}

/**
 * Where a signed-in staff member without the academy overview should land.
 * Returns null when the account holds no administration capability at all.
 */
export function resolveStaffLanding(can: PermissionCheck): string | null {
  const destination = getStaffDestinations(can).find(
    ({ key }) => key !== 'overview',
  );
  return destination?.href ?? null;
}
