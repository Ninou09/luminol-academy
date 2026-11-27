import { z } from 'zod';

import {
  algeriaDay,
  hasEventEnded,
  luminolEvents,
  type LuminolEvent,
} from './events';
import { getSanityConfig } from './sanity';
import { getUpcomingWorkshops } from './workshop-plan';

const title = z.string().trim().min(3).max(160);
const eventSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(96),
  title: z.object({ en: title, fr: title, ar: title }),
  date: z.iso.date(),
  venue: z.enum(['blida', 'zoom']),
  endsAt: z.iso.datetime({ offset: true }).nullish(),
});
type PublishedEvent = Pick<
  LuminolEvent,
  | 'id'
  | 'title'
  | 'date'
  | 'secondDate'
  | 'endsAt'
  | 'pageHref'
  | 'recording'
  | 'registerHref'
  | 'presenters'
> & { venue?: 'blida' | 'zoom' };

async function getPublishedEvents(): Promise<PublishedEvent[]> {
  const config = getSanityConfig();
  if (!config) return [];
  const query =
    '*[_type == "academyEvent" && active == true && !(_id in path("drafts.**"))] | order(date asc) { "id": slug.current, title, date, venue, endsAt }';
  const url = new URL(
    `https://${config.projectId}.api.sanity.io/v2024-01-01/data/query/${config.dataset}`,
  );
  url.searchParams.set('query', query);
  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const payload = z
      .object({ result: z.array(z.unknown()) })
      .safeParse(await response.json());
    if (!payload.success) return [];
    return payload.data.result.flatMap((entry) => {
      const event = eventSchema.safeParse(entry);
      if (!event.success) return [];
      const { endsAt, ...data } = event.data;
      if (
        endsAt &&
        Date.parse(endsAt) < Date.parse(`${data.date}T00:00:00+01:00`)
      )
        return [];
      return [{ ...data, ...(endsAt ? { endsAt } : {}), presenters: [] }];
    });
  } catch {
    return [];
  }
}

function endTime(event: PublishedEvent) {
  return Date.parse(
    event.endsAt ?? `${event.secondDate ?? event.date}T23:59:59.999+01:00`,
  );
}

export async function getEventSchedule(now = new Date()) {
  const published = await getPublishedEvents();
  const events = new Map<string, PublishedEvent>(
    luminolEvents.map((event) => [event.id, event]),
  );
  for (const event of published) events.set(event.id, event);
  return selectEventSchedule([...events.values()], now);
}

export function selectEventSchedule(
  events: readonly PublishedEvent[],
  now: Date,
) {
  const today = algeriaDay.format(now);
  const recent = events
    .filter((event) => hasEventEnded(event, now))
    .sort((a, b) => endTime(b) - endTime(a));
  const confirmed = events
    .filter((event) => event.date && !hasEventEnded(event, now))
    .map((event) => ({
      ...event,
      nextDate: event.date! < today ? (event.secondDate ?? today) : event.date!,
    }))
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const proposed = getUpcomingWorkshops(now)[0];
  const nextConfirmed = confirmed[0];
  const next =
    nextConfirmed && (!proposed || nextConfirmed.nextDate <= proposed.date)
      ? {
          date: nextConfirmed.nextDate,
          title: nextConfirmed.title,
          venue: nextConfirmed.venue ?? 'zoom',
          id: nextConfirmed.id,
        }
      : proposed
        ? {
            date: proposed.date,
            title: proposed.title,
            venue: proposed.venue,
            id: null,
          }
        : null;
  const daysUntil = next
    ? (Date.parse(next.date) - Date.parse(today)) / 86_400_000
    : null;
  return { recent, confirmed, next, daysUntil };
}
