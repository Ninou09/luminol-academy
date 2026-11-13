import 'server-only';

import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';

import type { StaffDestinationKey } from './staff-navigation';

export type StaffBadges = Partial<Record<StaffDestinationKey, number>>;

/**
 * Sidebar counts, scoped like the screens they point to: new leads to
 * contact (all for the owner, own or unassigned for agents) and open owner
 * approval requests for people who decide them.
 */
export async function getStaffBadges(user: {
  id: string;
  roles: Parameters<typeof hasPermission>[0];
}): Promise<StaffBadges> {
  const can = (permission: Parameters<typeof hasPermission>[1]) =>
    hasPermission(user.roles, permission);
  const [newLeads, approvals] = await Promise.all([
    can('enquiry:work')
      ? db.enquiry.count({
          where: newLeadsWhere(user.id, can('academy:manage')),
        })
      : 0,
    can('approval:decide')
      ? db.operationsTask.count({ where: { kind: 'APPROVAL', status: 'OPEN' } })
      : 0,
  ]);
  return {
    ...(newLeads > 0 ? { pipeline: newLeads } : {}),
    ...(approvals > 0 ? { approvals } : {}),
  };
}

/** New leads waiting for first contact that the actor is responsible for. */
export function newLeadsWhere(userId: string, seesAll: boolean) {
  return {
    status: 'NEW' as const,
    ...(seesAll
      ? {}
      : { OR: [{ ownerUserId: userId }, { ownerUserId: null }] }),
  };
}
