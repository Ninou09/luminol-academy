import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from '../components/home-motion';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { schools } from '../lib/schools';
import styles from './home.module.css';

const schoolList = Object.values(schools);

const highlights = [
  {
    number: '01',
    title: 'Human-centered',
    text: 'Every pathway begins with the person, their context and their goal.',
  },
  {
    number: '02',
    title: 'Expert-led',
    text: 'Serious knowledge is translated into clear, useful learning experiences.',
  },
  {
    number: '03',
    title: 'Practical by design',
    text: 'Insight becomes action through guided practice and real application.',
  },
  {
    number: '04',
    title: 'One ecosystem',
    text: 'Mind, communication and professional capability grow together.',
  },
] as const;

const principles = [
  {
    number: '01',
    title: 'Understand deeply',
    text: 'Create clarity around the person, the challenge and the outcome that matters.',
  },
  {
    number: '02',
    title: 'Practice meaningfully',
    text: 'Use guided experience, feedback and reflection instead of passive information.',
  },
  {
    number: '03',
    title: 'Progress sustainably',
    text: 'Build confidence and capability that can continue beyond the classroom.',
  },
] as const;

const featuredProgrammes = [
  {
    school: 'psychology',
    schoolName: schools.psychology.name,
    number: '01',
    ...schools.psychology.programs[0],
  },
  {
    school: 'psychology',
    schoolName: schools.psychology.name,
    number: '02',
    ...schools.psychology.programs[2],
  },
  {
    school: 'languages',
    schoolName: schools.languages.name,
    number: '03',
    ...schools.languages.programs[0],
  },
  {
    school: 'languages',
    schoolName: schools.languages.name,
    number: '04',
    ...schools.languages.programs[2],
  },
  {
    school: 'training',
    schoolName: schools.training.name,
    number: '05',
    ...schools.training.programs[0],
  },
  {
    school: 'training',
    schoolName: schools.training.name,
    number: '06',
    ...schools.training.programs[2],
  },
] as const;

const journeySteps = [
  {
    number: '01',
    title: 'Choose your direction',
    text: 'Begin with the dimension of growth that matters most right now.',
  },
  {
    number: '02',
    title: 'Find the right pathway',
    text: 'We connect your goal with the most appropriate school, level and format.',
  },
  {
    number: '03',
    title: 'Learn through experience',
    text: 'Move through structured guidance, practice and useful feedback.',
  },
  {
    number: '04',
    title: 'Carry progress forward',
    text: 'Apply what you learn in everyday life, communication and work.',
  },
] as const;

