import { localizeHref, type Locale } from '@luminol/localization';
import Image from 'next/image';

import { editorialPhotos, illustrativePhotoCredit } from '../lib/people-photos';
import { channelCopy, getWhatsAppHref } from '../lib/contact-channels';
import { eventsCopy, psychologyTeam } from '../lib/events';
import { getEventSchedule } from '../lib/public-events';
import { EventScheduleRefresh } from './event-schedule-refresh';
import styles from './events-section.module.css';

const dateLocale: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  ar: 'ar-DZ',
};

const previewCopy = {
  en: {
    proposed: 'Next proposed workshop',
    confirmed: 'Next scheduled event',
    none: 'A new date will be announced here.',
    calendar: 'All events and workshops',
    schedule: 'See the workshop calendar',
    blida: 'Blida',
    zoom: 'Online · Zoom',
    updates: 'Schedule changes',
    cancelled: 'Cancelled',
    postponed: 'Postponed · new date pending',
    timezone: 'Algeria time',
    noRecent: 'Past events will appear here.',
  },
  fr: {
    proposed: 'Prochain atelier prévisionnel',
    confirmed: 'Prochain événement confirmé',
    none: 'Une nouvelle date sera annoncée ici.',
    calendar: 'Tous les événements et ateliers',
    schedule: 'Voir le calendrier des ateliers',
    blida: 'Blida',
    zoom: 'En ligne · Zoom',
    updates: 'Modifications du calendrier',
    cancelled: 'Annulé',
    postponed: 'Reporté · nouvelle date à confirmer',
    timezone: 'heure d’Algérie',
    noRecent: 'Les événements passés apparaîtront ici.',
  },
  ar: {
    proposed: 'الورشة المقترحة القادمة',
    confirmed: 'الفعالية المؤكدة القادمة',
    none: 'سيُعلَن الموعد الجديد هنا.',
    calendar: 'كل الفعاليات والورش',
    schedule: 'عرض تقويم الورش',
    blida: 'البليدة',
    zoom: 'عبر الإنترنت · Zoom',
    updates: 'تغييرات الجدول',
    cancelled: 'أُلغي',
    postponed: 'مؤجّل · الموعد الجديد قيد التأكيد',
    timezone: 'بتوقيت الجزائر',
    noRecent: 'ستظهر الفعاليات الماضية هنا.',
  },
} as const;

