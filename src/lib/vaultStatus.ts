import type { WearStatus } from './wear';

/** Ported verbatim from MotoCare.dc.html line 1220. */
export function docStatus(days: number): WearStatus {
  if (days < 30) return 'urgent'; // covers both dd<0 (overdue) and dd<30
  if (days < 75) return 'soon';
  return 'good';
}

/** Ported verbatim from MotoCare.dc.html line 1226. */
export function docDaysLabel(days: number): string {
  return days < 0 ? `${Math.abs(days)}d OVER` : `${days}d LEFT`;
}
