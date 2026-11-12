import 'server-only';

import { AuthorizationError, hasPermission, requireUser } from '@luminol/auth';
import type { ConsultationActor } from '@luminol/database/consultations';

import { resolveConsultationScope } from './consultation-scope';

/** Resolves the signed-in user's consultation reach from persisted roles. */
export async function requireConsultationActor() {
  const user = await requireUser();
  const scope = resolveConsultationScope((permission) =>
    hasPermission(user.roles, permission),
  );
  if (!scope) throw new AuthorizationError();
  const actor: ConsultationActor = { userId: user.id, scope };
  return { user, actor };
}
