import 'server-only';

import { requireUser } from '@luminol/auth';
import { getInstructorAssignedCohorts } from '@luminol/database';

/**
 * Resolves the instructor workspace from the synchronized signed-in actor only.
 * Browser-supplied user identifiers are never accepted by this boundary.
 */
export async function getAuthorizedInstructorWorkspace() {
  const user = await requireUser();
  const cohorts = await getInstructorAssignedCohorts(user.id);

  return {
    instructorUserId: user.id,
    cohorts,
  };
}

export async function hasInstructorWorkspaceAccess(userId: string) {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) return false;

  const cohorts = await getInstructorAssignedCohorts(normalizedUserId);
  return cohorts.length > 0;
}
