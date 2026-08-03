import { useBikes } from '../../state/BikeContext';
import { useZeroToTarget } from '../../hooks/useZeroToTarget';
import type { MonthlySpend } from '../../types';

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
      <div className="font-display font-semibold text-[10px] text-ink-500 uppercase mt-2">
        {month.m}
      </div>
    </div>
  );
}

export function MonthlyBars() {
  const { activeBike } = useBikes();

  if (!activeBike || !activeBike.monthly.length) return null;

  const maxSpend = Math.max(...activeBike.monthly.map((m) => m.thb));

  return (
    <div className="bg-surface border border-border rounded-16 p-4">
      <div className="font-display font-semibold text-[13px] tracking-[.06em] text-ink-500 uppercase mb-4">
        แนวโน้มค่าใช้จ่าย
      </div>
      <div className="flex justify-between items-end h-[100px] mt-2">
        {activeBike.monthly.map((m, i) => (
          <MonthlyBar
            key={`${m.y ?? ''}-${m.m}-${i}`}
            month={m}
            targetHeight={maxSpend > 0 ? Math.round((m.thb / maxSpend) * 76) + 8 : 4}
            isLatest={i === activeBike.monthly.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
