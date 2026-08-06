import { useBikeData } from '../../state/BikeContext';
import { Route } from 'lucide-react';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';
import { RowActions } from '../RowActions';
import { deleteTrip } from '../../db';
import { useToast } from '../../state/ToastContext';
import type { TripLog } from '../../types';

export function TripLogList() {
  const { activeBike } = useBikeData();
  const { showToast } = useToast();

  if (!activeBike) return null;

  const trips = activeBike.trips ?? [];
  if (trips.length === 0) return null;

  const handleDelete = async (trip: TripLog) => {
    if (!window.confirm(`ลบทริป "${trip.label}" ใช่ไหม?`)) return;
    try {
      await deleteTrip(activeBike.id, trip.id);
      showToast('ลบทริปแล้ว');
    } catch (err) {
      console.error('deleteTrip failed', err);
      showToast('ลบไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 mb-1">
        <BilingualLabel en="SAVED TRIPS" thai="ทริปที่บันทึกไว้" primaryClassName="text-ink-400" secondaryClassName="text-ink-400" />
      </div>

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        {trips.map((trip, i) => (
          <div
            key={trip.id}
            className={`min-h-[56px] flex items-center gap-2 px-3 py-2.5 ${
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

            <RowActions onDelete={() => handleDelete(trip)} />
          </div>
        ))}
      </div>
    </div>
  );
}
