import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from './home-motion';
import { SiteFooter, SiteHeader } from './site-shell';
import { localePath, type PublicLocale } from '../lib/i18n';
import { localizedSchools } from '../lib/localized-schools';
import { premiumImages } from '../lib/media-v6';
import type { SchoolSlug } from '../lib/schools';

type Locale = Exclude<PublicLocale, 'ar'>;

const imageBySchool = {
  psychology: premiumImages.psychology,
  languages: premiumImages.languages,
  training: premiumImages.training,
} as const;

const sharedCopy = {
  fr: {
    programmes: 'Programmes et parcours',
    programmesTitle: 'Choisissez un parcours construit autour d’un objectif clair.',
    programmesBody: 'Ces parcours présentent les directions actuellement préparées pour ce pôle. Les disponibilités, niveaux et formats sont confirmés par l’équipe.',
    ask: 'Demander des détails',
    outcomesKicker: 'Bénéfices visés',
    outcomesTitle: 'Le progrès doit être compréhensible et utilisable.',
    outcomesBody: 'Nous décrivons ce que l’expérience cherche à soutenir sans promettre un résultat identique pour tout le monde.',
    methodKicker: 'Comment l’expérience fonctionne',
    methodTitle: 'Une méthode claire qui s’adapte à la personne et à l’objectif.',
    audienceKicker: 'Pensé autour des personnes',
    audienceTitle: 'À qui ce pôle peut-il convenir ?',
    audienceBody: 'La conversation de départ aide à vérifier que le programme, le groupe et le format correspondent au besoin actuel.',
    faqKicker: 'Questions fréquentes',
    faqTitle: 'Quelques réponses avant de nous contacter.',
    important: 'Important',
    relatedKicker: 'Continuer à explorer',
    relatedTitle: 'Les trois pôles de Luminol se renforcent entre eux.',
    relatedBody: 'Découvrez une autre dimension du développement personnel, linguistique ou professionnel.',
    finalKicker: 'Prochaine étape',
    finalTitle: 'Trouvez le parcours qui correspond à votre objectif.',
    finalBody: 'Commencez par votre objectif. L’équipe vous aidera à confirmer le programme, le niveau et le format disponibles.',
    finalCta: 'Parler à l’équipe',
    explore: 'Découvrir les programmes',
    interest: 'Commencer une demande',
  },
  en: {
    programmes: 'Programmes and paths',
    programmesTitle: 'Choose a path built around a clear goal.',
    programmesBody: 'These paths show the directions currently prepared for this school. Availability, level and format are confirmed by the team.',
    ask: 'Ask about this path',
    outcomesKicker: 'Intended benefits',
    outcomesTitle: 'Progress should be understandable and usable.',
    outcomesBody: 'We describe what the experience is designed to support without promising the same result for everyone.',
    methodKicker: 'How the experience works',
    methodTitle: 'A clear method that adapts to the person and the goal.',
    audienceKicker: 'Designed around people',
    audienceTitle: 'Who could this school be right for?',
    audienceBody: 'The first conversation helps confirm whether the programme, group and format fit the current need.',
    faqKicker: 'Frequently asked questions',
    faqTitle: 'Useful answers before you enquire.',
    important: 'Important',
    relatedKicker: 'Keep exploring',
    relatedTitle: 'Luminol’s three schools strengthen one another.',
    relatedBody: 'Explore another dimension of personal, language or professional development.',
    finalKicker: 'Next step',
    finalTitle: 'Find the path that fits your goal.',
    finalBody: 'Start with the goal. The team will help confirm the programme, level and available format.',
    finalCta: 'Talk to the team',
    explore: 'Explore programmes',
    interest: 'Start an enquiry',
  },
} as const;

