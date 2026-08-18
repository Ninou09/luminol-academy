import 'server-only';

import { requirePermission } from '@luminol/auth';
import {
  getAcademyProfessionalProjectAnalytics,
  getAcademyProgrammeAnalytics,
} from '@luminol/database';

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

/**
 * Combines first-party learning and professional project workflow aggregates
 * behind one academy authorization check. Both database readers enforce their
 * own privacy suppression and return no learner-authored project content.
 */
export async function getAuthorizedAcademyAnalytics(now = new Date()) {
  await requirePermission('academy:manage');
  const [programmes, professionalProjects] = await Promise.all([
    getAcademyProgrammeAnalytics(now),
    getAcademyProfessionalProjectAnalytics(),
  ]);

  return { programmes, professionalProjects };
}
