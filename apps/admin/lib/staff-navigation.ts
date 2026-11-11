import type { PermissionKey } from '@luminol/types';

export const staffDestinations = [
  { key: 'overview', href: '/', permissions: ['academy:manage'] },
  {
    key: 'consultations',
    href: '/consultations',
    permissions: ['consultation:manage', 'consultation:deliver'],
  },
  {
    key: 'clients',
    href: '/clients',
    permissions: ['consultation:manage', 'consultation:deliver'],
  },
  { key: 'enquiries', href: '/enquiries', permissions: ['enquiry:work'] },
  { key: 'team', href: '/team', permissions: ['team:manage'] },
] as const satisfies readonly {
  key: string;
  href: string;
  permissions: readonly PermissionKey[];
}[];

export type StaffDestination = (typeof staffDestinations)[number];
export type StaffDestinationKey = StaffDestination['key'];

export type PermissionCheck = (permission: PermissionKey) => boolean;

export function getStaffDestinations(can: PermissionCheck) {
  return staffDestinations.filter(({ permissions }) =>
    permissions.some((permission) => can(permission)),
  );
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
