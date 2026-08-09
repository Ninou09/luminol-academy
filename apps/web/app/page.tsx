import {
  buildLanguageAlternates,
  localizeHref,
  localizePathname,
} from '@luminol/localization';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';

import { SiteFooter, SiteHeader } from '../components/site-shell';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { getSchools } from '../lib/schools';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const route = localizePathname(locale, '/');

  return {
    title: 'Luminol Academy',
    description: copy.site.description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates('/'),
    },
    openGraph: {
      title: 'Luminol Academy',
      description: copy.site.description,
      type: 'website',
      url: route,
    },
    twitter: {
      card: 'summary',
      title: 'Luminol Academy',
      description: copy.site.description,
    },
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).home;
  const schoolList = Object.values(getSchools(locale));

  return (
    <main>
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1 id="hero-title">
            {copy.heroTitle}
            <span>{copy.heroAccent}</span>
          </h1>
          <p className="hero-lede">{copy.heroLede}</p>
          <div className="hero-actions">
            <ButtonLink href="#schools" size="lg">
              {copy.exploreSchools} <span aria-hidden="true">↘</span>
            </ButtonLink>
            <ButtonLink
              href={localizeHref(locale, '/about')}
              size="lg"
              variant="secondary"
            >
              {copy.discoverLuminol}
            </ButtonLink>
          </div>
          <dl className="hero-proof" aria-label={copy.strengthsAria}>
            <div>
              <dt>3</dt>
              <dd>{copy.connectedSchools}</dd>
            </div>
            <div>
              <dt>1</dt>
              <dd>{copy.humanJourney}</dd>
            </div>
            <div>
              <dt>AR · FR · EN</dt>
              <dd>{copy.multilingualFoundation}</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-grid" />
          <div className="luminous-orbit orbit-outer" />
          <div className="luminous-orbit orbit-inner" />
          <div className="luminous-core">
            <span>Lu</span>
            <small>Luminol Academy</small>
          </div>
          <div className="signal-card signal-psychology">
            <span>{copy.mind}</span>
            <strong>{copy.understand}</strong>
          </div>
          <div className="signal-card signal-languages">
            <span>{copy.voice}</span>
            <strong>{copy.connect}</strong>
          </div>
          <div className="signal-card signal-training">
            <span>{copy.work}</span>
            <strong>{copy.advance}</strong>
          </div>
        </div>
      </section>

      <section id="schools" className="schools section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.schoolsEyebrow}</p>
            <h2>{copy.schoolsTitle}</h2>
          </div>
          <p>{copy.schoolsIntro}</p>
        </div>

        <div className="school-grid">
          {schoolList.map((school) => (
            <article
              className={`school-card school-${school.slug}`}
              id={school.slug}
              key={school.slug}
            >
              <div className="school-topline">
                <span>{school.number}</span>
                <span className="school-mark" aria-hidden="true" />
              </div>
              <h3>{school.name}</h3>
              <p className="school-promise">{school.promise}</p>
              <p className="school-description">{school.introduction}</p>
              <ul aria-label={`${school.name} — ${copy.focusAreas}`}>
                {school.programs.slice(0, 3).map((program) => (
                  <li key={program.title}>{program.title}</li>
                ))}
              </ul>
              <Link
                className="text-link"
                href={localizeHref(locale, `/schools/${school.slug}`)}
              >
                {copy.discoverSchool} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="approach" className="approach">
        <div className="approach-intro">
          <p className="eyebrow eyebrow-light">{copy.approachEyebrow}</p>
          <h2>{copy.approachTitle}</h2>
          <p>{copy.approachIntro}</p>
        </div>
        <ol className="principle-list">
          {copy.principles.map((principle) => (
            <li key={principle.number}>
              <span>{principle.number}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="about" className="about section-shell">
        <div className="about-visual" aria-hidden="true">
          <div className="about-monogram">L</div>
          <p>{copy.aboutVisual}</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow">{copy.aboutEyebrow}</p>
          <h2>{copy.aboutTitle}</h2>
          <p className="about-lede">{copy.aboutLede}</p>
          <p>{copy.aboutBody}</p>
          <div className="value-row">
            {copy.values.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      </section>

      <section
        className="pathway section-shell"
        aria-labelledby="pathway-title"
      >
        <div>
          <p className="eyebrow">{copy.pathwayEyebrow}</p>
          <h2 id="pathway-title">{copy.pathwayTitle}</h2>
        </div>
        <div className="pathway-links">
          <Link href={localizeHref(locale, '/schools/psychology')}>
            <span>01</span>
            {copy.pathwayPsychology}
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href={localizeHref(locale, '/schools/languages')}>
            <span>02</span>
            {copy.pathwayLanguages}
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href={localizeHref(locale, '/schools/training')}>
            <span>03</span>
            {copy.pathwayTraining}
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </section>

      <section id="contact" className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">{copy.ctaEyebrow}</p>
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaBody}</p>
        </div>
        <ButtonLink href={localizeHref(locale, '/contact')} size="lg">
          {copy.startConversation} <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
