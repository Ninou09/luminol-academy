'use server';

import { requireUser } from '@luminol/auth';
import {
  StartPlacementSchema,
  SubmitPlacementSchema,
  getActivePlacementAttempt,
  getPlacementResult,
  startPlacementAttempt,
  submitPlacementAttempt,
} from '@luminol/language';
import { localizeHref } from '@luminol/localization';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getPortalRequestLocale } from '../../lib/request-locale';

export async function startPlacement(input: unknown) {
  const user = await requireUser();
  const parsed = StartPlacementSchema.parse(input);
  const attempt = await startPlacementAttempt({
    assessmentId: parsed.assessmentId,
    userId: user.id,
  });

  revalidatePath('/languages');
  return attempt;
}

export async function startPlacementFromForm(formData: FormData) {
  const attempt = await startPlacement({
    assessmentId: formData.get('assessmentId'),
  });
  const locale = await getPortalRequestLocale();

  redirect(localizeHref(locale, `/languages/placement/${attempt.id}`));
}

export async function getActivePlacement(input: unknown) {
  const user = await requireUser();
  const parsed = StartPlacementSchema.parse(input);

  return getActivePlacementAttempt({
    assessmentId: parsed.assessmentId,
    userId: user.id,
  });
}

export async function submitPlacement(input: unknown) {
  const user = await requireUser();
  const parsed = SubmitPlacementSchema.parse(input);
  const submission = await submitPlacementAttempt({
    attemptId: parsed.attemptId,
    userId: user.id,
    scores: parsed.scores,
    ...(parsed.requiresManualReview === undefined
      ? {}
      : { requiresManualReview: parsed.requiresManualReview }),
  });

  revalidatePath('/languages');
  revalidatePath(`/languages/results/${parsed.attemptId}`);
  return submission;
}

export async function readPlacementResult(attemptId: string) {
  const user = await requireUser();

  return getPlacementResult({
    attemptId,
    userId: user.id,
  });
}
