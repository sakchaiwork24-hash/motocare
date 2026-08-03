import { describe, expect, it } from 'vitest';
import { seedBikes } from '../db/seed';
import { buildWearAlert } from './wearNotify';

const zontes = seedBikes.find((b) => b.id === 'zontes')!;

describe('buildWearAlert', () => {
  it('returns null when no part is urgent', () => {
    expect(buildWearAlert(zontes, zontes.profile)).toBeNull();
  });

  it('returns a title/body listing every urgent part when the odometer pushes parts overdue', () => {
    const overdueBike = { ...zontes, odo: zontes.odo + 20000 };
    const alert = buildWearAlert(overdueBike, overdueBike.profile);

    expect(alert).not.toBeNull();
    expect(alert!.title).toContain(overdueBike.nick);
    expect(alert!.body).toContain('น้ำมันเครื่อง');
    expect(alert!.body).toContain('ใกล้ถึงกำหนดเปลี่ยน');
  });

  it('lists multiple urgent parts comma-separated', () => {
    const overdueBike = { ...zontes, odo: zontes.odo + 20000 };
    const alert = buildWearAlert(overdueBike, overdueBike.profile);

    expect(alert!.body.split(',').length).toBeGreaterThan(1);
  });
});
