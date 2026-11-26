import { GoldAccent } from '../../components/gold-accent';
import type { Metadata } from 'next';

import { buildPublicMetadata } from '../../lib/public-metadata';
import { publicSearch } from '../../lib/public-seo';

import { EventsSection } from '../../components/events-section';
import { FounderGold } from '../../components/founder-gold';
import { PhotoCard } from '../../components/live-photo';
import { SiteHeader, SiteFooter } from '../../components/site-shell';
import { editorialPhotos, newEditorialPhotos } from '../../lib/people-photos';
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
    settings: 'Online and in-person workshops',
    upcoming: 'Upcoming workshops',
  },
  fr: {
    title: 'Événements et ateliers',
    intro:
      'Découvrez les rencontres récentes en psychologie et le calendrier prévisionnel des prochains ateliers.',
    recent: 'Rencontres récentes',
    settings: 'Ateliers en ligne et en présentiel',
    upcoming: 'Ateliers à venir',
  },
  ar: {
    title: 'الفعاليات والورش',
    intro:
      'تعرّف على لقاءات لومينول النفسية الأخيرة والجدول المقترح للورش القادمة.',
    recent: 'اللقاءات الأخيرة',
    settings: 'ورش عن بُعد وورش حضورية',
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
          <div className={styles.heroCopy}>
            <div className={styles.heroTitle}>
              <h1 id="events-page-title">{text.title}</h1>
              <GoldAccent name="calendar" />
            </div>
            <p>{text.intro}</p>
            <div className={styles.actions}>
              <a href="#events-recent">{text.recent}</a>
              {workshops.length ? (
                <a href="#upcoming-workshops">{text.upcoming}</a>
              ) : null}
              <FounderGold className={styles.scene} />
            </div>
          </div>
          <PhotoCard
            className={styles.heroPhoto}
            photo={editorialPhotos.workshopRoom}
            locale={locale}
            sizes="(max-width: 760px) 90vw, (max-width: 1320px) 42vw, 560px"
            caption
            priority
          />
        </section>
        <EventsSection locale={locale} archive />
        <WorkshopAgenda locale={locale} workshops={workshops} />
        <section
          className={styles.settings}
          aria-labelledby="event-settings-title"
        >
          <h2 id="event-settings-title">{text.settings}</h2>
          <div className={styles.settingsPhotos}>
            {[newEditorialPhotos.remoteSession, newEditorialPhotos.doorway].map(
              (photo) => (
                <PhotoCard
                  key={photo.src}
                  photo={photo}
                  locale={locale}
                  sizes="(max-width: 640px) 92vw, 46vw"
                  className={styles.settingPhoto}
                  caption
                />
              ),
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