export default function Page() {
  return (
    <main className={styles.page}>
      <HomeMotion />
      <SiteHeader />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy} data-reveal="left">
            <p className={styles.eyebrow}>
              Luminol Academy · Blida, Algeria
            </p>
            <h1 id="hero-title">
              Develop your mind.
              <span>Strengthen your voice.</span>
              Advance your future.
            </h1>
            <p className={styles.heroLede}>
              One premium human-development ecosystem connecting psychology,
              language learning and professional training with clarity, warmth
              and practical impact.
            </p>
            <div className={styles.heroActions}>
              <ButtonLink className={styles.primaryAction} href="#schools" size="lg">
                Explore our schools <span aria-hidden="true">↘</span>
              </ButtonLink>
              <ButtonLink
                className={styles.secondaryAction}
                href="/contact"
                size="lg"
                variant="secondary"
              >
                Start your journey
              </ButtonLink>
            </div>
            <div className={styles.heroProof} aria-label="Luminol overview">
              <div>
                <strong data-count="3">3</strong>
                <span>Connected schools</span>
              </div>
              <div>
                <strong data-count="1">1</strong>
                <span>Human ecosystem</span>
              </div>
              <div>
                <strong data-count="2">2</strong>
                <span>Language foundations</span>
              </div>
            </div>
          </div>

          <div
            className={styles.heroVisual}
            data-hero-visual
            data-reveal="scale"
            style={{ '--reveal-delay': '120ms' } as CSSProperties}
          >
            <div className={styles.visualGrid} aria-hidden="true" />
            <div className={`${styles.orbit} ${styles.orbitOuter}`} aria-hidden="true" />
            <div className={`${styles.orbit} ${styles.orbitMiddle}`} aria-hidden="true" />
            <div className={`${styles.orbit} ${styles.orbitInner}`} aria-hidden="true" />
            <div className={styles.heroCore} aria-hidden="true">
              <span>L</span>
              <small>Potential illuminated</small>
            </div>

            {schoolList.map((school, index) => (
              <Link
                className={`${styles.heroSchoolCard} ${styles[school.slug]}`}
                href={`/schools/${school.slug}`}
                key={school.slug}
                style={{ '--card-index': index } as CSSProperties}
              >
                <span>{school.number}</span>
                <small>{school.eyebrow.split(' · ')[0]}</small>
                <strong>{school.name}</strong>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}

            <div className={styles.heroLocation}>
              <span aria-hidden="true">✦</span>
              <div>
                <small>Learning from Blida</small>
                <strong>Built for meaningful growth</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.highlightGrid}>
          {highlights.map((highlight, index) => (
            <article
              data-reveal
              key={highlight.number}
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
            >
              <span>{highlight.number}</span>
              <h2>{highlight.title}</h2>
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.marquee} aria-label="Luminol areas of growth">
        <div aria-hidden="true">
          <span>Understand yourself</span>
          <b>✦</b>
          <span>Communicate confidently</span>
          <b>✦</b>
          <span>Build practical capability</span>
          <b>✦</b>
          <span>Understand yourself</span>
          <b>✦</b>
          <span>Communicate confidently</span>
          <b>✦</b>
          <span>Build practical capability</span>
        </div>
      </div>

      <section id="schools" className={styles.schoolSection}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.eyebrow}>Three schools · One vision</p>
            <h2>Choose the path that fits your next chapter.</h2>
          </div>
          <p>
            Each school has its own depth, methods and outcomes. Together they
            form a connected journey for the whole person.
          </p>
        </div>

        <div className={styles.schoolGrid}>
          {schoolList.map((school, index) => (
            <Link
              className={`${styles.schoolCard} ${styles[school.slug]}`}
              data-reveal
              href={`/schools/${school.slug}`}
              key={school.slug}
              style={{ '--reveal-delay': `${index * 90}ms` } as CSSProperties}
            >
              <div className={styles.schoolVisual} aria-hidden="true">
                <span>{school.name.charAt(0)}</span>
                <i />
                <i />
              </div>
              <div className={styles.schoolCardBody}>
                <div className={styles.schoolMeta}>
                  <span>{school.number}</span>
                  <small>{school.eyebrow}</small>
                </div>
                <h3>{school.name}</h3>
                <p>{school.introduction}</p>
                <div className={styles.schoolTopics}>
                  {school.visualWords.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </div>
                <strong>
                  Discover this school <b aria-hidden="true">→</b>
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="approach" className={styles.experienceSection}>
        <div className={styles.experienceVisual} data-reveal="left">
          <div className={styles.experienceGrid} aria-hidden="true" />
          <div className={`${styles.experienceRing} ${styles.ringOne}`} aria-hidden="true" />
          <div className={`${styles.experienceRing} ${styles.ringTwo}`} aria-hidden="true" />
          <div className={styles.experienceCore}>
            <span>Whole-person</span>
            <strong>Learning</strong>
            <small>Mind · Voice · Future</small>
          </div>
          <p>Scientific depth with human warmth and real-world application.</p>
        </div>

        <div className={styles.experienceCopy} data-reveal="right">
          <p className={styles.eyebrow}>The Luminol experience</p>
          <h2>Education should change more than what you know.</h2>
          <p className={styles.experienceLede}>
            It should strengthen how you understand, communicate, decide and
            move forward.
          </p>
          <ol className={styles.principleList}>
            {principles.map((principle) => (
              <li key={principle.number}>
                <span>{principle.number}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.statBand} aria-label="Luminol structure" data-reveal>
        <div>
          <strong data-count="3">3</strong>
          <span>Specialized schools</span>
        </div>
        <div>
          <strong data-count="12" data-count-suffix="+">
            12+
          </strong>
          <span>Structured pathways</span>
        </div>
        <div>
          <strong data-count="1">1</strong>
          <span>Connected platform</span>
        </div>
        <div>
          <strong data-count="100" data-count-suffix="%">
            100%
          </strong>
          <span>Purpose-led design</span>
        </div>
      </section>

      <section className={styles.programmeSection}>
        <div className={styles.sectionHeading} data-reveal>
          <div>
            <p className={styles.eyebrow}>Programs and pathways</p>
            <h2>Serious learning, designed to be used.</h2>
          </div>
          <p>
            Explore representative pathways from each school. Published Sanity
            content can extend these cards without weakening the reviewed
            fallback experience.
          </p>
        </div>

        <div className={styles.programmeGrid}>
          {featuredProgrammes.map((programme, index) => (
            <article
              className={`${styles.programmeCard} ${styles[programme.school]}`}
              data-reveal
              key={`${programme.school}-${programme.title}`}
              style={{ '--reveal-delay': `${(index % 3) * 80}ms` } as CSSProperties}
            >
              <div className={styles.programmeArtwork} aria-hidden="true">
                <span>{programme.number}</span>
                <i />
                <i />
                <b>{programme.schoolName.charAt(0)}</b>
              </div>
              <div className={styles.programmeBody}>
                <small>{programme.schoolName}</small>
                <h3>{programme.title}</h3>
                <p>{programme.description}</p>
                <Link href={`/schools/${programme.school}`}>
                  View school pathways <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.journeySection}>
        <div className={styles.journeyIntro} data-reveal="left">
          <p className={styles.eyebrow}>A clear learning journey</p>
          <h2>From intention to meaningful progress.</h2>
          <p>
            The experience stays structured without becoming rigid, and
            personal without losing academic or professional depth.
          </p>
          <ButtonLink href="/contact" size="lg">
            Discuss your goal <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>

        <div className={styles.journeyPanel} data-reveal="right">
          <ol>
            {journeySteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.progressPanel}>
            <p>Experience balance</p>
            <div>
              <span>Clarity</span>
              <i data-progress style={{ '--progress-scale': 0.92 } as CSSProperties} />
            </div>
            <div>
              <span>Practice</span>
              <i data-progress style={{ '--progress-scale': 0.86 } as CSSProperties} />
            </div>
            <div>
              <span>Application</span>
              <i data-progress style={{ '--progress-scale': 0.96 } as CSSProperties} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.platformSection} data-reveal="scale">
        <div className={styles.platformCopy}>
          <p className={styles.eyebrow}>One Luminol ecosystem</p>
          <h2>Growth connects across every dimension of life.</h2>
          <p>
            Begin with one need and continue across the academy as your goals
            evolve—from emotional awareness to confident communication and
            professional capability.
          </p>
        </div>
        <div className={styles.platformOrbit} aria-hidden="true">
          <div className={styles.platformCore}>L</div>
          <span>Mind</span>
          <span>Voice</span>
          <span>Future</span>
        </div>
        <div className={styles.platformLinks}>
          {schoolList.map((school) => (
            <Link href={`/schools/${school.slug}`} key={school.slug}>
              <span>{school.number}</span>
              <strong>{school.name}</strong>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div data-reveal="left">
          <p className={styles.eyebrow}>Your next chapter</p>
          <h2>Ready to grow with clarity and purpose?</h2>
          <p>
            Tell us what you want to strengthen. We will help you identify the
            right school, program and next step.
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
