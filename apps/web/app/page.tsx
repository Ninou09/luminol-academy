import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { EditorialImage } from '../components/editorial-image';
import { HomeMotion } from '../components/home-motion';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import {
  credibilityPrinciples,
  editorialImages,
  learningOpportunities,
} from '../lib/flagship';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../lib/sanity-public';
import { schools } from '../lib/schools';
import styles from './flagship.module.css';

const schoolList = Object.values(schools);

const learningSteps = [
  {
    number: '01',
    title: 'Begin with your goal',
    text: 'Tell us what you want to understand, strengthen or achieve.',
  },
  {
    number: '02',
    title: 'Find the right pathway',
    text: 'The team helps identify the appropriate school, level and format.',
  },
  {
    number: '03',
    title: 'Learn through experience',
    text: 'Structured guidance, useful practice and thoughtful feedback keep progress active.',
  },
  {
    number: '04',
    title: 'Carry it forward',
    text: 'Apply what you learn in communication, wellbeing, study or work.',
  },
] as const;

export default async function Page() {
  const [testimonials, teamMembers] = await Promise.all([
    getPublicTestimonials(),
    getPublicTeamMembers(),
  ]);

  return (
    <main className={styles.page}>
      <HomeMotion />
      <SiteHeader />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy} data-reveal="left">
          <p className={styles.kicker}>Luminol Academy · Blida</p>
          <h1 id="hero-title">
            Knowledge for the person you are.
            <span>Capability for who you are becoming.</span>
          </h1>
          <p className={styles.heroLede}>
            Psychology, language learning and professional development brought
            together in one intellectually serious, human-centred academy.
          </p>
          <div className={styles.heroActions}>
            <ButtonLink href="#schools" size="lg">
              Find your Luminol path <span aria-hidden="true">↘</span>
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Speak with the team
            </ButtonLink>
          </div>
          <div className={styles.heroSignals} aria-label="Luminol qualities">
            <span>Human-centred</span>
            <span>Practice-led</span>
            <span>Arabic-ready</span>
          </div>
        </div>

        <div className={styles.heroMedia} data-reveal="scale">
          <EditorialImage
            className={styles.heroFigure}
            image={editorialImages.hero}
            priority
            sizes="(max-width: 72rem) 100vw, 52vw"
            caption="Learning designed around dialogue, practice and progress."
          />
          <div className={styles.heroEditorialCard}>
            <span>One academy</span>
            <strong>Three connected schools</strong>
            <p>Mind · Voice · Future</p>
          </div>
          <div className={styles.heroIndex} aria-hidden="true">
            <span>01</span>
            <i />
            <span>03</span>
          </div>
        </div>

        <nav
          id="schools"
          className={styles.heroBranches}
          aria-label="Luminol schools"
        >
          {schoolList.map((school, index) => (
            <Link
              className={`${styles.heroBranch} ${styles[school.slug]}`}
              data-reveal
              href={`/schools/${school.slug}`}
              key={school.slug}
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
            >
              <span>{school.number}</span>
              <div>
                <small>{school.eyebrow.split(' · ')[0]}</small>
                <strong>{school.name}</strong>
              </div>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </nav>
      </section>

      <section className={styles.credibility} aria-label="How Luminol works">
        {credibilityPrinciples.map((principle, index) => (
          <article
            data-reveal
            key={principle.title}
            style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{principle.title}</h2>
            <p>{principle.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.editorialIntro}>
        <div className={styles.editorialIntroCopy} data-reveal="left">
          <p className={styles.kicker}>A connected view of human development</p>
          <h2>People do not grow in separate boxes.</h2>
          <p className={styles.largeCopy}>
            Emotional awareness shapes communication. Communication shapes
            opportunity. Professional confidence grows when both are stronger.
          </p>
          <p>
            Luminol protects the depth of each discipline while making the
            overall journey clearer, more personal and more useful.
          </p>
          <Link className={styles.textLink} href="/about">
            Discover the Luminol philosophy <span aria-hidden="true">→</span>
          </Link>
        </div>
        <EditorialImage
          className={styles.editorialIntroImage}
          image={editorialImages.learning}
          caption="Serious learning should still feel personal."
        />
      </section>

      <section className={styles.branchSection}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Explore the academy</p>
            <h2>Three distinct schools. One standard of care.</h2>
          </div>
          <p>
            Each branch has its own mood, methods and outcomes. Choose the area
            that best matches what matters now.
          </p>
        </div>

        <div className={styles.branchGrid}>
          {schoolList.map((school, index) => {
            const opportunity = learningOpportunities.find(
              (item) => item.school === school.slug,
            );
            if (!opportunity) return null;

            return (
              <article
                className={`${styles.branchCard} ${styles[school.slug]}`}
                data-reveal
                key={school.slug}
                style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties}
              >
                <EditorialImage
                  className={styles.branchImage}
                  image={
                    opportunity.school === 'psychology'
                      ? editorialImages.psychology
                      : opportunity.school === 'languages'
                        ? editorialImages.languages
                        : editorialImages.training
                  }
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
                <div className={styles.branchCardBody}>
                  <div className={styles.branchMeta}>
                    <span>{school.number}</span>
                    <small>{school.eyebrow}</small>
                  </div>
                  <h3>{school.name}</h3>
                  <p>{school.introduction}</p>
                  <ul>
                    {school.visualWords.map((word) => (
                      <li key={word}>{word}</li>
                    ))}
                  </ul>
                  <Link href={`/schools/${school.slug}`}>
                    {opportunity.cta} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.programmeSection}>
        <div className={styles.programmeIntro} data-reveal="left">
          <p className={styles.kicker}>Selected pathways</p>
          <h2>Start with a clear, useful next step.</h2>
          <p>
            These representative programmes show how the three schools turn
            broad goals into focused learning experiences.
          </p>
          <ButtonLink href="/contact" size="lg">
            Discuss your goal
          </ButtonLink>
        </div>
        <div className={styles.programmeList}>
          {schoolList.map((school, index) => {
            const programme = school.programs[0];
            return (
              <Link
                className={`${styles.programmeRow} ${styles[school.slug]}`}
                data-reveal="right"
                href={`/schools/${school.slug}`}
                key={school.slug}
                style={{ '--reveal-delay': `${index * 75}ms` } as CSSProperties}
              >
                <span>{school.number}</span>
                <div>
                  <small>{school.name}</small>
                  <h3>{programme.title}</h3>
                  <p>{programme.description}</p>
                </div>
                <b aria-hidden="true">↗</b>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.expertiseSection}>
        <div className={styles.expertiseImageWrap} data-reveal="left">
          <EditorialImage
            className={styles.expertiseImage}
            image={editorialImages.training}
            caption="Expertise is visible in how learning is designed and guided."
          />
          <div className={styles.expertiseStamp}>
            <span>L</span>
            <small>Thoughtful by design</small>
          </div>
        </div>
        <div className={styles.expertiseCopy} data-reveal="right">
          <p className={styles.kicker}>Instructor and programme standards</p>
          <h2>Credibility should be experienced, not merely claimed.</h2>
          <p>
            Luminol’s public experience is built to show the standards behind
            each programme: relevant expertise, clear purpose, appropriate
            boundaries, active learning and useful feedback.
          </p>
          <dl>
            <div>
              <dt>Relevant expertise</dt>
              <dd>
                People and methods matched to the discipline and audience.
              </dd>
            </div>
            <div>
              <dt>Clear learning purpose</dt>
              <dd>
                Every programme begins with an outcome, not a generic topic.
              </dd>
            </div>
            <div>
              <dt>Responsible practice</dt>
              <dd>
                Ethical boundaries, accessibility and referral are respected.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {teamMembers?.length ? (
        <section className={styles.peopleSection}>
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.kicker}>People behind the experience</p>
              <h2>Meet the Luminol team.</h2>
            </div>
            <p>
              Only approved, active profiles from the Luminol content system
              appear here.
            </p>
          </div>
          <div className={styles.peopleGrid}>
            {teamMembers.slice(0, 4).map((member) => (
              <article data-reveal key={member._id}>
                {member.portrait ? (
                  <div className={styles.personPortrait}>
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 44rem) 100vw, (max-width: 72rem) 50vw, 25vw"
                    />
                  </div>
                ) : null}
                <small>{member.school ?? 'Luminol Academy'}</small>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials?.length ? (
        <section className={styles.testimonialSection}>
          <div className={styles.testimonialIntro}>
            <p className={styles.kicker}>Approved learner voices</p>
            <h2>What the experience felt like.</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {testimonials.slice(0, 3).map((testimonial) => (
              <figure data-reveal key={testimonial._id}>
                <blockquote>“{testimonial.quote}”</blockquote>
                <figcaption>
                  <strong>{testimonial.personName}</strong>
                  <span>{testimonial.context ?? testimonial.school}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.journeySection}>
        <div className={styles.journeyHeading} data-reveal="left">
          <p className={styles.kicker}>A clear experience</p>
          <h2>From first question to meaningful progress.</h2>
          <p>
            The journey stays structured without becoming impersonal, and
            flexible without losing purpose.
          </p>
        </div>
        <ol className={styles.journeySteps}>
          {learningSteps.map((step, index) => (
            <li
              data-reveal="right"
              key={step.number}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.opportunitiesSection}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Learning opportunities</p>
            <h2>Find what is relevant now.</h2>
          </div>
          <p>
            Current dates and delivery formats are confirmed by the Luminol team
            so visitors never see invented or stale event information.
          </p>
        </div>
        <div className={styles.opportunityGrid}>
          {learningOpportunities.map((opportunity, index) => (
            <Link
              className={`${styles.opportunityCard} ${styles[opportunity.school]}`}
              data-reveal
              href={`/schools/${opportunity.school}`}
              key={opportunity.school}
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <small>{opportunity.label}</small>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.text}</p>
              <strong>
                {opportunity.cta} <b aria-hidden="true">→</b>
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div data-reveal="left">
          <p className={styles.kicker}>Begin with a conversation</p>
          <h2>What would you like to strengthen next?</h2>
          <p>
            Share your goal and the Luminol team will help you identify the
            right school, programme and first step.
          </p>
        </div>
        <ButtonLink data-reveal="right" href="/contact" size="lg">
          Speak with the Luminol team <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
