import 'server-only';

import type { Prisma } from '@luminol/database';

export async function auditCohortDelivery(
  transaction: Prisma.TransactionClient,
  actorUserId: string,
  cohortId: string,
  action: string,
  subjectType: string,
  subjectId: string,
) {
  await transaction.$executeRaw`
    INSERT INTO "CohortDeliveryAuditEvent"
      ("cohortId", "actorUserId", "action", "subjectType", "subjectId")
    VALUES
      (${cohortId}, ${actorUserId}, ${action}, ${subjectType}, ${subjectId})
  `;
}
