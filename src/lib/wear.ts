import type { Bike, Part, RidingProfile } from '../types';

const PROFILE_FACTOR: Record<RidingProfile, number> = {
  urban: 0.8,
  mixed: 1.0,
  touring: 1.15,
};

export type WearStatus = 'good' | 'soon' | 'urgent';

export type WearResult = {
  iv: number;
  due: number;
  rem: number;
  pct: number;
  status: WearStatus;
  triggeredBy: 'distance' | 'time';
  remDays?: number; // only set when part.timeIntervalDays applies and lastDate is a real date
};

/**
 * Ported verbatim from MotoCare.dc.html's `wear(p, bike)` (lines 1152-1160) for the
 * distance-based calculation. `status: 'urgent'` covers both OVERDUE (rem <= 0) and URGENT
 * (rem > 0 but pct < 14, or a long-interval part with < 400 km left).
 *
 * Dual-trigger extension (new, user-directed — no prototype equivalent to verify against):
 * when `part.timeIntervalDays` is set (currently oil and tyres — real service guidance
 * publishes a calendar-age limit for both, unlike brake/chain/air which are purely usage-driven)
 * and `part.lastDate` parses as a real date (the `'New from dealer'` sentinel is skipped — no
 * known last-replacement date to measure age from), a parallel time-based pct is computed and
 * whichever of the two pcts is lower wins — the actual "whichever comes first" rule, and drives
 * which one is reported as `triggeredBy`/`pct` for display. `status`, however, is evaluated
 * independently against both triggers every time (distanceUrgent || timeUrgent) — a part can be
 * physically almost-due (e.g. long-interval + <400 km left) even while time is the lower-pct/
 * displayed trigger, and that must still surface as urgent rather than being masked by whichever
 * trigger happened to "win" the pct comparison.
 */
export function wear(part: Part, bike: Bike, profile: RidingProfile, now: Date = new Date()): WearResult {
  const factor = PROFILE_FACTOR[profile];
  const iv = Math.round(part.interval * (part.prof ? factor : 1));
  const due = part.lastOdo + iv;
  const rem = due - bike.odo;
  const pctDistance = Math.max(0, Math.min(100, Math.round((rem / iv) * 100)));

  let pct = pctDistance;
  let triggeredBy: 'distance' | 'time' = 'distance';
  let remDays: number | undefined;

  if (part.timeIntervalDays) {
    const lastDate = new Date(part.lastDate);
    if (!isNaN(lastDate.getTime())) {
      const elapsedDays = Math.round((now.getTime() - lastDate.getTime()) / 86_400_000);
      remDays = part.timeIntervalDays - elapsedDays;
      const pctTime = Math.max(0, Math.min(100, Math.round((remDays / part.timeIntervalDays) * 100)));
      if (pctTime < pct) {
        pct = pctTime;
        triggeredBy = 'time';
      }
    }
  }

  // Absolute urgency conditions, checked regardless of which trigger "wins" the pct comparison
  // above (that comparison only decides what's reported as `triggeredBy`/`pct` for display).
  const distanceUrgent = rem <= 0 || (iv > 2000 && rem < 400);
  const timeUrgent = remDays !== undefined && remDays <= 0;

  let status: WearStatus = 'good';
  if (distanceUrgent || timeUrgent || pct < 14) status = 'urgent';
  else if (pct < 36) status = 'soon';

  return { iv, due, rem, pct, status, triggeredBy, remDays };
}

export function wearStatusLabel(w: { status: WearStatus; rem: number }): string {
  if (w.status === 'urgent') return w.rem <= 0 ? 'OVERDUE' : 'URGENT';
  if (w.status === 'soon') return 'SERVICE SOON';
  return 'GOOD';
}

/** Ported from MotoCare.dc.html lines 1184-1186. `now` forwards to `wear()`'s dual-trigger check. */
export function healthScore(bike: Bike, profile: RidingProfile, now: Date = new Date()): number {
  const pcts = bike.parts.map((p) => wear(p, bike, profile, now).pct);
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

/** Ported verbatim from MotoCare.dc.html line 1186's `scoreSt` ternary. */
export function healthStatus(score: number): WearStatus {
  if (score < 35) return 'urgent';
  if (score < 55) return 'soon';
  return 'good';
}

export type TripEstimate = {
  liters: number;
  cost: number;
  stops: number;
};

/** Ported from MotoCare.dc.html lines 1195-1196. */
export function tripEstimate(km: number, bike: Bike, fuelPrice: number): TripEstimate {
  const liters = km / bike.kmpl;
  const cost = liters * fuelPrice;
  const stops = Math.max(0, Math.ceil(liters / bike.tank) - 1);
  return { liters, cost, stops };
}

/** Ported from MotoCare.dc.html line 1208. */
export function costPerKm(fuelPrice: number, kmpl: number): number {
  return fuelPrice / kmpl;
}

/** Per-fill / live consumption, ported from MotoCare.dc.html lines 1345-1346 and 1411. */
export function consumption(odo: number, prevOdo: number, liters: number): number {
  return (odo - prevOdo) / liters;
}

export function isValidKmpl(n: number): boolean {
  return Number.isFinite(n) && n >= 8 && n <= 120; // sane range for motorcycle km/L, catches bad odo/data-entry errors
}

/** Ported from MotoCare.dc.html's `days(iso)` (line 1148). `now` is injectable for tests. */
export function docCountdown(expiryIso: string, now: Date = new Date()): number {
  return Math.round((new Date(expiryIso).getTime() - now.getTime()) / 86_400_000);
}

const THAI_DATE_FORMATTER = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Buddhist-era Thai date, e.g. "14 เม.ย. 2569". Uses the native Intl API instead of the
 * prototype's manual `year + 543` arithmetic (see project memory: motocare-free-tech-decisions) —
 * dates are stored/passed in as Gregorian ISO strings and only converted here for display.
 */
export function thaiDate(iso: string): string {
  return THAI_DATE_FORMATTER.format(new Date(iso));
}
