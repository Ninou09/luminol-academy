import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Image from 'next/image';

import { GlassIcon } from '../../components/glass-icon';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { momentPhotos } from '../../lib/people-photos';
import { privacyPolicy } from '../../lib/privacy-policy';
import { getRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = privacyPolicy[locale];
  const route = localizePathname(locale, '/privacy');
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/privacy'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
    },
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const copy = privacyPolicy[locale];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="privacy-title">
          <Image
            className={styles.heroPhoto}
            src={momentPhotos.psychologyBooksMacro.src}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
          />
          <GlassIcon name="step-recorded" size="lg" className={styles.icon} />
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="privacy-title">{copy.heroTitle}</h1>
          <p className={styles.lede}>{copy.heroBody}</p>
          <p className={styles.updated}>
            {copy.updatedLabel}: <time dateTime="2026-11-13">{copy.updated}</time>
          </p>
        </section>

        <div className={styles.layout}>
          <nav className={styles.contents} aria-label={copy.contentsLabel}>
            <p>{copy.contentsLabel}</p>
            <ol>
              {copy.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.sections}>
            {copy.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className={styles.section}
                aria-labelledby={`${section.id}-title`}
                data-reveal
              >
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </section>
            ))}
            <ButtonLink
              href={localizeHref(locale, '/contact')}
              size="lg"
              data-magnetic
            >
              {copy.contactCta} <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
