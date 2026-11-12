import 'server-only';

import { ConsultationError } from '@luminol/database/consultations';
import { OfficePaymentError } from '@luminol/database/office-payments';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

function withParams(path: string, params: Record<string, string>) {
  const [base, query = ''] = path.split('?') as [string, string?];
  const search = new URLSearchParams(query);
  search.delete('saved');
  search.delete('error');
  for (const [key, value] of Object.entries(params)) search.set(key, value);
  return `${base}?${search.toString()}`;
}

/**
 * Runs an operations mutation and returns the user to `returnTo` with a
 * bounded feedback code instead of an unhandled error page. Unexpected
 * failures still throw.
 */
export async function runOperationsMutation(
  returnTo: string,
  mutation: () => Promise<unknown>,
): Promise<never> {
  let code: string;
  try {
    await mutation();
    code = 'saved';
  } catch (error) {
    if (
      error instanceof ConsultationError ||
      error instanceof OfficePaymentError
    ) {
      code = error.code;
    } else if (error instanceof ZodError) {
      code = 'invalid';
    } else {
      throw error;
    }
  }
  redirect(
    withParams(returnTo, code === 'saved' ? { saved: '1' } : { error: code }),
  );
}
