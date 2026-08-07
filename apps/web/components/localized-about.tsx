import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from './home-motion';
import { SiteFooter, SiteHeader } from './site-shell';
import { localePath, type PublicLocale } from '../lib/i18n';
import { premiumImages } from '../lib/media-v6';
import { getPublicTeamMembers } from '../lib/sanity-public';

type Locale = Exclude<PublicLocale, 'ar'>;

const copy = {
  fr: {
    kicker: 'À propos',
    hero: 'Nous croyons qu’une personne ne se développe jamais dans un seul domaine.',
    heroBody:
      'Luminol relie psychologie, langues et développement professionnel autour d’une même idée: transformer une connaissance claire en capacité utilisable.',
    purpose: [
      [
        'Clarté',
        'Rendre les idées sérieuses compréhensibles sans les simplifier à l’excès.',
      ],
      [
        'Humanité',
        'Maintenir une expérience exigeante, chaleureuse et respectueuse.',
      ],
      [
        'Application',
        'Relier l’apprentissage à une décision, une conversation ou une compétence réelle.',
      ],
    ],
    whyKicker: 'Pourquoi Luminol existe',
    whyTitle:
      'Parce que les besoins humains ne vivent pas dans des cases séparées.',
    whyLead:
      'Confiance, communication et capacité professionnelle se renforcent mutuellement dans la vie réelle.',
    whyBody:
      'Luminol rassemble ces dimensions au sein d’une seule académie tout en préservant les limites, méthodes et exigences propres à chaque pôle.',
    visionKicker: 'Mission et vision',
    visionTitle:
      'Un apprentissage clair. Une expérience humaine. Une capacité qui reste après le programme.',
    visionLead:
      'Notre ambition est de rendre le développement personnel, linguistique et professionnel plus accessible, plus cohérent et plus proche de la vraie vie.',
    visionBody:
      'À long terme, Luminol veut devenir une référence de confiance où une personne peut faire évoluer sa conscience, sa communication et ses compétences à différentes étapes de sa vie.',
    visionCta: 'Parler à l’équipe Luminol',
    valuesKicker: 'Ce qui nous guide',
    valuesTitle: 'Des standards élevés sans perdre la dimension humaine.',
    valuesIntro:
      'Ces principes influencent la conception des programmes, le contenu, la communication et la façon d’accueillir chaque personne.',
    values: [
      [
        '01',
        'Comprendre en profondeur',
        'Transformer des connaissances sérieuses en langage clair et utile.',
      ],
      [
        '02',
        'Rester humain',
        'Organiser une expérience professionnelle sans la rendre froide ou distante.',
      ],
      [
        '03',
        'Créer un progrès qui compte',
        'Construire autour d’un changement que la personne peut reconnaître et utiliser.',
      ],
      [
        '04',
        'Relier les dimensions',
        'Faire le lien entre pensée, communication et évolution professionnelle.',
      ],
    ],
    teamKicker: 'L’équipe',
    teamTitle: 'Des expertises publiées avec clarté et validation.',
    teamIntro:
      'Aucun profil n’apparaît ici avant validation du nom, du rôle, de la biographie et de la photo.',
    finalKicker: 'Votre place chez Luminol',
    finalTitle: 'Quel aspect souhaitez-vous développer maintenant ?',
    finalBody:
      'Explorez les trois pôles ou décrivez simplement votre objectif à notre équipe.',
    finalCta: 'Commencer une conversation',
  },
  en: {
    kicker: 'About',
    hero: 'We believe people never grow in only one dimension.',
    heroBody:
      'Luminol connects psychology, languages and professional development around one idea: clear knowledge should become capability you can use.',
    purpose: [
      [
        'Clarity',
        'Make serious ideas understandable without flattening their meaning.',
      ],
      ['Humanity', 'Keep the experience ambitious, warm and respectful.'],
      [
        'Application',
        'Connect learning to a real decision, conversation or capability.',
      ],
    ],
    whyKicker: 'Why Luminol exists',
    whyTitle: 'Because human needs do not live in separate boxes.',
    whyLead:
      'Confidence, communication and professional capability reinforce each other in real life.',
    whyBody:
      'Luminol brings these dimensions into one academy while protecting the methods, boundaries and standards that belong to each school.',
    visionKicker: 'Mission and vision',
    visionTitle:
      'Clear learning. A human experience. Capability that remains after the programme.',
    visionLead:
      'Our ambition is to make personal, language and professional development more accessible, coherent and connected to real life.',
    visionBody:
      'Over time, Luminol aims to become a trusted environment where people can strengthen awareness, communication and professional capability across different stages of life.',
    visionCta: 'Talk to the Luminol team',
    valuesKicker: 'What guides us',
    valuesTitle: 'High standards without losing the human dimension.',
    valuesIntro:
      'These principles shape programme design, content, communication and the way each person is welcomed into the academy.',
    values: [
      [
        '01',
        'Understand deeply',
        'Turn serious knowledge into language that is clear, respectful and useful.',
      ],
      [
        '02',
        'Stay human',
        'Build a professional experience without making it cold or distant.',
      ],
      [
        '03',
        'Create progress that matters',
        'Design around a change the learner can recognise and use.',
      ],
      [
        '04',
        'Connect the dimensions',
        'Link thinking, communication and professional growth instead of isolating them.',
      ],
    ],
    teamKicker: 'The team',
    teamTitle: 'Expertise published with clarity and approval.',
    teamIntro:
      'No profile appears here until the name, role, biography and image have been approved for publication.',
    finalKicker: 'Your place at Luminol',
    finalTitle: 'Which part of your growth matters most right now?',
    finalBody:
      'Explore the three schools or simply tell the team what you want to understand, learn or develop.',
    finalCta: 'Start a conversation',
  },
} as const;

