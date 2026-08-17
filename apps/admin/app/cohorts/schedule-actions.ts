'use server';

import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auditCohortDelivery } from '../../lib/cohort-delivery-audit.server';
import { parseOptionalLocalDateTime } from '../../lib/cohort-operations';

const scheduleSchema = z.object({
  cohortId: z.string().min(1).max(128),
});

export async function updateCohortSchedule(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const { cohortId } = scheduleSchema.parse({
    cohortId: formData.get('cohortId'),
  });
  const startsAt = parseOptionalLocalDateTime(formData.get('startsAt'));
  const endsAt = parseOptionalLocalDateTime(formData.get('endsAt'));

  if (startsAt && endsAt && endsAt < startsAt) {
    throw new Error('Cohort end must not precede start');
  }

  await db.$transaction(async (transaction) => {
    const updated = await transaction.cohort.updateMany({
      where: {
        id: cohortId,
        status: { in: ['PLANNED', 'ACTIVE'] },
      },
      data: { startsAt, endsAt },
    });
    if (updated.count !== 1) {
      throw new Error('Mutable cohort not found');
    }

    await auditCohortDelivery(
      transaction,
      administrator.id,
      cohortId,
      'cohort.schedule.updated',
      'cohort',
      cohortId,
    );
  });

  revalidatePath('/cohorts');
  revalidatePath('/instructor');
  revalidatePath(`/instructor/cohorts/${cohortId}`);
}
