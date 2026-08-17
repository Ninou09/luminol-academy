import 'server-only';

import { requirePermission } from '@luminol/auth';
import { getAcademyProgrammeAnalytics } from '@luminol/database';

/**
 * Academy analytics are deliberately cross-learner aggregates. Authorization
 * is resolved from the synchronized server-side permission graph before the
 * privacy-suppressed database reader is invoked; no browser-supplied identity
 * or organization scope is trusted here.
 */
export async function getAuthorizedAcademyProgrammeAnalytics(now = new Date()) {
  await requirePermission('academy:manage');
  return getAcademyProgrammeAnalytics(now);
}
