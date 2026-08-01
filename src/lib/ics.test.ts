import { describe, expect, it } from 'vitest';
import { buildReminderIcs } from './ics';

describe('buildReminderIcs', () => {
  it('produces a valid single-event VCALENDAR block', () => {
    const ics = buildReminderIcs({ title: 'Renew Road Tax', date: '2026-08-22' });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Renew Road Tax');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260822');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
