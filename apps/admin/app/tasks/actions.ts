'use server';

import { db } from '@luminol/database';
import {
  createOperationsTask,
  transitionOperationsTask,
} from '@luminol/database/operations-tasks';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { safeOperationsReturnPath } from '../../lib/consultation-scope';
import { requireOperationsTaskActor } from '../../lib/operations-task-actor.server';
import { runOperationsMutation } from '../../lib/operations-feedback.server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function returnPath(formData: FormData) {
  return safeOperationsReturnPath(field(formData, 'returnTo'), '/tasks');
}

function revalidateTasks() {
  revalidatePath('/tasks');
  revalidatePath('/today');
}

export async function createOperationsTaskAction(formData: FormData) {
  const { actor } = await requireOperationsTaskActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await createOperationsTask(db, {
      actor,
      kind: z.enum(['TASK', 'APPROVAL']).parse(field(formData, 'kind')),
      title: z.string().parse(field(formData, 'title')),
      details: field(formData, 'details') ?? null,
      assigneeUserId: field(formData, 'assigneeUserId') || null,
      dueOn: field(formData, 'dueOn') || null,
      priority: field(formData, 'priority') ?? 'NORMAL',
    });
    revalidateTasks();
  });
}

export async function transitionOperationsTaskAction(formData: FormData) {
  const { actor } = await requireOperationsTaskActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await transitionOperationsTask(db, {
      actor,
      taskId: z
        .string()
        .trim()
        .min(1)
        .max(128)
        .parse(field(formData, 'taskId')),
      expectedRevision: z.coerce
        .number()
        .int()
        .positive()
        .parse(field(formData, 'revision')),
      toStatus: z.string().parse(field(formData, 'toStatus')),
      decisionNote: field(formData, 'decisionNote') ?? null,
    });
    revalidateTasks();
  });
}
