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
import { getPsychologyContactPathDescription } from '../../lib/contact-paths';
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
import { GlassIcon, type GlassIconName } from '../../components/glass-icon';
import { FaqSection } from '../../components/faq-section';
import { PhotoStack } from '../../components/photo-stack';
import { AddressCard } from '../../components/address-card';
import { ContactCards } from '../../components/contact-cards';
import { SocialIcons } from '../../components/social-icons';
import {
  channelCopy,
  contactLabels,
  followCopy,
  getBookingHref,
  openingHours,
  getWhatsAppHref,
} from '../../lib/contact-channels';
import { contactFaq } from '../../lib/faq';
import { pathPhotos, peoplePhotos } from '../../lib/people-photos';
import { privacyPolicy } from '../../lib/privacy-policy';
import Image from 'next/image';

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

const stepIcons: GlassIconName[] = [
  'step-recorded',
  'step-review',
  'step-reply',
];

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [locale, params] = await Promise.all([
    getRequestLocale(),
    searchParams,
  ]);
  const publicCopy = getPublicCopy(locale);
  const copy = publicCopy.contact;
  const schools = getSchools(locale);
  const psychologyPathDescription = getPsychologyContactPathDescription(locale);
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
      description: psychologyPathDescription,
      href: localizeHref(locale, '/consultations'),
      tone: styles.psychology ?? '',
    },
    {
      number: '02',
      school: schools.languages,
      description: copy.pathDescriptions.languages,
      href: localizeHref(locale, `/schools/${schools.languages.slug}`),
      tone: styles.languages ?? '',
    },
    {
      number: '03',
      school: schools.training,
      description: copy.pathDescriptions.training,
      href: localizeHref(locale, `/schools/${schools.training.slug}`),
      tone: styles.training ?? '',
    },
  ] as const;

  const channels = channelCopy[locale];
  const whatsappHref = getWhatsAppHref(channels.whatsappMessage);
  const bookingHref = getBookingHref();

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
            <p className={styles.eyebrow}>
              <span className={styles.pulse} aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h1 id="contact-hero-title">{copy.heroTitle}</h1>
            <p className={styles.heroBody}>{copy.heroBody}</p>
            <div className={styles.heroActions}>
              <a
                className={styles.primaryChip}
                href="#contact-form"
                data-magnetic
              >
                {channels.write} <span aria-hidden="true">↓</span>
              </a>
              {bookingHref ? (
                <a
                  className={styles.chip}
                  href={bookingHref}
                  target="_blank"
                  rel="noopener"
                  data-magnetic
                >
                  {channels.book} <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              {whatsappHref ? (
                <a
                  className={styles.chip}
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener"
                  aria-label={channels.whatsappAria}
                  data-magnetic
                >
                  {channels.whatsapp} <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
          <PhotoStack
            className={styles.heroStack}
            locale={locale}
            priority
            photos={[
              peoplePhotos.contactsNextStep,
              peoplePhotos.designTherapyRoom,
            ]}
          />
        </section>

        <section
          id="contact-form"
          className={styles.enquirySection}
          aria-labelledby="contact-next-title"
        >
          <div className={styles.enquiryContext} data-reveal>
            <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              {copy.nextEyebrow}
            </p>
            <h2 id="contact-next-title">{copy.nextTitle}</h2>
            <ol className={styles.timeline}>
              {copy.steps.map((step, index) => (
                <li key={step}>
                  <GlassIcon
                    name={stepIcons[index % stepIcons.length]!}
                    size="sm"
                    delay={index}
                  />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className={styles.privacyNote}>
              {copy.privacyNote}{' '}
              <Link href={localizeHref(locale, '/privacy')}>
                {privacyPolicy[locale].linkLabel}
              </Link>
            </p>
          </div>
          <div className={styles.formSurface} data-contact-form data-reveal>
            <EnquiryForm
              locale={locale}
              copy={publicCopy.form}
              initialSchool={enquiryDefaults?.school}
              initialMessage={enquiryDefaults?.message}
              initialProgrammeSlug={programme?.slug.current}
            />
          </div>
        </section>

        <section className={styles.explore} aria-labelledby="contact-paths-title">
          <div className={styles.exploreInner}>
            <div className={styles.pathsHeading} data-reveal>
              <h2 className={styles.eyebrow} id="contact-paths-title">
                {copy.exploreEyebrow}
              </h2>
            </div>
            <div className={styles.pathGrid} data-stagger>
              {contactPaths.map((path) => (
                <Link
                  className={`${styles.pathCard} ${path.tone}`}
                  href={path.href}
                  key={path.school.slug}
                  aria-labelledby={`contact-path-${path.school.slug}-title`}
                  data-contact-path={path.school.slug}
                >
                  <span className={styles.pathPhoto}>
                    <Image
                      src={pathPhotos[path.school.slug].src}
                      alt={pathPhotos[path.school.slug].alt[locale]}
                      fill
                      sizes="(max-width: 900px) 100vw, 30vw"
                    />
                  </span>
                  <span className={styles.pathBody}>
                    <span className={styles.pathNumber}>{path.number}</span>
                    <h3 id={`contact-path-${path.school.slug}-title`}>
                      {path.school.name}
                    </h3>
                    <p>{path.description}</p>
                    <b aria-hidden="true">→</b>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.direct} aria-labelledby="contact-direct-title">
          <div className={styles.directHeading} data-reveal>
            <h2 id="contact-direct-title">{contactLabels[locale].title}</h2>
          </div>
          <ContactCards locale={locale} />
          <AddressCard locale={locale} />
          <div className={styles.hoursBand}>
            <div>
              <p className={styles.eyebrow}>{openingHours.title[locale]}</p>
              <p className={styles.hoursValue}>
                <time>{openingHours.label[locale]}</time>
              </p>
              <p className={styles.hoursNote}>{openingHours.note[locale]}</p>
            </div>
            <div className={styles.hoursSocial}>
              <p>{followCopy[locale]}</p>
              <SocialIcons
                className={styles.socials}
                label={followCopy[locale]}
              />
            </div>
          </div>
        </section>

        <FaqSection copy={contactFaq[locale]} id="contact-faq" />
      </main>
      <SiteFooter />
    </>
  );
}
