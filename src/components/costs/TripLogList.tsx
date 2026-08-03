import { useBikes } from '../../state/BikeContext';
import { Route } from 'lucide-react';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';

export function TripLogList() {
  const { activeBike } = useBikes();

  if (!activeBike) return null;

  const trips = activeBike.trips ?? [];
  if (trips.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 mb-1">
        <BilingualLabel en="SAVED TRIPS" thai="ทริปที่บันทึกไว้" primaryClassName="text-ink-500" secondaryClassName="text-ink-500" />
      </div>

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        {trips.map((trip, i) => (
          <div
            key={`${trip.date}-${trip.km}-${i}`}
            className={`min-h-[56px] flex items-center gap-3 px-3 py-2.5 ${
              i < trips.length - 1 ? 'border-b border-[rgba(51,65,85,.5)]' : ''
            }`}
          >
            <div className="w-[34px] h-[34px] rounded-11 flex items-center justify-center shrink-0 bg-[rgba(6,182,212,.11)] text-accent2-light">
              <Route size={16} />
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="font-sans font-medium text-[14px] text-ink-100 truncate">
                {trip.label} · {trip.km.toLocaleString()} km
              </div>
              <div className="font-sans text-[11px] text-ink-400 truncate">
                {shortDate(trip.date)} · {trip.liters.toFixed(2)} L
              </div>
            </div>

            <div className="font-display font-bold text-[14px] text-ink-100 shrink-0">
              ฿{Math.round(trip.cost).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
