import { localizeHref, type Locale } from '@luminol/localization';
import { ButtonLink } from '@luminol/ui';

import { type PlannedWorkshop } from '../../lib/workshop-plan';
import styles from './page.module.css';

const copy = {
  en: {
    title: 'Upcoming workshops',
    lead: 'Proposed weekly programme · December 2026 to March 2027',
    notice:
      'Dates and formats are provisional. The academy will confirm each workshop separately. The 13 March date is subject to the Eid announcement.',
    ask: 'Ask about a workshop',
    blida: 'In person · Blida',
    zoom: 'Online · Zoom',
    local: 'Algeria time',
  },
  fr: {
    title: 'Ateliers à venir',
    lead: 'Programme hebdomadaire prévisionnel · décembre 2026 à mars 2027',
    notice:
      'Les dates et les formats sont prévisionnels. L’académie confirmera chaque atelier séparément. La date du 13 mars dépend de l’annonce de l’Aïd.',
    ask: 'Se renseigner sur un atelier',
    blida: 'En présentiel · Blida',
    zoom: 'En ligne · Zoom',
    local: 'heure d’Algérie',
  },
  ar: {
    title: 'الورش القادمة',
    lead: 'البرنامج الأسبوعي المقترح · ديسمبر 2026 إلى مارس 2027',
    notice:
      'المواعيد والصيغ أولية. تؤكد الأكاديمية كل ورشة على حدة. يُراجع موعد 13 مارس بعد إعلان تاريخ العيد.',
    ask: 'استفسر عن ورشة',
    blida: 'حضوريًا · البليدة',
    zoom: 'عبر الإنترنت · Zoom',
    local: 'بتوقيت الجزائر',
  },
} as const;

export function WorkshopAgenda({
  locale,
  workshops,
}: {
  locale: Locale;
  workshops: readonly PlannedWorkshop[];
}) {
  const labels = copy[locale];
  const months = new Map<string, PlannedWorkshop[]>();
  for (const entry of workshops) {
    const month = entry.date.slice(0, 7);
    const entries = months.get(month) ?? [];
    entries.push(entry);
    months.set(month, entries);
  }
  if (!months.size) return null;

  const dateLocale = { en: 'en-GB', fr: 'fr-FR', ar: 'ar-DZ' }[locale];
  const monthLabel = new Intl.DateTimeFormat(dateLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const dayLabel = new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  return (
    <section
      id="upcoming-workshops"
      className={styles.agenda}
      aria-labelledby="upcoming-workshops-title"
    >
      <div className={styles.agendaHead}>
        <div>
          <p className={styles.kicker}>{labels.lead}</p>
          <h2 id="upcoming-workshops-title">{labels.title}</h2>
          <p>{labels.notice}</p>
        </div>
        <ButtonLink href={localizeHref(locale, '/contact')}>
          {labels.ask}
        </ButtonLink>
      </div>
      {[...months].map(([month, entries], index) => (
        <details key={month} className={styles.month} open={index === 0}>
          <summary>
            {monthLabel.format(new Date(`${month}-01T12:00:00Z`))}
            <span aria-hidden="true">+</span>
          </summary>
          <ul>
            {entries.map((entry) => (
              <li key={entry.date}>
                <time dateTime={entry.date}>
                  {dayLabel.format(new Date(`${entry.date}T12:00:00Z`))}
                </time>
                <div>
                  <h3>{entry.title[locale]}</h3>
                  <p>{entry.audience[locale]}</p>
                </div>
                <div className={styles.venue}>
                  <span>{labels[entry.venue]}</span>
                  {entry.hours ? (
                    <span>
                      <bdi>{entry.hours}</bdi> · {labels.local}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}
