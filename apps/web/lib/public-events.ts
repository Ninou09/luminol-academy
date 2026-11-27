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
  startsAt: z.iso.datetime({ offset: true }).nullish(),
  endsAt: z.iso.datetime({ offset: true }).nullish(),
  scheduleStatus: z.enum(['scheduled', 'cancelled', 'postponed']).nullish(),
  registerHref: z.url({ protocol: /^https$/ }).nullish(),
});
export type PublishedEvent = Pick<
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
> & {
  venue?: 'blida' | 'zoom';
  startsAt?: string;
  scheduleStatus?: 'scheduled' | 'cancelled' | 'postponed';
  audience?: LuminolEvent['audience'];
};

async function getPublishedEvents(): Promise<PublishedEvent[]> {
  const config = getSanityConfig();
  if (!config) return [];
  const query =
    '*[_type == "academyEvent" && active == true && !(_id in path("drafts.**"))] | order(date asc) { "id": slug.current, title, date, venue, startsAt, endsAt, scheduleStatus, registerHref }';
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
      const { startsAt, endsAt, scheduleStatus, registerHref, ...data } =
        event.data;
      if (
        (startsAt && algeriaDay.format(new Date(startsAt)) !== data.date) ||
        (endsAt &&
          Date.parse(endsAt) < Date.parse(`${data.date}T00:00:00+01:00`)) ||
        (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))
      )
        return [];
      return [
        {
          ...data,
          ...(startsAt ? { startsAt } : {}),
          ...(endsAt ? { endsAt } : {}),
          ...(scheduleStatus ? { scheduleStatus } : {}),
          ...(registerHref ? { registerHref } : {}),
          presenters: [],
        },
      ];
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

export async function getPublicEvents() {
  const published = await getPublishedEvents();
  const events = new Map<string, PublishedEvent>(
    luminolEvents.map((event) => [event.id, event]),
  );
  for (const event of published) {
    const existing = events.get(event.id);
    events.set(event.id, {
      ...event,
      presenters: existing?.presenters ?? event.presenters,
      ...(existing?.audience ? { audience: existing.audience } : {}),
      ...(existing?.pageHref ? { pageHref: existing.pageHref } : {}),
      ...(existing?.recording ? { recording: true } : {}),
    });
  }
  return [...events.values()];
}

export async function getEventSchedule(now = new Date()) {
  return selectEventSchedule(await getPublicEvents(), now);
}

export function isEventScheduled(event: PublishedEvent) {
  return (
    event.scheduleStatus !== 'cancelled' && event.scheduleStatus !== 'postponed'
  );
}

export function selectEventSchedule(
  events: readonly PublishedEvent[],
  now: Date,
) {
  const today = algeriaDay.format(now);
  const updates = events
    .filter((event) => !isEventScheduled(event))
    .sort((a, b) => endTime(b) - endTime(a));
  const scheduled = events.filter(isEventScheduled);
  const recent = scheduled
    .filter((event) => hasEventEnded(event, now))
    .sort((a, b) => endTime(b) - endTime(a));
  const confirmed = scheduled
    .filter((event) => event.date && !hasEventEnded(event, now))
    .map((event) => ({
      ...event,
      nextDate: event.date! < today ? (event.secondDate ?? today) : event.date!,
    }))
    .sort(
      (a, b) =>
        a.nextDate.localeCompare(b.nextDate) ||
        (a.startsAt ? Date.parse(a.startsAt) : Infinity) -
          (b.startsAt ? Date.parse(b.startsAt) : Infinity) ||
        a.id.localeCompare(b.id),
    );
  const proposed = getUpcomingWorkshops(now)[0];
  const nextConfirmed = confirmed[0];
  const next =
    nextConfirmed && (!proposed || nextConfirmed.nextDate <= proposed.date)
      ? {
          date: nextConfirmed.nextDate,
          title: nextConfirmed.title,
          venue: nextConfirmed.venue ?? 'zoom',
          id: nextConfirmed.id,
          startsAt: nextConfirmed.startsAt,
        }
      : proposed
        ? {
            date: proposed.date,
            title: proposed.title,
            venue: proposed.venue,
            id: null,
            startsAt: undefined,
          }
        : null;
  const daysUntil = next
    ? (Date.parse(next.date) - Date.parse(today)) / 86_400_000
    : null;
  return { recent, confirmed, updates, next, daysUntil };
}