const experience = {
  fr: {
    psychology: {
      outcomes: ['Mieux nommer et comprendre certaines expériences difficiles', 'Construire des outils pratiques utilisables au quotidien', 'Développer une communication plus claire avec soi et les autres', 'Savoir quand une orientation vers un autre niveau de soin est nécessaire'],
      faq: [
        ['Est-ce une thérapie médicale ou un service d’urgence ?', 'Non. Les programmes sont éducatifs et de soutien. Ils ne remplacent pas les soins médicaux, la psychothérapie ni les services d’urgence.'],
        ['Les parents peuvent-ils demander un accompagnement autour de l’enfant ou de la famille ?', 'Oui. La première conversation sert à comprendre le contexte et à identifier une orientation éducative ou de soutien adaptée.'],
        ['Existe-t-il des ateliers collectifs ?', 'Des ateliers peuvent être proposés selon les thèmes, les groupes et le calendrier confirmés par l’académie.'],
      ],
    },
    languages: {
      outcomes: ['Parler avec plus de confiance dans des situations réelles', 'Comprendre plus facilement les échanges et supports du quotidien', 'Développer un vocabulaire utile plutôt qu’isolé', 'Construire une pratique régulière et mesurable'],
      faq: [
        ['Comment le niveau est-il choisi ?', 'Le niveau est confirmé à partir du point de départ du participant et du programme disponible.'],
        ['Est-ce que les cours privilégient la conversation ?', 'La communication active occupe une place importante, avec la grammaire et le vocabulaire utilisés comme outils au service de l’expression.'],
        ['Puis-je apprendre pour les études ou le travail ?', 'Oui. Certains parcours peuvent être reliés à des besoins académiques, professionnels, d’entretien ou de présentation.'],
      ],
    },
    training: {
      outcomes: ['Communiquer avec plus de structure dans un contexte professionnel', 'Prendre de meilleures décisions avec des repères clairs', 'Transformer les concepts en comportements et outils concrets', 'Renforcer la collaboration, le feedback et l’organisation'],
      faq: [
        ['Les formations sont-elles uniquement pour les entreprises ?', 'Non. Des formats peuvent convenir aux individus, diplômés, managers et équipes selon les programmes disponibles.'],
        ['Peut-on demander un atelier adapté à une équipe ?', 'Oui. L’équipe Luminol peut examiner un besoin organisationnel et confirmer si un format adapté est possible.'],
        ['Les résultats professionnels sont-ils garantis ?', 'Non. Luminol ne garantit pas d’emploi, de promotion ou de résultat financier. Les bénéfices dépendent du contexte, du programme et de la participation.'],
      ],
    },
  },
  en: {
    psychology: {
      outcomes: ['Name and understand difficult experiences more clearly', 'Build practical tools that can be used in everyday life', 'Strengthen communication with yourself and others', 'Recognise when a different level of professional care is appropriate'],
      faq: [
        ['Is this medical therapy or an emergency service?', 'No. The programmes are educational and supportive and do not replace medical care, psychotherapy or emergency services.'],
        ['Can parents ask for guidance around children or family life?', 'Yes. The first conversation helps understand the context and identify an appropriate educational or supportive direction.'],
        ['Are group workshops available?', 'Workshops may be offered depending on the topic, group and confirmed academy schedule.'],
      ],
    },
    languages: {
      outcomes: ['Speak with more confidence in real situations', 'Understand everyday conversations and materials more easily', 'Build useful vocabulary in context', 'Create a more regular and visible practice routine'],
      faq: [
        ['How is the level selected?', 'The level is confirmed from the learner’s starting point and the programme currently available.'],
        ['Is conversation a major part of the course?', 'Active communication is central, while grammar and vocabulary are used as tools to support expression.'],
        ['Can I learn for study or work?', 'Yes. Some paths can be connected to academic, professional, interview or presentation needs.'],
      ],
    },
    training: {
      outcomes: ['Communicate with more structure in professional settings', 'Make decisions with clearer reference points', 'Turn concepts into practical behaviours and tools', 'Strengthen collaboration, feedback and organisation'],
      faq: [
        ['Is training only for companies?', 'No. Formats may suit individuals, graduates, managers and teams depending on the programme available.'],
        ['Can a team request a tailored workshop?', 'Yes. Luminol can review an organisational need and confirm whether an adapted format is possible.'],
        ['Are professional outcomes guaranteed?', 'No. Luminol does not guarantee employment, promotion or financial outcomes. Benefits depend on context, programme and participation.'],
      ],
    },
  },
} as const;

