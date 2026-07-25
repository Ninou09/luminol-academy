import { ButtonLink, Wordmark } from '@luminol/ui';

export default function Page() {
  return (
    <main>
      <nav>
        <Wordmark />
        <div className="nav-links">
          <a href="#schools">Schools</a>
          <a href="#about">Our philosophy</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      <section className="hero">
        <p className="eyebrow">Luminol Academy · Learning with purpose</p>
        <h1>
          Education for
          <br />
          <em>a luminous future.</em>
        </h1>
        <p className="lede">
          An international academy bringing depth, clarity and human insight to
          lifelong learning.
        </p>
        <ButtonLink className="mt-8" href="#schools" size="lg">
          Discover our schools <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>
      <section id="schools" className="schools">
        <div>
          <p className="eyebrow">Three schools · One vision</p>
          <h2>
            Knowledge that
            <br />
            moves with you.
          </h2>
        </div>
        <div className="school-list">
          <article>
            <span>01</span>
            <h3>School of Psychology</h3>
            <p>Understanding people, relationships and the mind.</p>
          </article>
          <article>
            <span>02</span>
            <h3>School of Languages</h3>
            <p>Language learning built around culture and connection.</p>
          </article>
          <article>
            <span>03</span>
            <h3>School of Professional Development</h3>
            <p>Practical capabilities for thoughtful leaders.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
