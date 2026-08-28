import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Link from 'next/link';

import { EnquiryForm } from '../../components/enquiry-form';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getProgrammeEnquiryDefaults } from '../../lib/programme-enquiry';
import {
  getPublicProgrammeBySlug,
  isPublicProgrammeSlug,
} from '../../lib/programme-detail';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';
import { getSocialPreviewImage } from '../../lib/social-preview-metadata';
import { getSchools } from '../../lib/schools';
import styles from './page.module.css';

type ContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).contact;
  const route = localizePathname(locale, '/contact');
  const socialPreview = getSocialPreviewImage(locale);

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
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
      images: [socialPreview],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [socialPreview],
    },
  };
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [locale, params] = await Promise.all([
    getRequestLocale(),
    searchParams,
  ]);
  const publicCopy = getPublicCopy(locale);
  const copy = publicCopy.contact;
  const schools = getSchools(locale);
  const rawProgramme = params.programme;
  const programmeSlug =
    typeof rawProgramme === 'string' && isPublicProgrammeSlug(rawProgramme)
      ? rawProgramme
      : null;
  const programme = programmeSlug
    ? await getPublicProgrammeBySlug(programmeSlug)
    : null;
  const enquiryDefaults = programme
    ? getProgrammeEnquiryDefaults(locale, programme)
    : null;
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
      <main id="main-content" tabIndex={-1} className={styles.page}>
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
            <h2 className={styles.eyebrow} id="contact-paths-title">
              {copy.exploreEyebrow}
            </h2>
          </div>
          <div className={styles.pathGrid}>
            {contactPaths.map((path) => (
              <Link
                className={`${styles.pathCard} ${path.tone}`}
                href={localizeHref(locale, `/schools/${path.school.slug}`)}
                key={path.school.slug}
                aria-labelledby={`contact-path-${path.school.slug}-title`}
                data-contact-path={path.school.slug}
                data-reveal
              >
                <span>{path.number}</span>
                <h3 id={`contact-path-${path.school.slug}-title`}>
                  {path.school.name}
                </h3>
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
            <EnquiryForm
              locale={locale}
              copy={publicCopy.form}
              initialSchool={enquiryDefaults?.school}
              initialMessage={enquiryDefaults?.message}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