export async function LocalizedAbout({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const teamMembers = await getPublicTeamMembers();

  return (
    <main className="ar-page localized-page">
      <HomeMotion />
      <SiteHeader locale={locale} currentPath="/about" />

      <section className="ar-internal-hero ar-about-hero">
        <div className="ar-internal-hero-media" aria-hidden="true">
          <Image
            src={premiumImages.learning.src}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="ar-internal-hero-shade" />
        <div className="ar-internal-hero-content" data-reveal="right">
          <p className="ar-kicker">{text.kicker}</p>
          <h1>{text.hero}</h1>
          <p>{text.heroBody}</p>
        </div>
      </section>

      <section className="ar-purpose-strip" aria-label="Academy principles">
        {text.purpose.map(([title, body], index) => (
          <article
            data-reveal
            key={title}
            style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
          >
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="ar-story-section">
        <div className="ar-story-heading" data-reveal="right">
          <p className="ar-kicker">{text.whyKicker}</p>
          <h2>{text.whyTitle}</h2>
        </div>
        <div className="ar-story-copy" data-reveal="left">
          <p className="ar-story-lead">{text.whyLead}</p>
          <p>{text.whyBody}</p>
        </div>
      </section>

      <section className="ar-split-feature">
        <figure className="ar-feature-image" data-reveal="right">
          <div>
            <Image
              src={premiumImages.hero.src}
              alt={premiumImages.hero.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
          <figcaption>
            <span>{premiumImages.hero.alt}</span>
            <a
              href={premiumImages.hero.creditUrl}
              target="_blank"
              rel="noreferrer"
            >
              {premiumImages.hero.credit}
            </a>
          </figcaption>
        </figure>
        <div className="ar-section-copy" data-reveal="left">
          <p className="ar-kicker">{text.visionKicker}</p>
          <h2>{text.visionTitle}</h2>
          <p className="ar-large-copy">{text.visionLead}</p>
          <p>{text.visionBody}</p>
          <ButtonLink href={localePath(locale, '/contact')} size="lg">
            {text.visionCta}
          </ButtonLink>
        </div>
      </section>

      <section className="ar-values-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">{text.valuesKicker}</p>
            <h2>{text.valuesTitle}</h2>
          </div>
          <p>{text.valuesIntro}</p>
        </div>
        <div className="ar-values-grid">
          {text.values.map(([number, title, body], index) => (
            <article
              data-reveal
              key={number}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      {teamMembers?.length ? (
        <section className="ar-people-section">
          <div className="ar-section-heading" data-reveal>
            <div>
              <p className="ar-kicker">{text.teamKicker}</p>
              <h2>{text.teamTitle}</h2>
            </div>
            <p>{text.teamIntro}</p>
          </div>
          <div className="ar-people-grid">
            {teamMembers.map((member) => (
              <article data-reveal key={member._id}>
                {member.portrait ? (
                  <div className="ar-person-image">
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 700px) 100vw, 25vw"
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

      <section className="ar-final-cta">
        <div data-reveal="right">
          <p className="ar-kicker">{text.finalKicker}</p>
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
      <SiteFooter locale={locale} />
    </main>
  );
}
