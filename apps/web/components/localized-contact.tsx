import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EnquiryForm } from './enquiry-form';
import { HomeMotion } from './home-motion';
import { SiteFooter, SiteHeader } from './site-shell';
import { localePath, type PublicLocale } from '../lib/i18n';
import { premiumImages } from '../lib/media-v6';

type Locale = Exclude<PublicLocale, 'ar'>;

const copy = {
  fr: {
    kicker: 'Nous contacter',
    hero: 'Votre prochaine étape commence par une conversation claire.',
    heroBody: 'Dites-nous ce que vous voulez comprendre, apprendre ou développer. L’équipe vous aidera à identifier le pôle, le programme et le format les plus pertinents.',
    exploreKicker: 'Explorer avant d’envoyer',
    exploreTitle: 'Choisissez une direction, ou laissez-nous vous aider à la trouver.',
    exploreBody: 'Chaque pôle répond à un besoin différent. Vous pouvez consulter les détails ou passer directement à votre demande.',
    paths: [
      ['01', 'Psychologie', 'Soutien éducatif, développement personnel, famille et ateliers.', '/schools/psychology'],
      ['02', 'Langues', 'Anglais, français, conversation, aisance et communication.', '/schools/languages'],
      ['03', 'Formation professionnelle', 'Communication, leadership, carrière et programmes pour équipes.', '/schools/training'],
    ],
    processKicker: 'Un départ simple',
    processTitle: 'Que se passe-t-il après l’envoi ?',
    processIntro: 'Le parcours de demande reste volontairement clair et évite de demander des informations sensibles inutiles.',
    steps: ['Votre demande est enregistrée de manière sécurisée.', 'L’équipe examine votre objectif et le domaine qui vous intéresse.', 'Nous revenons vers vous avec la prochaine étape disponible et pertinente.'],
    safety: 'Merci de ne pas envoyer d’informations médicales, financières ou de documents d’identité sensibles via ce formulaire.',
  },
  en: {
    kicker: 'Contact',
    hero: 'Your next step starts with a clear conversation.',
    heroBody: 'Tell us what you want to understand, learn or develop. The team will help identify the school, programme and format that fit best.',
    exploreKicker: 'Explore before you enquire',
    exploreTitle: 'Choose a direction, or let the team help you find one.',
    exploreBody: 'Each school serves a different need. You can review the details first or move directly to the enquiry form.',
    paths: [
      ['01', 'Psychology', 'Educational support, personal growth, family guidance and workshops.', '/schools/psychology'],
      ['02', 'Languages', 'English, French, conversation, fluency and communication.', '/schools/languages'],
      ['03', 'Professional Training', 'Communication, leadership, career skills and team programmes.', '/schools/training'],
    ],
    processKicker: 'A simple start',
    processTitle: 'What happens after you submit?',
    processIntro: 'The enquiry journey is intentionally clear and avoids collecting sensitive information we do not need.',
    steps: ['Your enquiry is recorded securely.', 'The team reviews your goal and area of interest.', 'We contact you with the most relevant available next step.'],
    safety: 'Please do not send medical, financial or sensitive identity information through this form.',
  },
} as const;

export function LocalizedContact({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <main className="ar-page localized-page">
      <HomeMotion />
      <SiteHeader locale={locale} currentPath="/contact" />

      <section className="ar-internal-hero ar-contact-hero">
        <div className="ar-internal-hero-media" aria-hidden="true">
          <Image src={premiumImages.hero.src} alt="" fill priority sizes="100vw" />
        </div>
        <div className="ar-internal-hero-shade" />
        <div className="ar-internal-hero-content" data-reveal="right">
          <p className="ar-kicker">{text.kicker}</p><h1>{text.hero}</h1><p>{text.heroBody}</p>
        </div>
      </section>

      <section className="ar-contact-paths">
        <div className="ar-section-heading" data-reveal><div><p className="ar-kicker">{text.exploreKicker}</p><h2>{text.exploreTitle}</h2></div><p>{text.exploreBody}</p></div>
        <div className="ar-contact-path-grid">
          {text.paths.map(([number, name, description, href], index) => (
            <Link data-reveal href={localePath(locale, href)} key={name} style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}>
              <span>{number}</span><h2>{name}</h2><p>{description}</p><b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="ar-contact-section">
        <div className="ar-contact-context" data-reveal="right">
          <p className="ar-kicker">{text.processKicker}</p><h2>{text.processTitle}</h2><p>{text.processIntro}</p>
          <ol className="ar-contact-steps">
            {text.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}
          </ol>
          <p>{text.safety}</p>
        </div>
        <div className="ar-form-wrap" data-reveal="left"><EnquiryForm locale={locale} /></div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
