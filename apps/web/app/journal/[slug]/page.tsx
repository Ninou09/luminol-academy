import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  journalArticles,
  journalAuthor,
  journalCopy,
} from '../../../lib/journal';
import { getRequestLocale } from '../../../lib/request-locale';
import { serializeJsonLd } from '../../../lib/structured-data';
import styles from '../journal.module.css';

type Props = { params: Promise<{ slug: string }> };

function findArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const article = findArticle(slug);
  if (!article) return {};
  const path = `/journal/${article.slug}`;
  return {
    title: article.title[locale],
    description: article.summary[locale],
    alternates: {
      canonical: localizePathname(locale, path),
      languages: buildLanguageAlternates(path),
    },
    // Drafts stay out of search results until Luminol approves them.
    robots: article.draft ? { index: false, follow: true } : undefined,
    openGraph: {
      title: article.title[locale],
      description: article.summary[locale],
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: 'article',
      images: [article.cover],
    },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const article = findArticle(slug);
  if (!article) notFound();
  const copy = journalCopy[locale];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title[locale],
    description: article.summary[locale],
    datePublished: article.date,
    inLanguage: locale,
    image: article.articleImage.src,
    author: { '@type': 'Person', name: journalAuthor[locale].name },
    publisher: { '@type': 'Organization', name: 'Luminol Academy' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <article className={styles.article} aria-labelledby="article-title">
          <Link className={styles.back} href={localizeHref(locale, '/journal')}>
            <span aria-hidden="true">{locale === 'ar' ? '→' : '←'}</span>{' '}
            {copy.back}
          </Link>
          <p className={styles.meta}>
            {article.draft ? (
              <span className={styles.draft}>{copy.draft}</span>
            ) : null}
            <span>
              {journalAuthor[locale].label} {journalAuthor[locale].name}
            </span>
            <time dateTime={article.date}>{article.date}</time>
            <span>
              {article.minutes} {copy.minutes}
            </span>
          </p>
          <h1 id="article-title">{article.title[locale]}</h1>
          <p className={styles.lede}>{article.summary[locale]}</p>
          <figure className={styles.articleCover}>
            <Image
              src={article.articleImage.src}
              alt={article.articleImage.alt[locale]}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 60rem"
            />
          </figure>
          {article.sections.map((section) => (
            <section key={section.heading.en} className={styles.articleSection}>
              <h2>{section.heading[locale]}</h2>
              <p>{section.body[locale]}</p>
            </section>
          ))}
          <p className={styles.disclaimer}>{copy.disclaimer}</p>
          <aside className={styles.cta}>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaBody}</p>
            <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
              {copy.ctaButton} <span aria-hidden="true">→</span>
            </ButtonLink>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
