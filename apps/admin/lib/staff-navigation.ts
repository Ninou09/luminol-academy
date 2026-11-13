import type { PermissionKey } from '@luminol/types';

export const staffDestinations = [
  { key: 'overview', href: '/', permissions: ['academy:manage'] },
  { key: 'dashboard', href: '/crm', permissions: ['academy:manage'] },
  { key: 'today', href: '/today', permissions: ['task:work'] },
  { key: 'pipeline', href: '/crm/pipeline', permissions: ['enquiry:work'] },
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
  {
    key: 'sections',
    href: '/crm/sections/psychology',
    permissions: [
      'enquiry:work',
      'consultation:manage',
      'consultation:deliver',
    ],
  },
  {
    key: 'payments',
    href: '/office-payments',
    permissions: ['office-payment:record'],
  },
  { key: 'enquiries', href: '/enquiries', permissions: ['enquiry:work'] },
  { key: 'tasks', href: '/tasks', permissions: ['task:work'] },
  { key: 'team', href: '/team', permissions: ['team:manage'] },
  {
    key: 'calendar',
    href: '/content-calendar',
    permissions: ['academy:manage'],
  },
  { key: 'approvals', href: '/approvals', permissions: ['task:work'] },
  { key: 'activity', href: '/activity', permissions: ['academy:manage'] },
] as const satisfies readonly {
  key: string;
  href: string;
  permissions: readonly PermissionKey[];
}[];

export type StaffDestination = (typeof staffDestinations)[number];
export type StaffDestinationKey = StaffDestination['key'];

export type PermissionCheck = (permission: PermissionKey) => boolean;

/** Sidebar display order; landing still follows `staffDestinations`. */
export const staffSidebarOrder = [
  'today',
  'pipeline',
  'clients',
  'consultations',
  'sections',
  'payments',
  'calendar',
  'approvals',
  'tasks',
  'activity',
  'enquiries',
  'dashboard',
  'team',
  'overview',
] as const satisfies readonly StaffDestinationKey[];

export function getStaffSidebar(can: PermissionCheck) {
  const allowed = getStaffDestinations(can);
  return staffSidebarOrder.flatMap(
    (key) => allowed.find((destination) => destination.key === key) ?? [],
  );
}

export function getStaffDestinations(can: PermissionCheck) {
  return staffDestinations.filter(({ permissions }) =>
    permissions.some((permission) => can(permission)),
  );
}

/**
 * Where a signed-in staff member without the academy overview should land.
 * Returns null when the account holds no administration capability at all.
 */
/** Owner-wide views that never serve as a staff landing page. */
const ownerOverviewDestinations: readonly StaffDestinationKey[] = [
  'overview',
  'dashboard',
  'calendar',
  'activity',
];

export function resolveStaffLanding(can: PermissionCheck): string | null {
  const destination = getStaffDestinations(can).find(
    ({ key }) => !ownerOverviewDestinations.includes(key),
  );
  return destination?.href ?? null;
}
