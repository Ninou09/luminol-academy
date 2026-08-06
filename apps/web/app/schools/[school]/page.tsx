import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@luminol/ui';
import { EditorialImage } from '../../../components/editorial-image';
import { HomeMotion } from '../../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { branchExperience } from '../../../lib/flagship';
import {
  buildSanityProgrammeImageUrl,
  getProgrammesForSchool,
} from '../../../lib/sanity';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../../../lib/sanity-public';
import { isSchoolSlug, schools } from '../../../lib/schools';
import styles from '../../flagship.module.css';

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
    twitter: {
      card: 'summary',
      title: `Luminol ${school.name}`,
      description: school.introduction,
    },
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) notFound();

  const school = schools[slug];
  const experience = branchExperience[slug];
  const [cmsProgrammes, teamMembers, testimonials] = await Promise.all([
    getProgrammesForSchool(slug),
    getPublicTeamMembers(slug),
    getPublicTestimonials(slug),
  ]);
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
    <main
      className={`${styles.page} ${styles.branchPage} ${styles[school.slug]}`}
    >
      <HomeMotion />
      <SiteHeader />

      <section className={styles.branchHero}>
        <div className={styles.branchHeroCopy} data-reveal="left">
          <Link className={styles.breadcrumb} href="/#schools">
            Luminol schools <span aria-hidden="true">/</span> {school.name}
          </Link>
          <p className={styles.kicker}>{experience.themeLabel}</p>
          <h1>{school.headline}</h1>
          <p>{experience.positioning}</p>
          <div className={styles.branchHeroActions}>
            <ButtonLink href="#programmes" size="lg">
              Explore {school.name.toLowerCase()} programmes
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Register your interest
            </ButtonLink>
          </div>
        </div>
        <div className={styles.branchHeroMedia} data-reveal="scale">
          <EditorialImage
            className={styles.branchHeroFigure}
            image={experience.image}
            priority
            sizes="(max-width: 72rem) 100vw, 52vw"
            caption={`${school.name} imagery selected for the purpose and mood of this school.`}
          />
          <div className={styles.branchHeroNote}>
            <small>
              {school.number} · {school.name}
            </small>
            <p>{school.promise}</p>
          </div>
        </div>
      </section>

      <section className={styles.branchPromise}>
        <span>What this school is designed to do</span>
        <blockquote>{school.promise}</blockquote>
      </section>

      <section id="programmes" className={styles.branchProgrammeSection}>
        <div className={styles.branchSectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Programmes and support</p>
            <h2>Choose a pathway with a clear purpose.</h2>
          </div>
          <p>
            Published CMS programmes take priority. The reviewed Luminol
            pathways remain available when no approved CMS content is active.
          </p>
        </div>
        <div className={styles.programGrid}>
          {programmes.map((programme, index) => (
            <article
              className={styles.programCard}
              data-reveal
              key={programme.id}
              style={
                {
                  '--reveal-delay': `${(index % 2) * 65}ms`,
                } as CSSProperties
              }
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {programme.image ? (
                <div className={styles.programCardImage}>
                  <Image
                    src={programme.image.url}
                    alt={programme.image.alt}
                    fill
                    sizes="(max-width: 44rem) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <h3>{programme.title}</h3>
              {programme.delivery ? <small>{programme.delivery}</small> : null}
              <p>{programme.description}</p>
              <Link href="/contact">
                Ask about this programme <b aria-hidden="true">→</b>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.branchSplit}>
        <div className={styles.branchSplitCopy} data-reveal="left">
          <p className={styles.kicker}>Benefits and outcomes</p>
          <h2>Progress should be understandable and usable.</h2>
          <p className={styles.storyLead}>
            The experience is designed around the learner’s context—not a
            one-size-fits-all promise.
          </p>
          <p>
            Outcomes vary by programme, level and participation. These
            principles describe what the school is designed to support without
            making exaggerated guarantees.
          </p>
        </div>
        <ol className={styles.outcomeList}>
          {experience.outcomes.map((outcome, index) => (
            <li
              data-reveal="right"
              key={outcome}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {outcome}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.branchMethod}>
        <div data-reveal="left">
          <p className={styles.kicker}>How the journey works</p>
          <h2>A clear method, adapted to the person and goal.</h2>
        </div>
        <ol className={styles.methodList}>
          {school.approach.map((step, index) => (
            <li
              data-reveal="right"
              key={step.title}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.branchAudience}>
        <div className={styles.branchSectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Designed around people</p>
            <h2>Who this school supports.</h2>
          </div>
          <p>
            The enquiry conversation helps confirm whether the current
            programme, group and format are appropriate.
          </p>
        </div>
        <div className={styles.audienceGrid}>
          {school.audiences.map((audience, index) => (
            <article
              data-reveal
              key={audience}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{audience}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.branchSplit}>
        <div className={styles.branchSplitCopy} data-reveal="left">
          <p className={styles.kicker}>Instructor credibility</p>
          <h2>Expertise that fits the discipline.</h2>
          <p>
            Luminol’s content system publishes individual profiles only after
            their role, biography and portrait have been approved.
          </p>
        </div>
        {teamMembers?.length ? (
          <div className={styles.peopleGrid}>
            {teamMembers.map((member) => (
              <article data-reveal key={member._id}>
                {member.portrait ? (
                  <div className={styles.personPortrait}>
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 44rem) 100vw, 25vw"
                    />
                  </div>
                ) : null}
                <small>{member.role}</small>
                <h3>{member.name}</h3>
                {member.bio ? <p>{member.bio}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <ol className={styles.expertiseList}>
            {experience.expertise.map((item, index) => (
              <li data-reveal="right" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        )}
      </section>

      {testimonials?.length ? (
        <section className={styles.branchEvidence}>
          <div className={styles.branchEvidenceInner}>
            <div data-reveal="left">
              <p className={styles.kicker}>Approved voices</p>
              <h2>Evidence published with consent.</h2>
              <p>
                Only testimonials marked active with confirmed publication
                consent are displayed.
              </p>
            </div>
            <div className={styles.branchEvidenceQuotes}>
              {testimonials.map((testimonial) => (
                <figure data-reveal="right" key={testimonial._id}>
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <figcaption>
                    <strong>{testimonial.personName}</strong>
                    <span>{testimonial.context ?? school.name}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.branchFaq}>
        <div data-reveal="left">
          <p className={styles.kicker}>Frequently asked questions</p>
          <h2>Useful answers before you enquire.</h2>
        </div>
        <div className={styles.faqList}>
          {experience.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <aside
        className={styles.safetyNote}
        aria-label="Important programme note"
      >
        <span>Important</span>
        <p>{school.note}</p>
      </aside>

      <section className={styles.relatedSection}>
        <div className={styles.branchSectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Continue exploring</p>
            <h2>Growth connects across every Luminol school.</h2>
          </div>
          <p>
            Explore another dimension of personal, linguistic or professional
            development.
          </p>
        </div>
        <div className={styles.relatedGrid}>
          {relatedSchools.map((related) => (
            <Link href={`/schools/${related.slug}`} key={related.slug}>
              <span>{related.number}</span>
              <h3>{related.name}</h3>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div data-reveal="left">
          <p className={styles.kicker}>Your next step</p>
          <h2>Find the {school.name.toLowerCase()} pathway that fits.</h2>
          <p>
            Begin with your goal. The Luminol team will help confirm the
            programme, level and format that are currently appropriate.
          </p>
        </div>
        <ButtonLink data-reveal="right" href="/contact" size="lg">
          Register your interest <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
