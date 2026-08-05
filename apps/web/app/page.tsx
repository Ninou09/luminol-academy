import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { SiteFooter, SiteHeader } from '../components/site-shell';

const schools = [
  {
    number: '01',
    id: 'psychology',
    name: 'Psychology',
    promise: 'Understand yourself. Strengthen your relationships.',
    description:
      'Thoughtful psychological support, coaching and educational programs for emotional wellbeing and personal development.',
    topics: ['Mental wellness', 'Family support', 'Coaching'],
  },
  {
    number: '02',
    id: 'languages',
    name: 'Languages',
    promise: 'Learn clearly. Communicate confidently.',
    description:
      'Human-centered language programs that turn knowledge into confident, meaningful communication.',
    topics: ['English', 'French', 'Fluency'],
  },
  {
    number: '03',
    id: 'training',
    name: 'Professional Training',
    promise: 'Build capability. Move your career forward.',
    description:
      'Practical training for professionals and organizations ready to lead, communicate and work more effectively.',
    topics: ['Leadership', 'Communication', 'Digital skills'],
  },
] as const;

const principles = [
  {
    number: '01',
    title: 'Human before process',
    text: 'Every learning journey starts with the person: their goals, context and potential.',
  },
  {
    number: '02',
    title: 'Depth with clarity',
    text: 'We make serious knowledge understandable, practical and useful in everyday life.',
  },
  {
    number: '03',
    title: 'Progress you can feel',
    text: 'Programs are designed around meaningful outcomes, not passive participation.',
  },
] as const;

export default function Page() {
  return (
    <main>
      <SiteHeader />

      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            Psychology · Languages · Professional growth
          </p>
          <h1 id="hero-title">
            Grow with clarity.
            <span>Learn with purpose.</span>
          </h1>
          <p className="hero-lede">
            Luminol brings mental wellbeing, language learning and professional
            development together in one thoughtful human ecosystem.
          </p>
          <div className="hero-actions">
            <ButtonLink href="#schools" size="lg">
              Explore our schools <span aria-hidden="true">↘</span>
            </ButtonLink>
            <ButtonLink href="/about" size="lg" variant="secondary">
              Discover Luminol
            </ButtonLink>
          </div>
          <dl className="hero-proof" aria-label="Luminol platform strengths">
            <div>
              <dt>3</dt>
              <dd>Connected schools</dd>
            </div>
            <div>
              <dt>1</dt>
              <dd>Human journey</dd>
            </div>
            <div>
              <dt>EN · AR</dt>
              <dd>Bilingual foundation</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-grid" />
          <div className="luminous-orbit orbit-outer" />
          <div className="luminous-orbit orbit-inner" />
          <div className="luminous-core">
            <span>Lu</span>
            <small>Potential, illuminated</small>
          </div>
          <div className="signal-card signal-psychology">
            <span>Mind</span>
            <strong>Understand</strong>
          </div>
          <div className="signal-card signal-languages">
            <span>Voice</span>
            <strong>Connect</strong>
          </div>
          <div className="signal-card signal-training">
            <span>Work</span>
            <strong>Advance</strong>
          </div>
        </div>
      </section>

      <section id="schools" className="schools section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Three schools · One vision</p>
            <h2>Growth is never only one thing.</h2>
          </div>
          <p>
            People thrive when emotional wellbeing, communication and
            professional capability develop together. Luminol connects all three
            without losing the depth of each discipline.
          </p>
        </div>

        <div className="school-grid">
          {schools.map((school) => (
            <article
              className={`school-card school-${school.id}`}
              id={school.id}
              key={school.id}
            >
              <div className="school-topline">
                <span>{school.number}</span>
                <span className="school-mark" aria-hidden="true" />
              </div>
              <h3>{school.name}</h3>
              <p className="school-promise">{school.promise}</p>
              <p className="school-description">{school.description}</p>
              <ul aria-label={`${school.name} focus areas`}>
                {school.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <Link className="text-link" href={`/schools/${school.id}`}>
                Discover this school <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="approach" className="approach">
        <div className="approach-intro">
          <p className="eyebrow eyebrow-light">The Luminol approach</p>
          <h2>Knowledge becomes powerful when it changes how you live.</h2>
          <p>
            We connect scientific thinking with warmth, structure and real-world
            practice—so learning feels personal and progress becomes
            sustainable.
          </p>
        </div>
        <ol className="principle-list">
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
      </section>

      <section id="about" className="about section-shell">
        <div className="about-visual" aria-hidden="true">
          <div className="about-monogram">L</div>
          <p>Intellectual · Modern · Human</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow">Why Luminol exists</p>
          <h2>A brighter way to develop human potential.</h2>
          <p className="about-lede">
            Luminol was created from a simple belief: meaningful education
            should strengthen the whole person.
          </p>
          <p>
            Our ecosystem brings together expert guidance, purposeful learning
            and practical development. The experience is premium without
            becoming distant, scientific without losing warmth, and ambitious
            while remaining accessible.
          </p>
          <div className="value-row">
            <span>Trustworthy</span>
            <span>Empowering</span>
            <span>Future-oriented</span>
          </div>
        </div>
      </section>

      <section
        className="pathway section-shell"
        aria-labelledby="pathway-title"
      >
        <div>
          <p className="eyebrow">Your next chapter</p>
          <h2 id="pathway-title">Begin with the growth that matters now.</h2>
        </div>
        <div className="pathway-links">
          <Link href="/schools/psychology">
            <span>01</span>
            Strengthen your wellbeing
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href="/schools/languages">
            <span>02</span>
            Find your confident voice
            <b aria-hidden="true">↗</b>
          </Link>
          <Link href="/schools/training">
            <span>03</span>
            Advance your professional path
            <b aria-hidden="true">↗</b>
          </Link>
        </div>
      </section>

      <section id="contact" className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">Start your Luminol journey</p>
          <h2>Ready to grow with purpose?</h2>
          <p>
            Tell us where you want to go. We will help you find the right
            program and next step.
          </p>
        </div>
        <ButtonLink href="/contact" size="lg">
          Start a conversation <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
