import type { Locale } from '@luminol/localization';
import Link from 'next/link';

import { getProgrammeEnquiryCard } from '../lib/programme-enquiry-card';
import styles from './programme-enquiry-card.module.css';

export function ProgrammeEnquiryCard({
  locale,
  programmeSlug,
}: {
  locale: Locale;
  programmeSlug: string;
}) {
  const card = getProgrammeEnquiryCard(locale, programmeSlug);

  return (
    <section
      className={styles.card}
      aria-labelledby="programme-enquiry-title"
      data-programme-detail-region="enquiry"
      data-programme-enquiry-card
    >
      {card.status ? <p className={styles.status}>{card.status}</p> : null}
      <h2 id="programme-enquiry-title" className={styles.title}>
        {card.title}
      </h2>
      <p id="programme-enquiry-guidance" className={styles.guidance}>
        {card.guidance}
      </p>
      <div className={styles.certificate} data-programme-certificate>
        <h3 className={styles.certificateTitle}>{card.certificate.title}</h3>
        <p>{card.certificate.scope}</p>
      </div>
      <Link
        className={styles.action}
        href={card.href}
        aria-describedby="programme-enquiry-guidance"
        data-programme-panel-action
      >
        {card.action}
        <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
      </Link>
      <p className={styles.context}>{card.context}</p>
    </section>
  );
}
