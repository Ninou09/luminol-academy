import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Link from 'next/link';

import { EnquiryForm } from '../../components/enquiry-form';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSchools } from '../../lib/schools';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).contact;
  const route = localizePathname(locale, '/contact');

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/contact'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      url: route,
    },
    twitter: {
      card: 'summary',
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const publicCopy = getPublicCopy(locale);
  const copy = publicCopy.contact;
  const schools = getSchools(locale);
  const contactPaths = [
    {
      number: '01',
      school: schools.psychology,
      description: copy.pathDescriptions.psychology,
      tone: styles.psychology ?? '',
    },
    {
      number: '02',
      school: schools.languages,
      description: copy.pathDescriptions.languages,
      tone: styles.languages ?? '',
    },
    {
      number: '03',
      school: schools.training,
      description: copy.pathDescriptions.training,
      tone: styles.training ?? '',
    },
  ] as const;

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section
          className={styles.hero}
          aria-labelledby="contact-hero-title"
          data-contact-hero
        >
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 id="contact-hero-title">{copy.heroTitle}</h1>
          </div>
          <p className={styles.heroBody} data-reveal>
            {copy.heroBody}
          </p>
        </section>

        <section
          className={styles.section}
          aria-labelledby="contact-paths-title"
        >
          <div className={styles.pathsHeading} data-reveal>
            <p className={styles.eyebrow} id="contact-paths-title">
              {copy.exploreEyebrow}
            </p>
          </div>
          <div className={styles.pathGrid}>
            {contactPaths.map((path) => (
              <Link
                className={`${styles.pathCard} ${path.tone}`}
                href={localizeHref(locale, `/schools/${path.school.slug}`)}
                key={path.school.slug}
                data-contact-path={path.school.slug}
                data-reveal
              >
                <span>{path.number}</span>
                <h2>{path.school.name}</h2>
                <p>{path.description}</p>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>

        <section
          className={styles.enquirySection}
          aria-labelledby="contact-next-title"
        >
          <div className={styles.enquiryContext} data-reveal>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.nextEyebrow}
            </p>
            <h2 id="contact-next-title">{copy.nextTitle}</h2>
            <ol>
              {copy.steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className={styles.privacyNote}>{copy.privacyNote}</p>
          </div>
          <div className={styles.formSurface} data-contact-form data-reveal>
            <EnquiryForm locale={locale} copy={publicCopy.form} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
