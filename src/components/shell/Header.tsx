import { useState } from 'react';
import { ChevronDown, CircleDot, Droplet } from 'lucide-react';
import { StripeTile } from '../StripeTile';
import { useBikeData, useOverlays } from '../../state/BikeContext';
import { SyncBadge } from './SyncBadge';
import { BilingualLabel } from '../BilingualLabel';

export function Header() {
  const { activeBike } = useBikeData();
  const { openSwitcher } = useOverlays();
  const [specsOpen, setSpecsOpen] = useState(false);

  if (!activeBike) {
    return (
      <header className="sticky top-0 z-10 bg-app border-b border-[rgba(51,65,85,.6)] pt-[env(safe-area-inset-top)]">
        <div className="p-2">
          <button
            onClick={openSwitcher}
            className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-16 border border-border bg-surface px-3 py-2 hover:border-accent transition-colors"
          >
            <BilingualLabel
              en="Add your first bike"
              thai="เพิ่มรถคันแรกของคุณ"
              className="items-center"
              primaryClassName="text-accent"
              secondaryClassName="text-accent"
            />
          </button>
        </div>
      </header>
    );
  }

  const [engineOilSpec, tyrePressureSpec] = activeBike.specs;

  return (
    <header className="sticky top-0 z-10 bg-app border-b border-[rgba(51,65,85,.6)] flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={openSwitcher}
          className="flex-1 min-h-[52px] flex items-center gap-2 rounded-16 border border-border bg-surface px-3 py-2 text-left min-w-0 hover:border-accent transition-colors"
        >
          <StripeTile size={36} radius={11}>
            <span className="font-display font-bold text-[13px] text-accent">
              {activeBike.brand[0]}
            </span>
          </StripeTile>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-[15px] leading-tight text-ink-100 truncate">
                {activeBike.nick}
              </span>
              <ChevronDown size={15} className="text-accent shrink-0" />
            </div>
            <div className="font-sans text-[11px] leading-tight text-ink-400 truncate">
              {activeBike.brand} {activeBike.model}
            </div>
          </div>
        </button>

        <SyncBadge />
      </div>

      <div className="flex items-center gap-2 px-2 pb-2 overflow-x-auto">
        {engineOilSpec && (
          <div className="flex items-center gap-1.5 shrink-0 rounded-9 bg-[rgba(6,182,212,.09)] border border-[rgba(6,182,212,.28)] px-2 py-1.5">
            <Droplet size={13} className="text-accent2-lighter shrink-0" />
            <span className="font-display font-semibold text-[10px] text-accent2-lighter whitespace-nowrap">
              {engineOilSpec[1]}
            </span>
          </div>
        )}
        {tyrePressureSpec && (
          <div className="flex items-center gap-1.5 shrink-0 rounded-9 bg-[rgba(6,182,212,.09)] border border-[rgba(6,182,212,.28)] px-2 py-1.5">
            <CircleDot size={13} className="text-accent2-lighter shrink-0" />
            <span className="font-display font-semibold text-[10px] text-accent2-lighter whitespace-nowrap">
              {tyrePressureSpec[1]}
            </span>
          </div>
        )}

        <button
          onClick={() => setSpecsOpen((v) => !v)}
          className="ml-auto shrink-0 font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 px-2 py-1.5"
        >
          สเปค · SPECS
        </button>
      </div>

      {specsOpen && (
        <div className="mx-2 mb-2 rounded-14 border border-border bg-sunken p-3 grid grid-cols-2 gap-x-4 gap-y-2 animate-mcIn">
          {activeBike.specs.map(([key, value]) => (
            <div key={key}>
              <div className="font-sans text-[9.5px] text-ink-400">{key}</div>
              <div className="font-display font-semibold text-[12px] text-ink-200">{value}</div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
