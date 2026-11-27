import { hasEventEnded } from '../../../../../lib/events';
import {
  getPublicEvents,
  isEventScheduled,
} from '../../../../../lib/public-events';

const copy = {
  en: {
    reminder: 'Time to be confirmed. Date shown in Algeria time.',
    blida: 'Blida',
    zoom: 'Online (Zoom)',
  },
  fr: {
    reminder: 'Horaire à confirmer. Date indiquée à l’heure d’Algérie.',
    blida: 'Blida',
    zoom: 'En ligne (Zoom)',
  },
  ar: {
    reminder: 'الوقت قيد التأكيد. التاريخ بتوقيت الجزائر.',
    blida: 'البليدة',
    zoom: 'عبر الإنترنت (Zoom)',
  },
} as const;

/**
 * "Add to calendar" for a Luminol event: a small iCalendar file. Events with
 * no confirmed time are added as all-day reminders on their date.
 */
function escapeText(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replace(/\r\n|[\r\n]/g, '\\n');
}

function compactDate(iso: string) {
  return iso.replaceAll('-', '');
}

function nextDay(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const event = (await getPublicEvents()).find((item) => item.id === id);
  if (!event || !event.date) {
    return new Response('Not found', { status: 404 });
  }
  if (!isEventScheduled(event) || hasEventEnded(event)) {
    return new Response(null, {
      status: 410,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get('lang');
  const lang = locale === 'fr' || locale === 'ar' ? locale : 'en';
  const now = new Date();
  const day = event.date;
  const utcStamp = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const dates = event.startsAt
    ? [
        `DTSTART:${utcStamp(event.startsAt)}`,
        ...(event.endsAt ? [`DTEND:${utcStamp(event.endsAt)}`] : []),
      ]
    : [
        `DTSTART;VALUE=DATE:${compactDate(day)}`,
        `DTEND;VALUE=DATE:${compactDate(nextDay(event.secondDate ?? day))}`,
      ];
  const labels = copy[lang];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luminol Academy//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@luminol-academy`,
    `DTSTAMP:${utcStamp(now.toISOString())}`,
    ...dates,
    `SUMMARY:${escapeText(`Luminol · ${event.title[lang]}`)}`,
    ...(!event.startsAt ? [`DESCRIPTION:${escapeText(labels.reminder)}`] : []),
    `LOCATION:${escapeText(labels[event.venue ?? 'zoom'])}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="luminol-${event.id}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
