import { useBikes } from '../../state/BikeContext';
import { updateBike } from '../../db';
import { PROFILE_META } from '../../lib/profiles';
import type { RidingProfile } from '../../types';

export function ProfileChips() {
  const { activeBike } = useBikes();
  if (!activeBike) return null;

  const selectProfile = (key: RidingProfile) => {
    void updateBike(activeBike.id, { profile: key });
  };

  return (
    <div className="flex gap-2 w-full mt-3">
      {(Object.entries(PROFILE_META) as [RidingProfile, typeof PROFILE_META[RidingProfile]][]).map(([key, meta]) => {
        const isActive = activeBike.profile === key;
        return (
          <button
            key={key}
            onClick={() => selectProfile(key)}
            className={`flex-1 min-h-[44px] rounded-12 border px-2 py-1 flex flex-col justify-center items-center transition-colors ${
              isActive
                ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                : 'bg-sunken border-border text-ink-400'
            }`}
          >
            <div className={`font-display font-bold text-[11px] tracking-[.06em] leading-tight uppercase ${isActive ? 'text-accent-light' : 'text-ink-400'}`}>
              {meta.label}
            </div>
            <div className={`font-sans text-[10px] opacity-80 ${isActive ? 'text-accent-light' : 'text-ink-400'}`}>
              {meta.thai}
            </div>
          </button>
        );
      })}
    </div>
  );
}
