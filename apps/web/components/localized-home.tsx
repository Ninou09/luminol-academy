import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { BranchStage } from './branch-stage';
import { CinematicMediaWall } from './cinematic-media';
import { HomeMotion } from './home-motion';
import { ImmersiveHeroMedia } from './immersive-hero-media';
import { SiteFooter, SiteHeader } from './site-shell';
import { credibilityPrinciples } from '../lib/flagship';
import { localePath, type PublicLocale } from '../lib/i18n';
import { premiumGallery, premiumVideos } from '../lib/media-v6';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../lib/sanity-public';

type TranslatedLocale = Exclude<PublicLocale, 'ar'>;

const copy = {
  fr: {
    overline: 'Luminol Academy · Blida',
    hero: [
      'Développez votre esprit.',
      'Renforcez votre voix.',
      'Construisez la suite.',
    ],
    lead: 'Psychologie, langues et formation professionnelle réunies dans une expérience conçue pour transformer la connaissance en capacité réelle.',
    primary: 'Explorer Luminol',
    secondary: 'Parler à l’équipe',
    proof: [
      'Trois pôles complémentaires',
      'Approche humaine et pratique',
      'Arabe · Français · English',
    ],
    scroll: 'Découvrir l’expérience',
    quick: [
      [
        'Psychologie',
        'Comprendre, avancer, construire avec plus de clarté.',
        '/schools/psychology',
      ],
      [
        'Langues',
        'Une langue pensée pour être utilisée dans la vraie vie.',
        '/schools/languages',
      ],
      [
        'Formation',
        'Des compétences visibles dans le travail et les projets.',
        '/schools/training',
      ],
      [
        'Parler à Luminol',
        'Commencez par votre objectif, nous clarifions la suite.',
        '/contact',
      ],
    ],
    manifestoOverline: 'L’idée qui relie tout',
    manifestoTitle:
      'Nous ne construisons pas trois écoles séparées. Nous développons une personne plus capable.',
    manifestoLead:
      'Mieux se comprendre aide à mieux communiquer. Une voix plus sûre rend les compétences plus visibles. Luminol relie donc psychologie, langage et développement professionnel au lieu de les traiter comme des mondes isolés.',
    manifestoCta: 'Découvrir la philosophie Luminol',
    conversionOverline: 'Vous ne savez pas par où commencer ?',
    conversionTitle:
      'Dites-nous ce que vous voulez renforcer. Nous vous aidons à identifier le bon point de départ.',
    conversionBody:
      'Pas besoin de connaître le nom du programme. Un objectif clair suffit pour ouvrir la conversation.',
    conversionCta: 'Décrire mon objectif',
    principlesOverline: 'Ce que l’expérience doit transmettre',
    principlesTitle:
      'Claire dans l’idée. Humaine dans la forme. Forte dans l’application.',
    principles: [
      [
        'Clarté',
        'Une expérience qui explique avant de compliquer et transforme les idées en repères utilisables.',
      ],
      [
        'Humanité',
        'Une qualité exigeante qui reste chaleureuse, respectueuse et proche des personnes.',
      ],
      [
        'Application',
        'Des contenus reliés à une conversation, une décision, une compétence ou une action réelle.',
      ],
    ],
    journeyOverline: 'Un parcours simple',
    journeyTitle: 'D’une question à une prochaine étape claire.',
    journeyIntro:
      'Vous n’avez pas besoin de savoir quel programme choisir avant de nous parler.',
    journey: [
      [
        '01',
        'Commencer par la question',
        'Qu’aimeriez-vous comprendre, apprendre ou développer maintenant ?',
      ],
      [
        '02',
        'Choisir la direction',
        'Nous relions votre objectif au bon pôle, au niveau et au format disponibles.',
      ],
      [
        '03',
        'Apprendre en participant',
        'Dialogue, pratique, exemples et feedback rendent l’apprentissage utilisable.',
      ],
      [
        '04',
        'Transformer en capacité',
        'La finalité est une communication, une décision ou une action meilleure.',
      ],
    ],
    teamOverline: 'Les personnes derrière l’expérience',
    teamTitle: 'Des profils publiés uniquement après validation.',
    testimonialsOverline: 'Des voix réelles',
    testimonialsTitle: 'Aucun témoignage inventé pour remplir l’espace.',
    finalOverline: 'Commencez par votre objectif',
    finalTitle: 'Qu’aimeriez-vous rendre plus fort dans votre vie maintenant ?',
    finalBody:
      'Parlez-nous de votre objectif. L’équipe vous aidera à identifier le pôle et la prochaine étape les plus pertinents.',
    finalCta: 'Commencer la conversation',
    dock: 'Besoin d’une direction ?',
    dockCta: 'Demander conseil',
  },
  en: {
    overline: 'Luminol Academy · Blida',
    hero: [
      'Develop your mind.',
      'Strengthen your voice.',
      'Build what comes next.',
    ],
    lead: 'Psychology, languages and professional training brought together in one experience designed to turn knowledge into real capability.',
    primary: 'Explore Luminol',
    secondary: 'Talk to the team',
    proof: [
      'Three connected schools',
      'Human and practical learning',
      'العربية · Français · English',
    ],
    scroll: 'Discover the experience',
    quick: [
      [
        'Psychology',
        'Understand, grow and move forward with more clarity.',
        '/schools/psychology',
      ],
      [
        'Languages',
        'Language learning designed for real-world use.',
        '/schools/languages',
      ],
      [
        'Professional Training',
        'Skills people can see in work, projects and teams.',
        '/schools/training',
      ],
      [
        'Talk to Luminol',
        'Start with your goal and we will help clarify the route.',
        '/contact',
      ],
    ],
    manifestoOverline: 'The idea connecting everything',
    manifestoTitle:
      'We are not building three separate schools. We are developing a more capable person.',
    manifestoLead:
      'Understanding yourself changes how you communicate. A stronger voice makes professional skills more visible. Luminol connects psychology, language and professional growth instead of treating them as isolated subjects.',
    manifestoCta: 'Explore the Luminol philosophy',
    conversionOverline: 'Not sure where to begin?',
    conversionTitle:
      'Tell us what you want to strengthen. We will help identify the right starting point.',
    conversionBody:
      'You do not need to know the programme name. A clear goal is enough to start the conversation.',
    conversionCta: 'Tell us my goal',
    principlesOverline: 'What the experience should feel like',
    principlesTitle:
      'Clear in thought. Human in delivery. Strong in application.',
    principles: [
      [
        'Clarity',
        'An experience that explains before it complicates and turns ideas into useful reference points.',
      ],
      [
        'Humanity',
        'High standards without making the experience cold, distant or impersonal.',
      ],
      [
        'Application',
        'Learning connected to a real conversation, decision, skill or action.',
      ],
    ],
    journeyOverline: 'A simple journey',
    journeyTitle: 'From one question to a clear next step.',
    journeyIntro:
      'You do not need to know which programme to choose before speaking with us.',
    journey: [
      [
        '01',
        'Start with the question',
        'What would you like to understand, learn or develop right now?',
      ],
      [
        '02',
        'Choose the direction',
        'We connect your goal to the right school, level and available format.',
      ],
      [
        '03',
        'Learn by participating',
        'Dialogue, practice, examples and feedback make learning usable.',
      ],
      [
        '04',
        'Turn it into capability',
        'The final goal is a better conversation, decision, skill or action.',
      ],
    ],
    teamOverline: 'People behind the experience',
    teamTitle: 'Profiles appear only after publication approval.',
    testimonialsOverline: 'Real voices',
    testimonialsTitle: 'No invented testimonials to fill empty space.',
    finalOverline: 'Start with your goal',
    finalTitle: 'What would you like to make stronger in your life right now?',
    finalBody:
      'Tell us the goal. The Luminol team will help identify the school and next step that fit best.',
    finalCta: 'Start the conversation',
    dock: 'Need direction?',
    dockCta: 'Ask the team',
  },
} as const;

