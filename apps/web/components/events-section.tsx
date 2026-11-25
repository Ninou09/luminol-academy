import { localizeHref, type Locale } from '@luminol/localization';
import Image from 'next/image';

import { illustrativePhotoCredit, peoplePhotos } from '../lib/people-photos';
import { getUpcomingWorkshops } from '../lib/workshop-plan';
import { channelCopy, getWhatsAppHref } from '../lib/contact-channels';
import {
  eventsCopy,
  hasEventEnded,
  luminolEvents,
  psychologyTeam,
  type LuminolEvent,
} from '../lib/events';
import styles from './events-section.module.css';

const dateLocale: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  ar: 'ar-DZ',
};

const previewCopy = {
  en: {
    proposed: 'Next proposed workshop',
    schedule: 'See the workshop calendar',
    blida: 'Blida',
    zoom: 'Online · Zoom',
  },
  fr: {
    proposed: 'Prochain atelier prévisionnel',
    schedule: 'Voir le calendrier des ateliers',
    blida: 'Blida',
    zoom: 'En ligne · Zoom',
  },
  ar: {
    proposed: 'الورشة المقترحة القادمة',
    schedule: 'عرض تقويم الورش',
    blida: 'البليدة',
    zoom: 'عبر الإنترنت · Zoom',
  },
} as const;

