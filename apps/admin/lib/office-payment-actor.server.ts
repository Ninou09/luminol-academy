import 'server-only';

import { AuthorizationError, hasPermission, requireUser } from '@luminol/auth';
import type { OfficePaymentActor } from '@luminol/database/office-payments';

import { resolveOfficePaymentScope } from './office-payment-scope';

export async function requireOfficePaymentActor() {
  const user = await requireUser();
  const scope = resolveOfficePaymentScope((permission) =>
    hasPermission(user.roles, permission),
  );
  if (!scope) throw new AuthorizationError();
  const actor: OfficePaymentActor = { userId: user.id, scope };
  return { user, actor };
}
