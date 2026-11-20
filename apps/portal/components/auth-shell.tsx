import type { Locale } from '@luminol/localization';
import { Wordmark } from '@luminol/ui';

import { getPortalRequestLocale } from '../lib/request-locale';

const fallbackWebsiteUrl = 'https://luminol-academy-web.vercel.app';

function websiteUrl(locale: Locale) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  let origin = fallbackWebsiteUrl;
  try {
    origin = new URL(configured || fallbackWebsiteUrl).origin;
  } catch {
    // keep the fallback
  }
  return locale === 'en' ? origin : `${origin}/${locale}`;
}

const copy = {
  en: {
    eyebrow: 'Your Luminol space',
    signIn: 'Welcome back.',
    signUp: 'Begin your path.',
    lede: 'One calm place for your courses, sessions, progress and certificates.',
    points: ['Lessons and session schedule', 'Progress you can see', 'Verified certificates'],
    back: 'Back to the website',
    help: 'Need help signing in? WhatsApp +213 556 91 45 17',
  },
  fr: {
    eyebrow: 'Votre espace Luminol',
    signIn: 'Bon retour.',
    signUp: 'Commencez votre parcours.',
    lede: 'Un seul endroit serein pour vos cours, séances, progrès et certificats.',
    points: ['Leçons et calendrier des séances', 'Une progression visible', 'Certificats vérifiés'],
    back: 'Retour au site',
    help: 'Besoin d’aide pour vous connecter ? WhatsApp +213 556 91 45 17',
  },
  ar: {
    eyebrow: 'فضاؤك في لومينول',
    signIn: 'مرحباً بعودتك.',
    signUp: 'ابدأ مسارك.',
    lede: 'مكان هادئ واحد لدوراتك وجلساتك وتقدّمك وشهاداتك.',
    points: ['الدروس وجدول الجلسات', 'تقدّم واضح أمامك', 'شهادات موثّقة'],
    back: 'العودة إلى الموقع',
    help: 'تحتاج مساعدة في الدخول؟ واتساب ‎+213 556 91 45 17',
  },
} as const satisfies Record<
  Locale,
  {
    eyebrow: string;
    signIn: string;
    signUp: string;
    lede: string;
    points: readonly string[];
    back: string;
    help: string;
  }
>;

/** Clerk theme matched to the public website (night blue, gold, cyan). */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#f3d48f',
    colorBackground: '#071a2b',
    colorText: '#f4f8fb',
    colorTextSecondary: '#b9cfdb',
    colorTextOnPrimaryBackground: '#061321',
    colorInputBackground: '#0b2236',
    colorInputText: '#f4f8fb',
    colorNeutral: '#d4e5ee',
    colorDanger: '#ff8a8a',
    borderRadius: '0.9rem',
    fontFamily: 'inherit',
  },
  elements: {
    rootBox: 'auth-clerk-root',
    cardBox: 'auth-clerk-card',
  },
} as const;

export async function AuthShell({
  mode,
  children,
}: {
  mode: 'signIn' | 'signUp';
  children: React.ReactNode;
}) {
  const locale = await getPortalRequestLocale();
  const text = copy[locale];
  const site = websiteUrl(locale);

  return (
    <main className="auth-page">
      <section className="auth-story" aria-labelledby="auth-title">
        <a className="auth-brand" href={site}>
          <Wordmark />
        </a>
        <div className="auth-story-body">
          <p className="auth-eyebrow">{text.eyebrow}</p>
          <h1 id="auth-title">{text[mode]}</h1>
          <p className="auth-lede">{text.lede}</p>
          <ul className="auth-points">
            {text.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <a className="auth-back" href={site}>
          <span aria-hidden="true">{locale === 'ar' ? '→' : '←'}</span> {text.back}
        </a>
      </section>
      <section className="auth-form">
        {children}
        <p className="auth-help">{text.help}</p>
      </section>
    </main>
  );
}