function parts(iso: string, locale: Locale) {
  const date = new Date(`${iso}T12:00:00+01:00`);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(dateLocale[locale], {
      timeZone: 'Africa/Algiers',
      ...options,
    }).format(date);
  return {
    day: fmt({ day: 'numeric' }),
    month: fmt({ month: 'short' }),
    full: fmt({ day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function presenterNames(event: LuminolEvent, locale: Locale) {
  return event.presenters
    .map(
      (id) => psychologyTeam.find((member) => member.id === id)?.name[locale],
    )
    .filter(Boolean)
    .join(' · ');
}

/** Upcoming and recent Luminol sessions, from the academy's own records. */
export function EventsSection({
  locale,
  archive = false,
}: {
  locale: Locale;
  archive?: boolean;
}) {
  const copy = eventsCopy[locale];
  const now = new Date();
  const nextWorkshop = archive ? undefined : getUpcomingWorkshops(now)[0];
  const upcoming = luminolEvents
    .filter((event) => !hasEventEnded(event, now))
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'));
  const endTime = (event: LuminolEvent) =>
    Date.parse(
      event.endsAt ?? `${event.secondDate ?? event.date}T23:59:59.999+01:00`,
    );
  const past = luminolEvents
    .filter((event) => hasEventEnded(event, now))
    .sort((a, b) => endTime(b) - endTime(a));
  const askHref =
    getWhatsAppHref(channelCopy[locale].whatsappMessage) ??
    localizeHref(locale, '/contact');

  return (
    <section
      className={styles.section}
      aria-labelledby={archive ? 'events-recent' : 'events-title'}
      data-events-archive={archive || undefined}
      data-home-events={!archive || undefined}
    >
      {!archive ? (
        <div className={styles.heading} data-reveal>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="events-title" data-no-split>
            {copy.title}
          </h2>
          <p>{copy.intro}</p>
        </div>
      ) : null}

      <div className={archive ? undefined : styles.homeProgramme}>
        <div className={archive ? undefined : styles.recentPanel}>
          {archive ? (
            <h2 id="events-recent" className={styles.groupTitle} data-no-split>
              {copy.past}
            </h2>
          ) : (
            <h3 className={styles.groupTitle}>{copy.past}</h3>
          )}
          <ol className={styles.past}>
            {(archive ? past : past.slice(0, 3)).map((event) => {
              const lastDate = event.secondDate ?? event.date!;
              const date = parts(lastDate, locale);
              return (
                <li key={event.id}>
                  <time dateTime={lastDate}>{date.full}</time>
                  <div>
                    <strong dir="auto">{event.title[locale]}</strong>
                    <span>
                      {copy.with} {presenterNames(event, locale)}
                    </span>
                  </div>
                  {event.pageHref ? (
                    <a href={localizeHref(locale, event.pageHref)}>
                      {copy.details} <span aria-hidden="true">→</span>
                    </a>
                  ) : event.recording ? (
                    <a href={askHref} target="_blank" rel="noopener">
                      {copy.recording} · {copy.askRecording}
                    </a>
                  ) : (
                    <span />
                  )}
                </li>
              );
            })}
          </ol>
          {!archive && (
            <a
              className={styles.calendar}
              href={localizeHref(locale, '/events')}
            >
              {
                {
                  ar: 'كل الفعاليات والورش',
                  fr: 'Tous les événements et ateliers',
                  en: 'All events and workshops',
                }[locale]
              }{' '}
              →
            </a>
          )}
        </div>
        {!archive && nextWorkshop ? (
          <aside
            className={styles.workshopPreview}
            aria-labelledby="home-workshop-title"
          >
            <figure
              className={styles.previewPhoto}
              data-media-source={illustrativePhotoCredit.source}
              data-media-license={illustrativePhotoCredit.license}
            >
              <Image
                src={peoplePhotos.academyRoleplay.src}
                alt={peoplePhotos.academyRoleplay.alt[locale]}
                fill
                sizes="(max-width: 760px) 92vw, 36vw"
              />
              <figcaption className="scene-caption">
                {illustrativePhotoCredit.label[locale]}
              </figcaption>
            </figure>
            <div className={styles.previewCopy}>
              <p className={styles.previewLabel}>
                {previewCopy[locale].proposed}
              </p>
              <h3 id="home-workshop-title">{nextWorkshop.title[locale]}</h3>
              <p>
                <time dateTime={nextWorkshop.date}>
                  {parts(nextWorkshop.date, locale).full}
                </time>{' '}
                · {previewCopy[locale][nextWorkshop.venue]}
              </p>
              <a href={localizeHref(locale, '/events#upcoming-workshops')}>
                {previewCopy[locale].schedule}{' '}
                <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
              </a>
            </div>
          </aside>
        ) : null}
      </div>
      {!archive && upcoming.length > 0 ? (
        <>
          <h3 className={styles.groupTitle}>{copy.upcoming}</h3>
          <ul className={styles.upcoming}>
            {upcoming.slice(0, 3).map((event) => {
              const date = event.date ? parts(event.date, locale) : null;
              const second = event.secondDate
                ? parts(event.secondDate, locale)
                : null;
              const statusLabel =
                event.status === 'waitlist'
                  ? copy.waitlist
                  : event.status === 'dateTbc'
                    ? copy.dateTbc
                    : event.status === 'inProgress'
                      ? copy.inProgress
                      : null;
              return (
                <li
                  key={event.id}
                  className={styles.card}
                  data-kind={event.kind}
                  data-cover={event.cover ? true : undefined}
                >
                  {event.cover ? (
                    <span className={styles.cover} aria-hidden="true">
                      <Image
                        src={event.cover}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                    </span>
                  ) : null}
                  <div className={styles.dateBadge} aria-hidden="true">
                    {second && event.status === 'inProgress' ? (
                      <>
                        <strong>{second.day}</strong>
                        <span>{second.month}</span>
                      </>
                    ) : date ? (
                      <>
                        <strong>{date.day}</strong>
                        <span>{date.month}</span>
                      </>
                    ) : (
                      <strong>…</strong>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.tags}>
                      <span data-free={event.free || undefined}>
                        {event.free ? copy.free : copy.paid}
                      </span>
                      <span>{copy.online}</span>
                      {statusLabel ? <span>{statusLabel}</span> : null}
                    </p>
                    <h4 dir="auto">{event.title[locale]}</h4>
                    <p className={styles.meta}>
                      {date && event.status !== 'inProgress' ? (
                        <time dateTime={event.date!}>{date.full}</time>
                      ) : null}
                      {second && event.status === 'inProgress' ? (
                        <span>
                          {copy.session2} ·{' '}
                          <time dateTime={event.secondDate}>{second.full}</time>
                        </span>
                      ) : null}
                      <span>{event.audience[locale]}</span>
                      <span>
                        {copy.with} {presenterNames(event, locale)}
                      </span>
                    </p>
                    {event.status !== 'inProgress' ? (
                      <a
                        className={styles.action}
                        href={
                          event.registerHref ?? localizeHref(locale, '/contact')
                        }
                        {...(event.registerHref
                          ? { target: '_blank', rel: 'noopener' }
                          : {})}
                      >
                        {event.status === 'waitlist'
                          ? copy.joinWaitlist
                          : event.registerHref
                            ? copy.register
                            : copy.notify}{' '}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    {event.date && event.status !== 'waitlist' ? (
                      <a
                        className={styles.calendar}
                        href={`/api/events/${event.id}/calendar?lang=${locale}`}
                        download
                      >
                        + {copy.calendar}
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/** The psychology team, shown with initials (no photos are published). */
export function TeamSection({ locale }: { locale: Locale }) {
  const copy = eventsCopy[locale];
  return (
    <section className={styles.team} aria-labelledby="team-title">
      <div className={styles.heading} data-reveal>
        <p className={styles.eyebrow}>{copy.teamEyebrow}</p>
        <h2 id="team-title" data-no-split>
          {copy.teamTitle}
        </h2>
        <p>{copy.teamIntro}</p>
      </div>
      <ul className={styles.teamGrid}>
        {psychologyTeam.map((member, index) => (
          <li
            key={member.id}
            className={styles.member}
            data-lead={index === 0 || undefined}
          >
            <span className={styles.monogram} aria-hidden="true">
              {member.initials}
            </span>
            <strong>{member.name[locale]}</strong>
            <span className={styles.role}>{member.role[locale]}</span>
            <p>{member.note[locale]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
