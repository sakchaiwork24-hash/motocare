import { useOverlays } from '../../state/BikeContext';
import { wearStatusLabel } from '../../lib/wear';
import { partLastDate } from '../../lib/format';
import { Bar } from '../Bar';
import { PART_ICON_MAP } from '../../lib/icons';
import type { Part, RidingProfile, Bike } from '../../types';
import { wear, WearResult } from '../../lib/wear';
import { Package, Settings2 } from 'lucide-react';
import { PROFILE_META } from '../../lib/profiles';

type WearCardProps = {
  part: Part;
  bike: Bike;
  profile: RidingProfile;
  onEditSchedule: (part: Part) => void;
};

export function WearCard({ part, bike, profile, onEditSchedule }: WearCardProps) {
  const { openServiceSheet } = useOverlays();
  const w: WearResult = wear(part, bike, profile);
  
  const Icon = PART_ICON_MAP[part.icon] || Package;
  
  let badgeClasses = '';
  let colorClass = '';
  
  if (w.status === 'urgent') {
    badgeClasses = 'bg-[rgba(244,63,94,.12)] border-[rgba(244,63,94,.3)] text-[#F43F5E]';
    colorClass = 'text-urgent';
  } else if (w.status === 'soon') {
    badgeClasses = 'bg-[rgba(245,158,11,.12)] border-[rgba(245,158,11,.3)] text-[#F59E0B]';
    colorClass = 'text-soon';
  } else {
    badgeClasses = 'bg-[rgba(16,185,129,.10)] border-[rgba(16,185,129,.3)] text-[#10B981]';
    colorClass = 'text-good';
  }

  const label = wearStatusLabel(w);
  const isTimeTriggered = w.triggeredBy === 'time' && w.remDays !== undefined;

  // Verified from MotoCare.dc.html line 1299: "km remaining · urban profile" / "km past due · ...".
  // Dual-trigger extension (new): when the calendar-age trigger is the binding one, the
  // riding-profile factor isn't meaningful, so show days + "age-based" instead.
  const displayRem = isTimeTriggered
    ? Math.abs(w.remDays!)
    : w.rem <= 0 ? -w.rem : w.rem;
  const remLabel = isTimeTriggered
    ? (w.remDays! <= 0 ? 'วันเกินกำหนด · ตามอายุ' : 'วันคงเหลือ · ตามอายุ')
    : (w.rem <= 0 ? 'กม.เกินกำหนด · ' : 'กม.คงเหลือ · ') + PROFILE_META[profile].thai;

  const intervalSuffix = part.timeIntervalDays
    ? `ทุก ${w.iv.toLocaleString()} กม. หรือ ${part.timeIntervalDays} วัน`
    : `ทุก ${w.iv.toLocaleString()} กม.`;
  const lastLine = `ล่าสุด: ${partLastDate(part.lastDate)}${part.lastOdo ? ' @ ' + part.lastOdo.toLocaleString() + ' กม.' : ''} · ${intervalSuffix}`;

  return (
    <div className="bg-surface border border-border rounded-16 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-12 bg-sunken border border-border flex items-center justify-center text-ink-200">
            <Icon size={20} />
          </div>
          <div>
            <div className="font-display font-semibold text-[15px] text-ink-100 uppercase">
              {part.label}
            </div>
            <div className="font-sans text-[11px] text-ink-400">
              {part.thai}
            </div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded border text-[9px] font-display font-semibold tracking-[.06em] uppercase ${badgeClasses}`}>
          {label}
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-end gap-1.5">
          <span className={`font-display font-bold text-[32px] leading-none ${colorClass}`}>
            {displayRem.toLocaleString()}
          </span>
          <span className="font-sans text-[11px] text-ink-400 mb-1">
            {remLabel}
          </span>
        </div>
        <Bar pct={w.pct} colorClass={colorClass} />
      </div>

      <div className="font-sans text-[11px] text-ink-400 mt-1">
        {lastLine}
      </div>
      
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => openServiceSheet(part.key)}
          className="flex-1 min-h-[44px] rounded-12 border border-border bg-sunken flex items-center justify-center font-display font-semibold text-[12px] tracking-[.06em] text-ink-100 uppercase transition-colors active:bg-border"
        >
          บันทึกเปลี่ยน · LOG
        </button>
        <button
          onClick={() => onEditSchedule(part)}
          aria-label="Edit schedule"
          className="w-11 min-h-[44px] rounded-12 border border-border bg-sunken flex items-center justify-center text-ink-400 transition-colors active:bg-border"
        >
          <Settings2 size={16} />
        </button>
      </div>
    </div>
  );
}
