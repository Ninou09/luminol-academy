import {
  LOCALE_REQUEST_HEADER,
  parseLocale,
  type Locale,
} from '@luminol/localization';
import { headers } from 'next/headers';

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  return parseLocale(requestHeaders.get(LOCALE_REQUEST_HEADER));
}
