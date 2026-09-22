const calendar = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Luminol Academy//Workshop Calendar//AR',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VTIMEZONE',
  'TZID:Africa/Algiers',
  'X-LIC-LOCATION:Africa/Algiers',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19700101T000000',
  'END:STANDARD',
  'END:VTIMEZONE',
  'BEGIN:VEVENT',
  'UID:family-after-trauma-20260925@luminol.academy',
  'DTSTAMP:20260922T170000Z',
  'DTSTART;TZID=Africa/Algiers:20260925T200000',
  'DTEND;TZID=Africa/Algiers:20260925T220000',
  'SUMMARY:الأسرة بعد الصدمة النفسية: كيف نفهم ونساند؟',
  'DESCRIPTION:لقاء توعوي مجاني من أكاديمية لومينول مع الأستاذة خداوي فطومة.',
  'LOCATION:أونلاين',
  'STATUS:CONFIRMED',
  'TRANSP:OPAQUE',
  'END:VEVENT',
  'END:VCALENDAR',
  '',
].join('\r\n');

export function GET() {
  return new Response(calendar, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Disposition':
        'attachment; filename="luminol-family-after-trauma-2026-09-25.ics"',
      'Content-Type': 'text/calendar; charset=utf-8',
    },
  });
}
