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
    },
    {
      number: '02',
      school: schools.languages,
      description: copy.pathDescriptions.languages,
    },
    {
      number: '03',
      school: schools.training,
      description: copy.pathDescriptions.training,
    },
  ] as const;

  return (
    <main>
      <SiteHeader />

      <section className="contact-hero">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heroTitle}</h1>
        </div>
        <p>{copy.heroBody}</p>
      </section>

      <section className="contact-paths section-shell">
        <p className="eyebrow">{copy.exploreEyebrow}</p>
        <div className="contact-path-grid">
          {contactPaths.map((path) => (
            <Link
              href={localizeHref(locale, `/schools/${path.school.slug}`)}
              key={path.school.slug}
            >
              <span>{path.number}</span>
              <h2>{path.school.name}</h2>
              <p>{path.description}</p>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="enquiry-section section-shell">
        <div className="enquiry-context">
          <p className="eyebrow eyebrow-light">{copy.nextEyebrow}</p>
          <h2>{copy.nextTitle}</h2>
          <ol>
            {copy.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="privacy-note">{copy.privacyNote}</p>
        </div>
        <EnquiryForm locale={locale} copy={publicCopy.form} />
      </section>

      <SiteFooter />
    </main>
  );
}