function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(dateLocale[locale], {
    timeZone: 'Africa/Algiers',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00+01:00`));
}

function EventTime({
  startsAt,
  locale,
}: {
  startsAt?: string | undefined;
  locale: Locale;
}) {
  if (!startsAt) return null;
  const time = new Intl.DateTimeFormat(dateLocale[locale], {
    timeZone: 'Africa/Algiers',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(startsAt));
  return (
    <span>
      <time dateTime={startsAt}>
        <bdi>{time}</bdi>
      </time>{' '}
      · {previewCopy[locale].timezone}
    </span>
  );
}

type Schedule = Awaited<ReturnType<typeof getEventSchedule>>;

export async function HomeEvents({ locale }: { locale: Locale }) {
  const { next, recent, daysUntil } = await getEventSchedule();
  const copy = eventsCopy[locale];
  const text = previewCopy[locale];
  const direction = locale === 'ar' ? '←' : '→';
  const calendar = localizeHref(locale, '/events');
  return (
    <section
      id="home-events"
      className={styles.section}
      data-home-events
      aria-labelledby="events-title"
    >
      <EventScheduleRefresh />
      <div className={styles.scheduleHeading}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="events-title" data-no-split>
            {copy.title}
          </h2>
        </div>
        <a className={styles.scheduleLink} href={calendar}>
          {text.calendar} <span aria-hidden="true">{direction}</span>
        </a>
      </div>
      <div className={styles.scheduleGrid}>
        <article
          className={styles.nextEvent}
          data-upcoming-event={
            next
              ? `${next.id ?? 'workshop'}:${next.date}:${next.startsAt ?? ''}`
              : ''
          }
        >
          {next && (
            <div
              className={styles.nextImage}
              data-media-source={illustrativePhotoCredit.source}
              data-media-license={illustrativePhotoCredit.license}
              data-media-crop="center-center"
            >
              <Image
                src={editorialPhotos.homework.src}
                alt=""
                fill
                sizes="(max-width: 560px) 90vw, 260px"
              />
            </div>
          )}
          <div className={styles.nextCopy}>
            <p className={styles.eyebrow}>
              {next
                ? next.id
                  ? text.confirmed
                  : text.proposed
                : copy.upcoming}
            </p>
            {daysUntil !== null && (
              <p className={styles.eventCountdown}>
                {new Intl.RelativeTimeFormat(dateLocale[locale], {
                  numeric: 'auto',
                }).format(daysUntil, 'day')}
              </p>
            )}
            {next ? (
              <>
                <h3 dir="auto">{next.title[locale]}</h3>
                <p data-event-timing>
                  <time dateTime={next.date}>
                    {formatDate(next.date, locale)}
                  </time>{' '}
                  · {text[next.venue]}
                  {next.startsAt && (
                    <>
                      {' '}
                      · <EventTime startsAt={next.startsAt} locale={locale} />
                    </>
                  )}
                </p>
                <a
                  className={styles.scheduleLink}
                  href={`${calendar}#${next.id ? `event-${next.id}` : 'upcoming-workshops'}`}
                >
                  {copy.details} <span aria-hidden="true">{direction}</span>
                </a>
              </>
            ) : (
              <p>{text.none}</p>
            )}
          </div>
        </article>
        {recent.length > 0 && (
          <div className={styles.latestEvents}>
            <h3>{copy.past}</h3>
            <ol>
              {recent.slice(0, 2).map((event) => {
                const date = event.secondDate ?? event.date!;
                const href = event.pageHref
                  ? localizeHref(locale, event.pageHref)
                  : `${calendar}#event-${event.id}`;
                return (
                  <li key={event.id}>
                    <time dateTime={date}>{formatDate(date, locale)}</time>
                    <a href={href} dir="auto">
                      {event.title[locale]}{' '}
                      <span aria-hidden="true">{direction}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

export function EventsSection({
  locale,
  schedule,
}: {
  locale: Locale;
  schedule: Schedule;
}) {
  const { confirmed, recent, updates } = schedule;
  const text = previewCopy[locale];
  const copy = eventsCopy[locale];
  const askHref =
    getWhatsAppHref(channelCopy[locale].whatsappMessage) ??
    localizeHref(locale, '/contact');

  return (
    <section
      className={styles.section}
      aria-labelledby="events-recent"
      data-events-archive
    >
      {confirmed.length > 0 && (
        <>
          <h2 className={styles.groupTitle}>{copy.upcoming}</h2>
          <ol className={styles.past}>
            {confirmed.map((event) => (
              <li id={`event-${event.id}`} key={event.id}>
                <time dateTime={event.nextDate}>
                  {formatDate(event.nextDate, locale)}
                </time>
                <div>
                  <strong dir="auto">{event.title[locale]}</strong>
                  <span>{text[event.venue ?? 'zoom']}</span>
                  <EventTime startsAt={event.startsAt} locale={locale} />
                </div>
                <div className={styles.eventActions}>
                  {event.registerHref && (
                    <a
                      href={event.registerHref}
                      data-public-action="Event registration"
                    >
                      {copy.details}
                    </a>
                  )}
                  <a
                    href={`/api/events/${event.id}/calendar?lang=${locale}`}
                    data-public-action="Calendar download"
                  >
                    {copy.calendar}
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
      {updates.length > 0 && (
        <>
          <h2 className={styles.groupTitle}>{text.updates}</h2>
          <ol className={styles.past}>
            {updates.map((event) => (
              <li id={`event-${event.id}`} key={event.id}>
                {event.date && (
                  <time dateTime={event.date}>
                    {formatDate(event.date, locale)}
                  </time>
                )}
                <div>
                  <strong dir="auto">{event.title[locale]}</strong>
                  <span>
                    {event.scheduleStatus === 'cancelled'
                      ? text.cancelled
                      : text.postponed}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
      <h2 id="events-recent" className={styles.groupTitle} data-no-split>
        {copy.past}
      </h2>
      {recent.length === 0 && <p>{text.noRecent}</p>}
      <ol className={styles.past}>
        {recent.map((event) => {
          const date = event.secondDate ?? event.date!;
          const presenters = event.presenters
            .map(
              (id) =>
                psychologyTeam.find((member) => member.id === id)?.name[locale],
            )
            .filter(Boolean)
            .join(' · ');
          return (
            <li id={`event-${event.id}`} key={event.id}>
              <time dateTime={date}>{formatDate(date, locale)}</time>
              <div>
                <strong dir="auto">{event.title[locale]}</strong>
                {presenters && (
                  <span>
                    {copy.with} {presenters}
                  </span>
                )}
              </div>
              {event.pageHref ? (
                <a href={localizeHref(locale, event.pageHref)}>
                  {copy.details}
                </a>
              ) : event.recording ? (
                <a href={askHref} target="_blank" rel="noopener">
                  {copy.recording} · {copy.askRecording}
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>
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
