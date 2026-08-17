import 'server-only';

import type { Prisma } from '@luminol/database';
import { randomUUID } from 'node:crypto';

export async function auditCohortDelivery(
  transaction: Prisma.TransactionClient,
  actorUserId: string,
  cohortId: string,
  action: string,
  subjectType: string,
  subjectId: string,
) {
  const id = randomUUID();
  await transaction.$executeRaw`
    INSERT INTO "CohortDeliveryAuditEvent"
      ("id", "cohortId", "actorUserId", "action", "subjectType", "subjectId")
    VALUES
      (${id}, ${cohortId}, ${actorUserId}, ${action}, ${subjectType}, ${subjectId})
  `;
}
