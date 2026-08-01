const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/** English short date, e.g. "19 Jul" — for recent-activity rows (distinct from wear.ts's Buddhist-era thaiDate). */
export function shortDate(iso: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(iso));
}

export function partLastDate(lastDate: string): string {
  if (lastDate === 'New from dealer') return lastDate;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(lastDate));
}
