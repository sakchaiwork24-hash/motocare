function toIcsDate(iso: string): string {
  return iso.replace(/-/g, '');
}

/** Builds a minimal valid single-event VCALENDAR for an all-day reminder. */
export function buildReminderIcs({ title, date }: { title: string; date: string }): string {
  const dt = toIcsDate(date);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${dt}-${Math.random().toString(36).slice(2)}@motocare`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MotoCare//Renewal Reminder//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${title}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/** Triggers a browser download of arbitrary text content. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
