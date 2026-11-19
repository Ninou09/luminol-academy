import { localizeHref, type Locale } from '@luminol/localization';

import { buildProgrammeContactHref } from './programme-contact';
import { resolveProgrammeMedia } from './programme-media';
import {
  isProgrammeWaitlist,
  localizeProgrammeDelivery,
  localizeProgrammeEnquiryAction,
  localizeProgrammePublicCopy,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from './programme-presentation';
import { getPublicCopy } from './public-localization';
import type { PublicCmsProgramme } from './sanity';

export function selectSpotlightProgramme(
  programmes: readonly PublicCmsProgramme[] | null,
) {
  return (
    programmes?.find((entry) => entry.school === 'psychology') ??
    programmes?.[0] ??
    null
  );
}

export function getProgrammeSpotlightPresentation(
  locale: Locale,
  programme: PublicCmsProgramme,
) {
  const copy = getPublicCopy(locale).programmes;
  const isWaitlist = isProgrammeWaitlist(programme.slug.current);
  const publicCopy = localizeProgrammePublicCopy(locale, programme);
  const delivery = isWaitlist
    ? null
    : localizeProgrammeDelivery(locale, programme.delivery);
  const asset = resolveProgrammeMedia(programme, locale);
  return {
    isWaitlist,
    asset,
    ...publicCopy,
    status: isWaitlist
      ? localizeProgrammeWaitlistLabel(locale)
      : copy.published,
    details: isWaitlist
      ? []
      : [
          ...programme.languages.map(
            (language) => copy.languageNames[language],
          ),
          ...(delivery ? [delivery] : []),
        ],
    enquiryAction: isWaitlist
      ? localizeProgrammeWaitlistAction(locale)
      : localizeProgrammeEnquiryAction(locale),
    programmeHref: localizeHref(
      locale,
      `/programmes/${programme.slug.current}`,
    ),
    contactHref: buildProgrammeContactHref(locale, programme.slug.current),
  };
}
