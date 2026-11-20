import 'server-only';

import { AuthorizationError, hasPermission, requireUser } from '@luminol/auth';
import type { CrmActor } from '@luminol/database/crm';

import { resolveConsultationScope } from './consultation-scope';
import { resolveOfficePaymentScope } from './office-payment-scope';

export async function requireCrmActor() {
  const user = await requireUser();
  const can = (permission: Parameters<typeof hasPermission>[1]) =>
    hasPermission(user.roles, permission);
  const actor: CrmActor = {
    userId: user.id,
    canWorkEnquiries: can('enquiry:work'),
    consultationScope: resolveConsultationScope(can),
    paymentScope: resolveOfficePaymentScope(can),
  };
  if (
    !actor.canWorkEnquiries &&
    !actor.consultationScope &&
    !actor.paymentScope
  ) {
    throw new AuthorizationError();
  }
  return { user, actor, can };
}
