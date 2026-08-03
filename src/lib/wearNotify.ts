import type { Bike, RidingProfile } from '../types';
import { wear } from './wear';

export type WearAlert = { title: string; body: string };

/** Checks every part (not just HealthGrid's display-only first-4 slice) for urgent wear and
 * builds a notification body listing them, or null if nothing's urgent. */
export function buildWearAlert(bike: Bike, profile: RidingProfile): WearAlert | null {
  const urgentParts = bike.parts.filter((part) => wear(part, bike, profile).status === 'urgent');
  if (urgentParts.length === 0) return null;

  const names = urgentParts.map((p) => p.thai).join(', ');
  return {
    title: `${bike.nick}: ใกล้ถึงกำหนดเปลี่ยน`,
    body: `${names} ใกล้ถึงกำหนดเปลี่ยนแล้ว`,
  };
}