export function LocalizedSchool({ locale, slug }: { locale: Locale; slug: SchoolSlug }) {
  const school = localizedSchools[locale][slug];
  const text = sharedCopy[locale];
  const detail = experience[locale][slug];
  const image = imageBySchool[slug];
  const related = (['psychology', 'languages', 'training'] as const).filter((item) => item !== slug);

  return (
    <main className={`ar-page localized-page ar-school-page school-${slug}`}>
      <HomeMotion />
      <SiteHeader locale={locale} currentPath={`/schools/${slug}`} />

      <section className="ar-school-hero">
        <div className="ar-school-hero-media" aria-hidden="true"><Image src={image.src} alt="" fill priority sizes="100vw" /></div>
        <div className="ar-school-hero-shade" />
        <div className="ar-school-hero-copy" data-reveal="right">
          <p className="ar-kicker">{school.eyebrow}</p><h1>{school.headline}</h1><p>{school.introduction}</p>
          <div className="ar-hero-actions"><ButtonLink href="#programmes" size="lg">{text.explore}</ButtonLink><ButtonLink href={localePath(locale, '/contact')} size="lg" variant="secondary">{text.interest}</ButtonLink></div>
        </div>
        <div className="ar-school-hero-badge"><span>0{(['psychology','languages','training'] as const).indexOf(slug) + 1}</span><strong>{school.name}</strong></div>
      </section>

      <section className="ar-school-promise"><span>{locale === 'fr' ? 'Promesse du pôle' : 'School promise'}</span><blockquote>{school.promise}</blockquote></section>

      <section id="programmes" className="ar-programmes-section">
        <div className="ar-section-heading" data-reveal><div><p className="ar-kicker">{text.programmes}</p><h2>{text.programmesTitle}</h2></div><p>{text.programmesBody}</p></div>
        <div className="ar-program-grid">
          {school.programs.map((programme, index) => (
            <article data-reveal key={programme.title} style={{ '--reveal-delay': `${(index % 2) * 65}ms` } as CSSProperties}><span>0{index + 1}</span><h3>{programme.title}</h3><p>{programme.description}</p><Link href={localePath(locale, '/contact')}>{text.ask} <b aria-hidden="true">→</b></Link></article>
          ))}
        </div>
      </section>

      <section className="ar-school-split">
        <div className="ar-school-split-copy" data-reveal="right"><p className="ar-kicker">{text.outcomesKicker}</p><h2>{text.outcomesTitle}</h2><p>{text.outcomesBody}</p></div>
        <ol className="ar-outcome-list">{detail.outcomes.map((outcome, index) => <li data-reveal="left" key={outcome}><span>0{index + 1}</span>{outcome}</li>)}</ol>
      </section>

      <section className="ar-method-section">
        <div data-reveal="right"><p className="ar-kicker">{text.methodKicker}</p><h2>{text.methodTitle}</h2></div>
        <ol className="ar-method-list">{school.approach.map((step, index) => <li data-reveal="left" key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>
      </section>

      <section className="ar-audience-section">
        <div className="ar-section-heading" data-reveal><div><p className="ar-kicker">{text.audienceKicker}</p><h2>{text.audienceTitle}</h2></div><p>{text.audienceBody}</p></div>
        <div className="ar-audience-grid">{school.audiences.map((audience, index) => <article data-reveal key={audience}><span>0{index + 1}</span><h3>{audience}</h3></article>)}</div>
      </section>

      <section className="ar-faq-section">
        <div data-reveal="right"><p className="ar-kicker">{text.faqKicker}</p><h2>{text.faqTitle}</h2></div>
        <div className="ar-faq-list">{detail.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>

      <aside className="ar-safety-note"><span>{text.important}</span><p>{school.note}</p></aside>

      <section className="ar-related-section">
        <div className="ar-section-heading" data-reveal><div><p className="ar-kicker">{text.relatedKicker}</p><h2>{text.relatedTitle}</h2></div><p>{text.relatedBody}</p></div>
        <div className="ar-related-grid">{related.map((relatedSlug) => <Link href={localePath(locale, `/schools/${relatedSlug}`)} key={relatedSlug}><span>→</span><h3>{localizedSchools[locale][relatedSlug].name}</h3><b aria-hidden="true">→</b></Link>)}</div>
      </section>

      <section className="ar-final-cta"><div data-reveal="right"><p className="ar-kicker">{text.finalKicker}</p><h2>{text.finalTitle}</h2><p>{text.finalBody}</p></div><ButtonLink data-reveal="left" href={localePath(locale, '/contact')} size="lg">{text.finalCta} <span aria-hidden="true">→</span></ButtonLink></section>
      <SiteFooter locale={locale} />
    </main>
  );
}
