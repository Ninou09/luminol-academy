import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ButtonLink } from '@luminol/ui';
import { EditorialImage } from '../../components/editorial-image';
import { HomeMotion } from '../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { credibilityPrinciples, editorialImages } from '../../lib/flagship';
import { getPublicTeamMembers } from '../../lib/sanity-public';
import styles from '../flagship.module.css';

const aboutDescription =
  'Discover the founder-led vision, philosophy and human-development mission behind Luminol Academy.';

export const metadata: Metadata = {
  title: 'About Luminol',
  description: aboutDescription,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Luminol',
    description: aboutDescription,
    type: 'website',
    url: '/about',
  },
  twitter: {
    card: 'summary',
    title: 'About Luminol',
    description: aboutDescription,
  },
};

const values = [
  {
    number: '01',
    title: 'Intellectual depth',
    description:
      'Serious knowledge is translated with clarity, integrity and respect for the learner.',
  },
  {
    number: '02',
    title: 'Human warmth',
    description:
      'Premium education should still feel personal, supportive and approachable.',
  },
  {
    number: '03',
    title: 'Purposeful progress',
    description:
      'Learning is designed around choices, communication, wellbeing and useful capability.',
  },
  {
    number: '04',
    title: 'Connected growth',
    description:
      'The academy connects the dimensions that shape how people live, communicate and work.',
  },
] as const;

export default async function AboutPage() {
  const teamMembers = await getPublicTeamMembers();

  return (
    <main className={styles.page}>
      <HomeMotion />
      <SiteHeader />

      <section className={styles.internalHero}>
        <div className={styles.internalHeroCopy} data-reveal="left">
          <p className={styles.kicker}>About Luminol</p>
          <h1>Human potential deserves a more connected kind of education.</h1>
          <p>
            Luminol is a founder-led academy for psychology, language learning
            and professional development—built around the whole person, not
            only one skill.
          </p>
        </div>
        <div className={styles.internalHeroMedia} data-reveal="scale">
          <EditorialImage
            className={styles.internalHeroFigure}
            image={editorialImages.learning}
            priority
            sizes="(max-width: 72rem) 100vw, 52vw"
            caption="Knowledge becomes meaningful when people can use it."
          />
          <div className={styles.internalHeroNote}>
            <small>The founding idea</small>
            <p>Mind, voice and future continually shape one another.</p>
          </div>
        </div>
      </section>

      <section className={styles.editorialBand}>
        {credibilityPrinciples.slice(0, 3).map((principle, index) => (
          <article
            data-reveal
            key={principle.title}
            style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{principle.title}</h2>
            <p>{principle.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.storySection}>
        <div data-reveal="left">
          <p className={styles.kicker}>Why Luminol exists</p>
          <h2>Growth becomes more useful when knowledge connects.</h2>
        </div>
        <div className={styles.storyCopy} data-reveal="right">
          <p className={styles.storyLead}>
            Emotional strength, communication and professional capability are
            often taught separately, even though they continuously influence
            one another.
          </p>
          <p>
            Luminol brings these needs into one coherent academy while
            protecting the language, ethics and standards of every discipline.
            The result is intellectually serious, emotionally intelligent and
            practical enough to support everyday progress.
          </p>
          <p>
            The platform is designed to help individuals, families,
            professionals and organisations find a relevant starting point and
            continue developing as their goals evolve.
          </p>
        </div>
      </section>

      <section className={styles.storySection}>
        <EditorialImage
          className={styles.editorialIntroImage}
          image={editorialImages.hero}
          caption="Dialogue and active participation are central to the Luminol experience."
        />
        <div className={styles.storyCopy} data-reveal="right">
          <p className={styles.kicker}>Mission and vision</p>
          <h2>Clear learning. Human experience. Lasting capability.</h2>
          <p className={styles.storyLead}>
            Make meaningful human development understandable, approachable and
            connected to real life.
          </p>
          <p>
            Luminol’s long-term vision is a trusted ecosystem where people can
            strengthen emotional awareness, communication and professional
            capability across different stages of life.
          </p>
          <ButtonLink href="/contact" size="lg">
            Speak with the Luminol team
          </ButtonLink>
        </div>
      </section>

      <section className={styles.branchSection}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>What guides the academy</p>
            <h2>Premium standards without losing humanity.</h2>
          </div>
          <p>
            These principles shape programme design, content, communication and
            every interaction with the Luminol community.
          </p>
        </div>
        <div className={styles.valuesGrid}>
          {values.map((value, index) => (
            <article
              data-reveal
              key={value.number}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      {teamMembers?.length ? (
        <section className={styles.peopleSection}>
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.kicker}>The people behind Luminol</p>
              <h2>Approved expertise, presented clearly.</h2>
            </div>
            <p>
              Profiles appear only after Luminol has approved the biography,
              role and portrait for publication.
            </p>
          </div>
          <div className={styles.peopleGrid}>
            {teamMembers.map((member) => (
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

      <section className={styles.finalCta}>
        <div data-reveal="left">
          <p className={styles.kicker}>Find your place at Luminol</p>
          <h2>Which kind of growth matters most today?</h2>
          <p>
            Explore the three schools or tell the team what you want to
            understand, strengthen or achieve.
          </p>
        </div>
        <ButtonLink data-reveal="right" href="/contact" size="lg">
          Start a conversation <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
