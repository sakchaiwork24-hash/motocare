import { useBikes } from '../../state/BikeContext';
import { healthScore, healthStatus } from '../../lib/wear';
import { PROFILE_META } from '../../lib/profiles';
import { Ring } from '../Ring';
import { ProfileChips } from './ProfileChips';
import { useMemo } from 'react';

const HEADLINES: Record<string, string> = {
  good: 'Bike is in good shape',
  soon: 'Service window opening',
  urgent: 'Service needed now',
};

export function Scoreboard() {
  const { activeBike } = useBikes();

  const scoreInfo = useMemo(() => {
    if (!activeBike) return null;
    const score = healthScore(activeBike, activeBike.profile);
    const status = healthStatus(score);
    const colorClass = status === 'good' ? 'text-good' : status === 'soon' ? 'text-soon' : 'text-urgent';
    const headline = HEADLINES[status];
    return { score, status, colorClass, headline };
  }, [activeBike]);

  if (!activeBike || !scoreInfo) return null;

  const note = PROFILE_META[activeBike.profile].note;

  return (
    <div className="bg-surface border border-border rounded-16 p-4 flex flex-col items-center">
      <div className="flex flex-col items-center mb-4 mt-2">
        <Ring pct={scoreInfo.score} colorClass={scoreInfo.colorClass} radius={31} strokeWidth={8} size={74}>
          <div className="flex flex-col items-center mt-1">
            <span className={`font-display font-bold text-[22px] leading-none ${scoreInfo.colorClass}`}>
              {scoreInfo.score}
            </span>
            <span className={`font-display font-semibold text-[8px] tracking-[.1em] mt-0.5 ${scoreInfo.colorClass}`}>
              SCORE
            </span>
          </div>
        </Ring>
      </div>
      <h2 className="font-display font-semibold text-[15px] tracking-wide text-ink-100 uppercase text-center mt-2">
        {scoreInfo.headline}
      </h2>
      <p className="font-sans text-[11px] text-ink-400 text-center mt-1">
        {note}
      </p>
      
      <ProfileChips />
    </div>
  );
}
