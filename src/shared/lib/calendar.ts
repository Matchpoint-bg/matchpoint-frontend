export interface CalendarEvent {
  /** Stable across regenerations of the same booking, so re-importing updates. */
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}

/** RFC 5545 UTC stamp: `20260902T173000Z`. */
function stamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/** `\`, `;`, `,` and newlines carry meaning in a property value. */
function escape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Content lines are limited to 75 octets; longer ones continue on a line that
 * begins with a space. Split on octets rather than characters — Cyrillic copy
 * is two bytes per letter and would otherwise sail past the limit.
 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    // 74 leaves room for the leading space every continuation line carries.
    if (bytes + size > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = '';
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  if (current) out.push(current);
  return out.map((part, index) => (index === 0 ? part : ` ${part}`)).join('\r\n');
}

/**
 * A one-event iCalendar file. No timezone database needed: everything is
 * written in UTC, which every calendar app renders back in the reader's own
 * zone.
 */
export function buildIcs(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MatchPoint//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escape(event.uid)}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end)}`,
    `SUMMARY:${escape(event.title)}`,
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${escape(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/**
 * Hands the file to the browser. iOS Safari opens it in a preview rather than
 * saving it, which is the behaviour its users expect — the event still imports
 * from there.
 */
export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking straight away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
