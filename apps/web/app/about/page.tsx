import type { Metadata } from 'next';
import { ButtonLink } from '@luminol/ui';
import { SiteFooter, SiteHeader } from '../../components/site-shell';

export const metadata: Metadata = {
  title: 'About Luminol',
  description:
    'Discover the founder-led vision, philosophy and human-development mission behind Luminol Academy.',
};

const values = [
  {
    number: '01',
    title: 'Intellectual depth',
    description:
      'We respect serious knowledge and translate it with clarity, integrity and care.',
  },
  {
    number: '02',
    title: 'Human warmth',
    description:
      'Premium experiences should still feel personal, supportive and genuinely accessible.',
  },
  {
    number: '03',
    title: 'Purposeful progress',
    description:
      'Learning matters when it strengthens choices, communication, wellbeing and work.',
  },
  {
    number: '04',
    title: 'Connected growth',
    description:
      'People do not develop in separate boxes, so Luminol connects the capabilities that shape a life.',
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="about-page-hero">
        <div className="about-page-copy">
          <p className="eyebrow">About Luminol</p>
          <h1>Human potential deserves a brighter kind of education.</h1>
          <p>
            Luminol is a founder-led ecosystem for mental wellbeing, language
            learning and professional development—built around the whole
            person, not only one skill.
          </p>
        </div>
        <div className="about-page-visual" aria-hidden="true">
          <div className="about-rays" />
          <span>L</span>
          <p>Knowledge · Humanity · Progress</p>
        </div>
      </section>

      <section className="origin section-shell">
        <div>
          <p className="eyebrow">The founding idea</p>
          <h2>Growth becomes transformative when knowledge connects.</h2>
        </div>
        <div className="origin-copy">
          <p className="origin-lede">
            Luminol began with a simple observation: emotional strength,
            communication and professional capability constantly shape one
            another.
          </p>
          <p>
            Traditional learning often separates these needs. Luminol brings
            them into one coherent experience while protecting the depth and
            standards of every discipline.
          </p>
          <p>
            The result is an academy designed to be intellectually serious,
            emotionally intelligent and practical enough to create meaningful
            change in everyday life.
          </p>
        </div>
      </section>

      <section className="mission-vision">
        <article>
          <span>Mission</span>
          <h2>Make meaningful human development clear and accessible.</h2>
          <p>
            Provide thoughtful guidance and high-quality learning that helps
            people understand themselves, communicate confidently and develop
            the capabilities to move forward.
          </p>
        </article>
        <article>
          <span>Vision</span>
          <h2>Build a connected platform for lifelong growth.</h2>
          <p>
            Create a trusted ecosystem where individuals, families,
            professionals and organizations can learn, develop and measure
            progress across every important stage.
          </p>
        </article>
      </section>

      <section className="values section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What guides Luminol</p>
            <h2>Premium standards. Human experience.</h2>
          </div>
          <p>
            These principles shape the platform, programs, content and every
            interaction with the Luminol community.
          </p>
        </div>
        <div className="value-grid">
          {values.map((value) => (
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
          <small>One human journey</small>
        </div>
        <div className="ecosystem-school ecosystem-psychology">
          <span>01</span>
          <h3>Psychology</h3>
          <p>Understand and strengthen.</p>
        </div>
        <div className="ecosystem-school ecosystem-languages">
          <span>02</span>
          <h3>Languages</h3>
          <p>Learn and connect.</p>
        </div>
        <div className="ecosystem-school ecosystem-training">
          <span>03</span>
          <h3>Training</h3>
          <p>Develop and advance.</p>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow eyebrow-light">Find your place at Luminol</p>
          <h2>Which kind of growth matters most today?</h2>
          <p>
            Explore the three schools or tell the team what you want to
            achieve.
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
