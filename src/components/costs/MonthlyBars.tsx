import { useBikeData } from '../../state/BikeContext';
import { useZeroToTarget } from '../../hooks/useZeroToTarget';
import { computeMonthlySpend } from '../../lib/wear';
import type { MonthlySpend } from '../../types';
import { SectionLabel } from '../SectionLabel';

type MonthlyBarProps = {
  month: MonthlySpend;
  targetHeight: number;
  isLatest: boolean;
};

// Split out so useZeroToTarget (a hook) isn't called inside the parent's .map() loop.
function MonthlyBar({ month, targetHeight, isLatest }: MonthlyBarProps) {
  const height = useZeroToTarget(targetHeight);

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="font-sans text-[9px] text-ink-400 mb-2 tabular-nums">
        {month.thb > 0 ? (month.thb / 1000).toFixed(1) + 'k' : '0'}
      </div>
      <div
        className={`w-8 rounded-t-sm ${isLatest ? 'bg-accent' : 'bg-[rgba(6,182,212,.42)]'}`}
        style={{ height: `${Math.max(4, height)}px`, transition: 'height 0.3s ease-out' }}
      />
      <div className="font-display font-semibold text-[10px] text-ink-400 uppercase mt-2">
        {month.m}
      </div>
    </div>
  );
}

export function MonthlyBars() {
  const { activeBike } = useBikeData();

  if (!activeBike || activeBike.fuelLogs.length === 0) return null;

  const monthly = computeMonthlySpend(activeBike.fuelLogs);
  const maxSpend = Math.max(...monthly.map((m) => m.thb));

  return (
    <div className="bg-surface border border-border rounded-16 p-4">
      <SectionLabel size="13" className="mb-4">แนวโน้มค่าใช้จ่าย</SectionLabel>
      <div className="flex justify-between items-end h-[100px] mt-2">
        {monthly.map((m, i) => (
          <MonthlyBar
            key={`${m.y ?? ''}-${m.m}-${i}`}
            month={m}
            targetHeight={maxSpend > 0 ? Math.round((m.thb / maxSpend) * 76) + 8 : 4}
            isLatest={i === monthly.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
