import type { Metadata } from 'next';

import { buildPublicMetadata } from '../../lib/public-metadata';
import { publicSearch } from '../../lib/public-seo';

import { EventsSection } from '../../components/events-section';
import { FounderGold } from '../../components/founder-gold';
import { SiteHeader, SiteFooter } from '../../components/site-shell';
import { getRequestLocale } from '../../lib/request-locale';
import { getUpcomingWorkshops } from '../../lib/workshop-plan';
import { WorkshopAgenda } from './agenda';
import styles from './page.module.css';

const copy = {
  en: {
    title: 'Events & workshops',
    intro:
      'Explore Luminol’s recent psychology sessions and the proposed schedule for upcoming workshops.',
    recent: 'Recent sessions',
    upcoming: 'Upcoming workshops',
  },
  fr: {
    title: 'Événements et ateliers',
    intro:
      'Découvrez les rencontres récentes en psychologie et le calendrier prévisionnel des prochains ateliers.',
    recent: 'Rencontres récentes',
    upcoming: 'Ateliers à venir',
  },
  ar: {
    title: 'الفعاليات والورش',
    intro:
      'تعرّف على لقاءات لومينول النفسية الأخيرة والجدول المقترح للورش القادمة.',
    recent: 'اللقاءات الأخيرة',
    upcoming: 'الورش القادمة',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPublicMetadata(
    locale,
    '/events',
    publicSearch['/events'][locale],
  );
}

export default async function EventsArchive() {
  const locale = await getRequestLocale();
  const text = copy[locale];
  const workshops = getUpcomingWorkshops();
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero} aria-labelledby="events-page-title">
          <FounderGold className={styles.scene ?? ''} />
          <h1 id="events-page-title">{text.title}</h1>
          <p>{text.intro}</p>
          <div className={styles.actions}>
            <a href="#events-recent">{text.recent}</a>
            {workshops.length ? (
              <a href="#upcoming-workshops">{text.upcoming}</a>
            ) : null}
          </div>
        </section>
        <EventsSection locale={locale} archive />
        <WorkshopAgenda locale={locale} workshops={workshops} />
      </main>
      <SiteFooter />
    </>
  );
}
