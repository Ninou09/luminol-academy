import { localizeHref, type Locale } from '@luminol/localization';

export function buildProgrammeContactHref(
  locale: Locale,
  programmeSlug: string,
) {
  const contactHref = localizeHref(locale, '/contact');
  const params = new URLSearchParams({ programme: programmeSlug });

  return `${contactHref}?${params.toString()}`;
}
