import { localizeHref, type Locale } from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';

import { SiteFooter, SiteHeader } from '../components/site-shell';
import { getRequestLocale } from '../lib/request-locale';
import styles from './not-found.module.css';

type NotFoundCopy = {
  eyebrow: string;
  title: string;
  body: string;
  home: string;
  programmes: string;
  noteTitle: string;
  noteBody: string;
};

const NOT_FOUND_COPY: Record<Locale, NotFoundCopy> = {
  en: {
    eyebrow: '404 · Page not found',
    title: 'This path ends here.',
    body: 'The page you tried to open does not exist, may have moved, or is no longer available.',
    home: 'Return home',
    programmes: 'Explore programmes',
    noteTitle: 'You are still inside Luminol.',
    noteBody: 'Use the navigation above or choose a clear next step below.',
  },
  fr: {
    eyebrow: '404 · Page introuvable',
    title: 'Cette page s’arrête ici.',
    body: 'La page que vous cherchez n’existe pas, a peut-être été déplacée ou n’est plus disponible.',
    home: 'Retour à l’accueil',
    programmes: 'Voir les programmes',
    noteTitle: 'Vous êtes toujours chez Luminol.',
    noteBody:
      'Utilisez la navigation ci-dessus ou choisissez une prochaine étape.',
  },
  ar: {
    eyebrow: '404 · الصفحة غير موجودة',
    title: 'هذا المسار ينتهي هنا.',
    body: 'الصفحة التي تحاول فتحها غير موجودة، أو ربما تم نقلها، أو لم تعد متاحة.',
    home: 'العودة إلى الرئيسية',
    programmes: 'استكشف البرامج',
    noteTitle: 'ما زلت داخل Luminol.',
    noteBody: 'استخدم شريط التنقل أعلاه أو اختر خطوتك التالية.',
  },
};

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = NOT_FOUND_COPY[locale];

  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-not-found>
        <section className={styles.hero} aria-labelledby="not-found-title">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 id="not-found-title">{copy.title}</h1>
            <p className={styles.body}>{copy.body}</p>
            <div className={styles.actions}>
              <ButtonLink href={localizeHref(locale, '/')} size="lg">
                {copy.home} <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink
                href={localizeHref(locale, '/programmes')}
                size="lg"
                variant="secondary"
              >
                {copy.programmes}
              </ButtonLink>
            </div>
          </div>

          <aside
            className={styles.visual}
            aria-labelledby="not-found-note-title"
          >
            <div className={styles.orbit} aria-hidden="true">
              <span>4</span>
              <span>0</span>
              <span>4</span>
            </div>
            <div className={styles.note}>
              <p id="not-found-note-title">{copy.noteTitle}</p>
              <span>{copy.noteBody}</span>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
