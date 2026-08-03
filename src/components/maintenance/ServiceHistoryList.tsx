import { useState } from 'react';
import { useBikes } from '../../state/BikeContext';
import { Settings } from 'lucide-react';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';
import { HistoryFilterBar } from '../HistoryFilterBar';
import { filterByDateAndText, type DateRangeOption } from '../../lib/historyFilter';

export function ServiceHistoryList() {
  const { activeBike } = useBikes();
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRangeOption>('all');

  if (!activeBike) return null;

  const filteredServices = filterByDateAndText(activeBike.services, {
    query,
    range,
    dateField: 'date',
    textFields: ['shop', 'what'],
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 mb-1">
        <BilingualLabel en="SERVICE HISTORY" thai="ประวัติการซ่อม" primaryClassName="text-ink-500" secondaryClassName="text-ink-500" />
      </div>

      {activeBike.services.length > 0 && (
        <HistoryFilterBar
          query={query}
          onQueryChange={setQuery}
          range={range}
          onRangeChange={setRange}
          placeholder="ค้นหาอะไหล่หรือร้าน..."
        />
      )}

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        {activeBike.services.length === 0 && (
          <div className="p-4 text-center font-sans text-[13px] text-ink-400">
            ยังไม่มีประวัติการซ่อม
          </div>
        )}
        {activeBike.services.length > 0 && filteredServices.length === 0 && (
          <div className="p-4 text-center font-sans text-[13px] text-ink-400">
            ไม่พบรายการที่ตรงกับตัวกรอง
          </div>
        )}
        {filteredServices.map((s, i) => (
          <div
            key={`${s.odo}-${s.date}`}
            className={`min-h-[56px] flex items-center gap-3 px-3 py-2.5 ${
              i < filteredServices.length - 1 ? 'border-b border-[rgba(51,65,85,.5)]' : ''
            }`}
          >
            <div className="w-[34px] h-[34px] rounded-11 flex items-center justify-center shrink-0 bg-[rgba(255,107,0,.13)] text-accent-light">
              <Settings size={16} />
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="font-sans font-medium text-[14px] text-ink-100 truncate">{s.what}</div>
              <div className="font-sans text-[11px] text-ink-400 truncate">
                {shortDate(s.date)} · {s.shop} · {s.odo.toLocaleString()} km
              </div>
            </div>

            <div className="font-display font-bold text-[14px] text-ink-100 shrink-0">
              {s.cost ? `฿${s.cost.toLocaleString()}` : 'ฟรี'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
