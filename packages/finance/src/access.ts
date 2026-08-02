import { z } from 'zod';

export const financePermissionSchema = z.enum([
  'finance:manage',
  'finance:refund',
  'finance:reconcile',
]);
export type FinancePermission = z.infer<typeof financePermissionSchema>;
export const financeActorSchema = z.object({
  userId: z.string().min(1),
  permissions: z.array(financePermissionSchema),
});
export type FinanceActor = z.infer<typeof financeActorSchema>;

export function requireFinancePermission(
  actorInput: FinanceActor,
  permission: FinancePermission,
) {
  const actor = financeActorSchema.parse(actorInput);
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes('finance:manage')
  )
    throw new Error('Finance operation is not authorized');
  return actor;
}
