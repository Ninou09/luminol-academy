import {
  getAttendanceCertificateCopy,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { localizeProgrammeViewAction } from '../lib/programme-presentation';
import {
  getProgrammeSpotlightPresentation,
  selectSpotlightProgramme,
} from '../lib/programme-spotlight';
import { getPublicCopy } from '../lib/public-localization';
import { getPublicProgrammes, type PublicCmsProgramme } from '../lib/sanity';
import { getSchools } from '../lib/schools';
import { EditorialMedia } from './editorial-media';
import styles from './published-programme-spotlight.module.css';

export function ProgrammeSpotlight({
  locale,
  programme,
}: {
  locale: Locale;
  programme: PublicCmsProgramme;
}) {
  const copy = getPublicCopy(locale).programmes;
  const certificate = getAttendanceCertificateCopy(locale);
  const presentation = getProgrammeSpotlightPresentation(locale, programme);
  const { isWaitlist, asset, enquiryAction } = presentation;

  return (
    <section
      className={styles.feature}
      aria-labelledby="home-programme-title"
      data-programme-spotlight
      data-programme-state={isWaitlist ? 'waitlist' : 'published'}
    >
      <div className={styles.content}>
        <div className={styles.meta}>
          <p className={styles.status}>{presentation.status}</p>
          <span>{getSchools(locale)[programme.school].name}</span>
        </div>
        <h2 id="home-programme-title" className={styles.title} dir="auto">
          {programme.title}
        </h2>
        <p className={styles.summary} dir="auto">
          {programme.summary}
        </p>
        {presentation.details.length > 0 ? (
          <ul className={styles.details} aria-label={copy.detailsAria}>
            {presentation.details.map((detail, index) => (
              <li key={`${index}-${detail}`} dir="auto">
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.actions}>
          <Link
            className={styles.primaryAction}
            href={presentation.programmeHref}
            aria-label={`${localizeProgrammeViewAction(locale)}: ${programme.title}`}
            data-spotlight-view-action
          >
            {localizeProgrammeViewAction(locale)}
            <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
          </Link>
          <Link
            className={styles.secondaryAction}
            href={presentation.contactHref}
            aria-label={`${enquiryAction}: ${programme.title}`}
            data-spotlight-enquiry-action
          >
            {enquiryAction}
          </Link>
        </div>
        <p className={styles.certificate}>
          <strong>{certificate.title}</strong>
          <span>{certificate.scope}</span>
        </p>
      </div>
      <div className={styles.visual} data-spotlight-visual>
        <EditorialMedia
          school={programme.school}
          asset={asset}
          className={styles.media}
          sizes="(max-width: 680px) calc(100vw - 2.5rem), 30vw"
        />
      </div>
    </section>
  );
}

export async function PublishedProgrammeSpotlight({
  locale,
}: {
  locale: Locale;
}) {
  const programmes = await getPublicProgrammes();
  const programme = selectSpotlightProgramme(programmes);
  if (!programme) return null;

  return <ProgrammeSpotlight locale={locale} programme={programme} />;
}
