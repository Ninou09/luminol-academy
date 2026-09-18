import { localizeHref, type Locale } from '@luminol/localization';

import { buildProgrammeContactHref } from './programme-contact';
import {
  isProgrammeWaitlist,
  localizeProgrammeDelivery,
  localizeProgrammeEnquiryAction,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from './programme-presentation';
import { getPublicCopy } from './public-localization';
import {
  buildSanityProgrammeImageUrl,
  type PublicCmsProgramme,
} from './sanity';

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
  const delivery = isWaitlist
    ? null
    : localizeProgrammeDelivery(locale, programme.delivery);
  // Suppress last-cohort logistics and imagery for waitlists. The Sanity read
  // boundary has already restricted image data to publication-approved assets.
  const asset =
    !isWaitlist && programme.image
      ? {
          src: buildSanityProgrammeImageUrl(programme.image),
          alt: programme.image.alt,
          source: 'sanity' as const,
        }
      : null;
  return {
    isWaitlist,
    asset,
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
