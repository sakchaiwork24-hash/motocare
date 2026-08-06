import { useState } from 'react';
import { useBikeData, useOverlays } from '../../state/BikeContext';
import { Fuel } from 'lucide-react';
import { shortDate } from '../../lib/format';
import { consumption, isValidKmpl } from '../../lib/wear';
import { BilingualLabel } from '../BilingualLabel';
import { HistoryFilterBar } from '../HistoryFilterBar';
import { filterByDateAndText, type DateRangeOption } from '../../lib/historyFilter';
import { RowActions } from '../RowActions';
import { deleteFuelLog } from '../../db';
import { useToast } from '../../state/ToastContext';
import type { FuelLog } from '../../types';

export function FuelLogList() {
  const { activeBike } = useBikeData();
  const { openLogFuelSheet, openLogFuelSheetForEdit } = useOverlays();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRangeOption>('all');

  if (!activeBike) return null;

  const filteredLogs = filterByDateAndText(activeBike.fuelLogs, {
    query,
    range,
    dateField: 'date',
    textFields: ['station'],
  });

  const handleDelete = async (log: FuelLog) => {
    if (!window.confirm(`ลบรายการเติมน้ำมันที่ ${log.station} ใช่ไหม?`)) return;
    try {
      await deleteFuelLog(activeBike.id, log.id);
      showToast('ลบรายการเติมน้ำมันแล้ว');
    } catch (err) {
      console.error('deleteFuelLog failed', err);
      showToast('ลบไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <BilingualLabel en="FUEL LOG" thai="บันทึกการเติมน้ำมัน" primaryClassName="text-ink-400" secondaryClassName="text-ink-400" />
        <button
          onClick={openLogFuelSheet}
          className="font-display font-bold text-[11px] tracking-[.06em] text-accent uppercase active:opacity-70 transition-opacity"
        >
          + เพิ่มรายการ
        </button>
      </div>

      {activeBike.fuelLogs.length > 0 && (
        <HistoryFilterBar
          query={query}
          onQueryChange={setQuery}
          range={range}
          onRangeChange={setRange}
          placeholder="ค้นหาปั๊มน้ำมัน..."
        />
      )}

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        {activeBike.fuelLogs.length === 0 && (
          <div className="p-4 text-center font-sans text-[13px] text-ink-400">
            ยังไม่มีบันทึกการเติมน้ำมัน
          </div>
        )}
        {activeBike.fuelLogs.length > 0 && filteredLogs.length === 0 && (
          <div className="p-4 text-center font-sans text-[13px] text-ink-400">
            ไม่พบรายการที่ตรงกับตัวกรอง
          </div>
        )}
        {filteredLogs.map((log, i) => {
          const originalIndex = activeBike.fuelLogs.indexOf(log);
          const isOldest = originalIndex === activeBike.fuelLogs.length - 1;
          const prevOdo = !isOldest ? activeBike.fuelLogs[originalIndex + 1].odo : 0;
          let consStr = '—';
          let isGood = false;
          if (!isOldest) {
            const cons = consumption(log.odo, prevOdo, log.liters);
            if (isValidKmpl(cons)) {
              consStr = cons.toFixed(1) + ' km/L';
              isGood = cons >= activeBike.kmpl;
            }
          }

          return (
            <div
              key={log.id}
              className={`min-h-[56px] flex items-center gap-2 px-3 py-2.5 ${
                i < filteredLogs.length - 1 ? 'border-b border-[rgba(51,65,85,.5)]' : ''
              }`}
            >
              <div className="w-[34px] h-[34px] rounded-11 flex items-center justify-center shrink-0 bg-[rgba(255,107,0,.13)] text-accent-light">
                <Fuel size={16} />
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="font-sans font-medium text-[14px] text-ink-100 truncate">
                  {log.station}
                </div>
                <div className="font-sans text-[11px] text-ink-400 truncate">
                  {shortDate(log.date)} · {log.liters.toFixed(2)} L · {log.odo.toLocaleString()} km
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <div className="font-display font-bold text-[14px] text-ink-100">
                  ฿{Math.round(log.thb).toLocaleString()}
                </div>
                <div className={`font-sans text-[10px] ${isGood ? 'text-good' : 'text-ink-400'}`}>
                  {consStr}
                </div>
              </div>

              <RowActions onEdit={() => openLogFuelSheetForEdit(log)} onDelete={() => handleDelete(log)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
