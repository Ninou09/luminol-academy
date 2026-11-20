import 'server-only';

import { hasPermission, requirePermission } from '@luminol/auth';
import type { OperationsTaskActor } from '@luminol/database/operations-tasks';

export async function requireOperationsTaskActor() {
  const user = await requirePermission('task:work');
  const actor: OperationsTaskActor = {
    userId: user.id,
    canManage: hasPermission(user.roles, 'task:manage'),
    canDecide: hasPermission(user.roles, 'approval:decide'),
  };
  return { user, actor };
}