export async function LocalizedHome({ locale }: { locale: TranslatedLocale }) {
  const text = copy[locale];
  const [testimonials, teamMembers] = await Promise.all([
    getPublicTestimonials(),
    getPublicTeamMembers(),
  ]);
  const primaryImage = premiumGallery[0]!;
  const secondaryImage = premiumGallery[4]!;

  return (
    <main className="ar-page v4-home localized-page">
      <HomeMotion />
      <SiteHeader locale={locale} currentPath="/" />

      <section className="v4-hero" aria-labelledby="hero-title">
        <ImmersiveHeroMedia video={premiumVideos.hero} locale={locale} />
        <div className="v4-hero-gradient" aria-hidden="true" />
        <div className="v4-hero-brand-shape" aria-hidden="true">
          <Image
            src="/brand/luminol-mark.svg"
            alt=""
            width={520}
            height={570}
            priority
          />
        </div>
        <div className="v4-hero-content" data-reveal="right">
          <p className="v4-overline">{text.overline}</p>
          <h1 id="hero-title">
            <span>{text.hero[0]}</span>
            <span>{text.hero[1]}</span>
            <em>{text.hero[2]}</em>
          </h1>
          <p className="v4-hero-lede">{text.lead}</p>
          <div className="v4-hero-actions">
            <ButtonLink href="#schools" size="lg">
              {text.primary}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, '/contact')}
              size="lg"
              variant="secondary"
            >
              {text.secondary}
            </ButtonLink>
          </div>
          <div className="v6-hero-proof">
            {text.proof.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="v4-hero-side" aria-hidden="true">
          <span>PSYCHOLOGY</span>
          <i />
          <span>LANGUAGES</span>
          <i />
          <span>PROFESSIONAL</span>
        </div>
        <a className="v4-scroll-cue" href="#v4-start">
          <span>{text.scroll}</span>
          <b aria-hidden="true">↓</b>
        </a>
      </section>

      <nav className="v4-quick-access" aria-label="Quick access">
        {text.quick.map(([label, description, href], index) => (
          <Link
            href={localePath(locale, href)}
            key={href}
            data-reveal
            style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
          >
            <span>0{index + 1}</span>
            <div>
              <strong>{label}</strong>
              <small>{description}</small>
            </div>
            <b aria-hidden="true">↘</b>
          </Link>
        ))}
      </nav>

      <section id="v4-start" className="v4-manifesto">
        <div className="v4-manifesto-number" aria-hidden="true">
          01
        </div>
        <div className="v4-manifesto-copy" data-reveal="right">
          <p className="v4-overline">{text.manifestoOverline}</p>
          <h2>{text.manifestoTitle}</h2>
          <p className="v4-manifesto-lead">{text.manifestoLead}</p>
          <Link className="v4-arrow-link" href={localePath(locale, '/about')}>
            {text.manifestoCta} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="v4-manifesto-collage" data-reveal="left">
          <figure className="v4-collage-main">
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 900px) 88vw, 48vw"
            />
            <figcaption>{primaryImage.caption}</figcaption>
          </figure>
          <figure className="v4-collage-float">
            <Image
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              fill
              sizes="(max-width: 900px) 44vw, 18vw"
            />
            <figcaption>{secondaryImage.caption}</figcaption>
          </figure>
          <div className="v4-collage-word" aria-hidden="true">
            LUMINOL
          </div>
        </div>
      </section>

      <BranchStage locale={locale} />

      <section className="v6-conversion-rail" data-reveal>
        <div>
          <p className="v4-overline">{text.conversionOverline}</p>
          <h2>{text.conversionTitle}</h2>
          <p>{text.conversionBody}</p>
        </div>
        <Link
          className="v6-primary-action"
          href={localePath(locale, '/contact')}
        >
          {text.conversionCta} →
        </Link>
      </section>

      <CinematicMediaWall locale={locale} />

      <section className="v4-principles" aria-labelledby="principles-title">
        <header data-reveal="right">
          <p className="v4-overline">{text.principlesOverline}</p>
          <h2 id="principles-title">{text.principlesTitle}</h2>
        </header>
        <div className="v4-principle-grid">
          {text.principles.map(([title, body], index) => (
            <article
              data-reveal
              key={title}
              style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
            >
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v4-journey" aria-labelledby="journey-title">
        <div className="v4-journey-heading" data-reveal="right">
          <p className="v4-overline">{text.journeyOverline}</p>
          <h2 id="journey-title">{text.journeyTitle}</h2>
          <p>{text.journeyIntro}</p>
        </div>
        <ol className="v4-journey-track">
          {text.journey.map(([number, title, body], index) => (
            <li
              data-reveal="left"
              key={number}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {teamMembers?.length ? (
        <section className="v4-governed-section v4-team-section">
          <header data-reveal="right">
            <p className="v4-overline">{text.teamOverline}</p>
            <h2>{text.teamTitle}</h2>
          </header>
          <div className="v4-team-grid">
            {teamMembers.slice(0, 4).map((member, index) => (
              <article
                data-reveal
                key={member._id}
                style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
              >
                {member.portrait ? (
                  <div className="v4-team-image">
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 760px) 88vw, 25vw"
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
        <section className="v4-governed-section v4-testimonial-section">
          <header data-reveal="right">
            <p className="v4-overline">{text.testimonialsOverline}</p>
            <h2>{text.testimonialsTitle}</h2>
          </header>
          <div className="v4-testimonial-grid">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <figure
                data-reveal
                key={testimonial._id}
                style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
              >
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

      <section className="v4-final-cta">
        <div className="v4-final-mark" aria-hidden="true">
          <Image
            src="/brand/luminol-mark.svg"
            alt=""
            width={420}
            height={460}
          />
        </div>
        <div data-reveal="right">
          <p className="v4-overline">{text.finalOverline}</p>
          <h2>{text.finalTitle}</h2>
          <p>{text.finalBody}</p>
        </div>
        <ButtonLink
          data-reveal="left"
          href={localePath(locale, '/contact')}
          size="lg"
        >
          {text.finalCta} <span aria-hidden="true">→</span>
        </ButtonLink>
      </section>

      <div className="v6-floating-cta">
        <span>{text.dock}</span>
        <Link href={localePath(locale, '/contact')}>{text.dockCta} →</Link>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
