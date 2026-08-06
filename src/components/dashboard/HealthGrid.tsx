import { useBikeData } from '../../state/BikeContext';
import { wear } from '../../lib/wear';
import { Ring } from '../Ring';
import { Package } from 'lucide-react';
import { useMemo } from 'react';
import { PART_ICON_MAP } from '../../lib/icons';
import { BilingualLabel } from '../BilingualLabel';

type HealthGridProps = {
  onGoToService: () => void;
};

export function HealthGrid({ onGoToService }: HealthGridProps) {
  const { activeBike } = useBikeData();

  // Verified from MotoCare.dc.html line 1281 (`rings: wear.slice(0, 4)`): the dashboard grid
  // always shows the first 4 parts in array order (oil, brake, chain, tyre) and always excludes
  // the 5th (air filter), regardless of urgency — not a bug, matches the real prototype exactly.
  // The full 5-part list lives on the SERVICE tab (Phase 4).
  const parts = useMemo(() => {
    if (!activeBike) return [];
    return activeBike.parts.slice(0, 4).map((part) => ({
      part,
      wear: wear(part, activeBike, activeBike.profile),
    }));
  }, [activeBike]);

  if (!activeBike) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end px-1">
        <BilingualLabel en="BIKE HEALTH" thai="สุขภาพรถ" primaryClassName="text-ink-400" secondaryClassName="text-ink-400" />
        <button
          onClick={onGoToService}
          className="font-display font-semibold text-[13px] tracking-[.06em] text-accent2-light uppercase flex items-center gap-1"
        >
          รายละเอียด ›
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {parts.map(({ part, wear: w }) => {
          const Icon = PART_ICON_MAP[part.icon] || Package;
          const colorClass = w.status === 'good' ? 'text-good' : w.status === 'soon' ? 'text-soon' : 'text-urgent';
          
          return (
            <div key={part.key} className="bg-surface border border-border rounded-18 p-3 flex flex-col gap-3 min-h-[44px]">
              <div className="flex items-start justify-between">
                <Ring pct={w.pct} colorClass={colorClass}>
                  <Icon size={24} />
                </Ring>
              </div>
              <div className="flex flex-col">
                <div className="font-sans font-medium text-[13px] text-ink-100 truncate">
                  {part.label}
                </div>
                <div className={`font-display font-bold text-[15px] ${colorClass} mt-1 leading-none`}>
                  {w.pct}%
                </div>
                <div className="font-sans text-[11px] text-ink-400 mt-1">
                  {w.triggeredBy === 'time' && w.remDays !== undefined
                    ? (w.remDays <= 0 ? `เกินกำหนด ${Math.abs(w.remDays)} วัน` : `เหลือ ${w.remDays} วัน`)
                    : (w.rem < 0 ? `เกินกำหนด ${Math.abs(w.rem).toLocaleString()} กม.` : `เหลือ ${w.rem.toLocaleString()} กม.`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
