import { useBikes } from '../../state/BikeContext';
import { Fuel, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';

type ActivityRow = {
  id: string;
  type: 'fuel' | 'service';
  title: string;
  sub: string;
  when: string;
};

export function RecentActivity() {
  const { activeBike } = useBikes();

  // Verified from MotoCare.dc.html lines 1231-1232 and 1290: NOT a global date sort. Only the
  // 2 most recent of each list are considered, then interleaved in a fixed
  // [fuel, service, fuel, service] pattern (both lists are already newest-first in our seed data).
  const activities = useMemo<ActivityRow[]>(() => {
    if (!activeBike) return [];

    const acts: ActivityRow[] = activeBike.services.slice(0, 2).map((s) => ({
      id: `srv-${s.odo}-${s.date}`,
      type: 'service',
      title: s.what,
      sub: `${s.shop} · ${s.odo.toLocaleString()} km`,
      when: shortDate(s.date),
    }));

    const fuelActs: ActivityRow[] = activeBike.fuelLogs.slice(0, 2).map((l) => ({
      id: `fuel-${l.odo}-${l.date}`,
      type: 'fuel',
      title: `${l.liters.toFixed(2)} L · ฿${Math.round(l.thb)}`,
      sub: l.station,
      when: shortDate(l.date),
    }));

    return [fuelActs[0], acts[0], fuelActs[1], acts[1]].filter((a): a is ActivityRow => Boolean(a)).slice(0, 4);
  }, [activeBike]);

  if (!activeBike || activities.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="px-1 mb-1">
        <BilingualLabel en="RECENT ACTIVITY" thai="กิจกรรมล่าสุด" primaryClassName="text-ink-500" secondaryClassName="text-ink-500" />
      </div>

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        {activities.map((act, i) => (
          <div
            key={act.id}
            className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 ${
              i < activities.length - 1 ? 'border-b border-[rgba(51,65,85,.5)]' : ''
            }`}
          >
            <div
              className={`w-[32px] h-[32px] rounded-11 flex items-center justify-center shrink-0 ${
                act.type === 'fuel'
                  ? 'bg-[rgba(6,182,212,.11)] text-accent2-light'
                  : 'bg-[rgba(255,107,0,.13)] text-accent-light'
              }`}
            >
              {act.type === 'fuel' ? <Fuel size={16} /> : <Settings size={16} />}
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="font-sans font-medium text-[13px] text-ink-100 truncate">{act.title}</div>
              <div className="font-sans text-[11px] text-ink-400 truncate">{act.sub}</div>
            </div>

            <div className="font-display font-semibold text-[10px] text-ink-400 shrink-0 text-right">
              {act.when}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
