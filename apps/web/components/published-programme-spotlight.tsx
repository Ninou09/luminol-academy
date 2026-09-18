import { localizeHref, type Locale } from '@luminol/localization';
import Link from 'next/link';

import styles from '../app/home.module.css';
import {
  isProgrammeWaitlist,
  localizeProgrammeViewAction,
  localizeProgrammeWaitlistLabel,
} from '../lib/programme-presentation';
import { getPublicCopy } from '../lib/public-localization';
import { getPublicProgrammes } from '../lib/sanity';

export async function PublishedProgrammeSpotlight({
  locale,
}: {
  locale: Locale;
}) {
  const programmes = await getPublicProgrammes();
  const programme =
    programmes?.find((entry) => entry.school === 'psychology') ??
    programmes?.[0];
  if (!programme) return null;

  const copy = getPublicCopy(locale).programmes;
  return (
    <section
      className={styles.programmeSpotlight}
      aria-labelledby="home-programme-title"
    >
      <div>
        <p className={styles.eyebrow}>
          {isProgrammeWaitlist(programme.slug.current)
            ? localizeProgrammeWaitlistLabel(locale)
            : copy.published}
        </p>
        <h2 id="home-programme-title" dir="auto">
          {programme.title}
        </h2>
        <p dir="auto">{programme.summary}</p>
      </div>
      <Link
        className={styles.textLink}
        href={localizeHref(locale, `/programmes/${programme.slug.current}`)}
      >
        {localizeProgrammeViewAction(locale)} <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
