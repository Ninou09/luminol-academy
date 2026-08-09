import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import { ButtonLink } from '@luminol/ui';

import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { getPublicCopy } from '../../lib/public-localization';
import { getRequestLocale } from '../../lib/request-locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;
  const route = localizePathname(locale, '/about');

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/about'),
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

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).about;

  return (
    <main>
      <SiteHeader />

      <section className="about-page-hero">
        <div className="about-page-copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
        </div>
        <div className="about-page-visual" aria-hidden="true">
          <div className="about-rays" />
          <span>L</span>
          <p>{copy.visualCaption}</p>
        </div>
      </section>

      <section className="origin section-shell">
        <div>
          <p className="eyebrow">{copy.originEyebrow}</p>
          <h2>{copy.originTitle}</h2>
        </div>
        <div className="origin-copy">
          <p className="origin-lede">{copy.originLede}</p>
          <p>{copy.originBodyOne}</p>
          <p>{copy.originBodyTwo}</p>
        </div>
      </section>

      <section className="mission-vision">
        <article>
          <span>{copy.missionLabel}</span>
          <h2>{copy.missionTitle}</h2>
          <p>{copy.missionBody}</p>
        </article>
        <article>
          <span>{copy.visionLabel}</span>
          <h2>{copy.visionTitle}</h2>
          <p>{copy.visionBody}</p>
        </article>
      </section>

      <section className="values section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.valuesEyebrow}</p>
            <h2>{copy.valuesTitle}</h2>
          </div>
          <p>{copy.valuesBody}</p>
        </div>
        <div className="value-grid">
          {copy.values.map((value) => (
            <article key={value.number}>
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ecosystem section-shell">
        <div className="ecosystem-core">
          <span>Luminol</span>
          <small>{copy.oneJourney}</small>
        </div>
        <div className="ecosystem-school ecosystem-psychology">
          <span>01</span>
          <h3>{copy.psychologyName}</h3>
          <p>{copy.psychologyTagline}</p>
        </div>
        <div className="ecosystem-school ecosystem-languages">
          <span>02</span>
          <h3>{copy.languagesName}</h3>
          <p>{copy.languagesTagline}</p>
        </div>
        <div className="ecosystem-school ecosystem-training">
          <span>03</span>
          <h3>{copy.trainingName}</h3>
          <p>{copy.trainingTagline}</p>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">{copy.ctaEyebrow}</p>
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaBody}</p>
        </div>
        <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
          {copy.ctaAction} <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
