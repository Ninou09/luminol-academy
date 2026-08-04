import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@luminol/ui';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  buildSanityProgrammeImageUrl,
  getProgrammesForSchool,
} from '../../../lib/sanity';
import { isSchoolSlug, schools } from '../../../lib/schools';
import styles from './page.module.css';

type SchoolPageProps = {
  params: Promise<{ school: string }>;
};

export function generateStaticParams() {
  return Object.keys(schools).map((school) => ({ school }));
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) return {};

  const school = schools[slug];
  const route = `/schools/${school.slug}`;

  return {
    title: school.name,
    description: school.introduction,
    alternates: {
      canonical: route,
    },
    openGraph: {
      title: `Luminol ${school.name}`,
      description: school.introduction,
      type: 'website',
      url: route,
    },
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) notFound();

  const school = schools[slug];
  const cmsProgrammes = await getProgrammesForSchool(slug);
  const programmes: Array<{
    id: string;
    title: string;
    description: string;
    delivery?: string | null;
    image?: { url: string; alt: string } | null;
  }> = cmsProgrammes?.length
    ? cmsProgrammes.map((programme) => ({
        id: programme._id,
        title: programme.title,
        description: programme.summary,
        delivery: programme.delivery ?? null,
        image: programme.image
          ? {
              url: buildSanityProgrammeImageUrl(programme.image),
              alt: programme.image.alt,
            }
          : null,
      }))
    : school.programs.map((programme) => ({
        id: programme.title,
        title: programme.title,
        description: programme.description,
      }));
  const relatedSchools = Object.values(schools).filter(
    (item) => item.slug !== school.slug,
  );

  return (
    <main className={`school-page school-page-${school.slug}`}>
      <SiteHeader />

      <section className="school-detail-hero">
        <div className="school-detail-copy">
          <a className="breadcrumb" href="/#schools">
            Luminol schools <span aria-hidden="true">/</span> {school.name}
          </a>
          <p className="eyebrow">{school.eyebrow}</p>
          <h1>{school.headline}</h1>
          <p className="school-detail-lede">{school.introduction}</p>
          <div className="hero-actions">
            <ButtonLink href="#programs" size="lg">
              Explore programs <span aria-hidden="true">↘</span>
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Start your journey
            </ButtonLink>
          </div>
        </div>

        <div className="school-detail-visual" aria-hidden="true">
          <span className="detail-number">{school.number}</span>
          <div className="detail-orbit detail-orbit-outer" />
          <div className="detail-orbit detail-orbit-inner" />
          <div className="detail-core">{school.name.charAt(0)}</div>
          <div className="detail-words">
            {school.visualWords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="school-promise-band">
        <p>Our promise</p>
        <blockquote>{school.promise}</blockquote>
      </section>

      <section id="programs" className="programs section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Programs and support</p>
            <h2>Choose the pathway that fits your next step.</h2>
          </div>
          <p>
            Each program is shaped around a clear purpose, thoughtful
            progression and an experience that respects the person behind the
            goal.
          </p>
        </div>
        <div className="program-grid">
          {programmes.map((program, index) => (
            <article key={program.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {program.image ? (
                <img
                  className={styles.programImage}
                  src={program.image.url}
                  alt={program.image.alt}
                  width={1200}
                  height={675}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <h3
                className={
                  program.image ? styles.programTitleWithImage : undefined
                }
              >
                {program.title}
              </h3>
              {program.delivery ? (
                <small className="program-delivery">{program.delivery}</small>
              ) : null}
              <p>{program.description}</p>
              <a href="/contact">
                Ask about this program <b aria-hidden="true">→</b>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="school-method">
        <div className="method-heading">
          <p className="eyebrow eyebrow-light">How the journey works</p>
          <h2>A clear path from intention to meaningful progress.</h2>
        </div>
        <ol>
          {school.approach.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="audience section-shell">
        <div>
          <p className="eyebrow">Designed around people</p>
          <h2>Who this school supports</h2>
        </div>
        <ul>
          {school.audiences.map((audience) => (
            <li key={audience}>{audience}</li>
          ))}
        </ul>
      </section>

      <aside className="school-note section-shell" aria-label="Program note">
        <span>Important</span>
        <p>{school.note}</p>
      </aside>

      <section className="related-schools section-shell">
        <p className="eyebrow">Continue exploring Luminol</p>
        <div className="related-heading">
          <h2>Growth connects across every school.</h2>
          <p>
            Explore another dimension of your personal, linguistic or
            professional development.
          </p>
        </div>
        <div className="related-grid">
          {relatedSchools.map((related) => (
            <a href={`/schools/${related.slug}`} key={related.slug}>
              <span>{related.number}</span>
              <h3>{related.name}</h3>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">Your next step</p>
          <h2>Let&apos;s find the right path forward.</h2>
          <p>
            Begin with your goal. Luminol will help you identify the program
            and learning experience that fits.
          </p>
        </div>
        <ButtonLink href="/contact" size="lg">
          Start your journey <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
