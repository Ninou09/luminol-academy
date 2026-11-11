'use server';

import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { grantStaffRole, revokeStaffRole } from '@luminol/database/staff-roles';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const staffRoleFormSchema = z.object({
  targetUserId: z.string().trim().min(1).max(128),
  roleKey: z.string().trim().min(1).max(64),
});

function parseStaffRoleForm(formData: FormData) {
  return staffRoleFormSchema.parse({
    targetUserId: formData.get('targetUserId'),
    roleKey: formData.get('roleKey'),
  });
}

export async function grantStaffRoleAction(formData: FormData) {
  const owner = await requirePermission('team:manage');
  const input = parseStaffRoleForm(formData);

  await grantStaffRole(db, { actorUserId: owner.id, ...input });

  revalidatePath('/team');
}

export async function revokeStaffRoleAction(formData: FormData) {
  const owner = await requirePermission('team:manage');
  const input = parseStaffRoleForm(formData);

  await revokeStaffRole(db, { actorUserId: owner.id, ...input });

  revalidatePath('/team');
}
