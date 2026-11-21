import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  LEGAL_DOCUMENTS,
  getLegalDocument,
  isLegalDocumentSlug,
} from '../../../lib/legal-content';
import { getRequestLocale } from '../../../lib/request-locale';
import styles from './page.module.css';

type LegalPageProps = { params: Promise<{ document: string }> };

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const [{ document }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  if (!isLegalDocumentSlug(document)) return { robots: { index: false } };

  const content = getLegalDocument(locale, document);
  const pathname = `/legal/${document}`;
  const route = localizePathname(locale, pathname);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(pathname),
    },
    openGraph: {
      title: content.title,
      description: content.description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'website',
      url: route,
    },
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const [{ document }, locale] = await Promise.all([
    params,
    getRequestLocale(),
  ]);
  if (!isLegalDocumentSlug(document)) notFound();
  const content = getLegalDocument(locale, document);

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <header className={styles.hero}>
          <p className="eyebrow">Luminol Academy</p>
          <h1>{content.title}</h1>
          <p className={styles.intro}>{content.intro}</p>
          <p className={styles.updated}>{content.updated}</p>
        </header>
        <div className={styles.sections}>
          {content.sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
