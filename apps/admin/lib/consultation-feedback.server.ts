import 'server-only';

import { ConsultationError } from '@luminol/database/consultations';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

import type { ConsultationFeedbackCode } from './consultation-scope';

function withParams(path: string, params: Record<string, string>) {
  const [base, query = ''] = path.split('?') as [string, string?];
  const search = new URLSearchParams(query);
  search.delete('saved');
  search.delete('error');
  for (const [key, value] of Object.entries(params)) search.set(key, value);
  return `${base}?${search.toString()}`;
}

/**
 * Runs a consultation mutation and returns the user to `returnTo` with a
 * bounded feedback code instead of an unhandled error page. Unexpected
 * failures still throw.
 */
export async function runConsultationMutation(
  returnTo: string,
  mutation: () => Promise<unknown>,
): Promise<never> {
  let code: ConsultationFeedbackCode | 'saved';
  try {
    await mutation();
    code = 'saved';
  } catch (error) {
    if (error instanceof ConsultationError) code = error.code;
    else if (error instanceof ZodError) code = 'invalid';
    else throw error;
  }
  redirect(
    withParams(returnTo, code === 'saved' ? { saved: '1' } : { error: code }),
  );
}
