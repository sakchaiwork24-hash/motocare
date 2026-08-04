import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { StripeTile } from '../StripeTile';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { AddBikeSheet } from './AddBikeSheet';
import { BilingualLabel } from '../BilingualLabel';
import { useBackButtonClose } from '../../hooks/useBackButtonClose';

export function GarageSwitcher() {
  const { bikes, activeId, switchBike, switcherOpen, closeSwitcher } = useBikes();
  const { showToast } = useToast();
  const [addBikeOpen, setAddBikeOpen] = useState(false);

  useBackButtonClose(switcherOpen, closeSwitcher);

  const select = (id: string) => {
    const bike = bikes.find((b) => b.id === id);
    switchBike(id);
    closeSwitcher();
    if (bike) showToast(`เปลี่ยนไปใช้ ${bike.nick} แล้ว · Switched, data reloaded`);
  };

  return (
    <>
      {switcherOpen && (
        <div
          className="absolute inset-0 z-20 bg-[rgba(2,6,15,.66)] animate-mcFade"
          onClick={closeSwitcher}
        >
          <div
            className="animate-mcIn shadow-dropdown absolute left-3.5 right-3.5 rounded-20 border border-border bg-surface p-2.5"
            style={{ top: 120 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-2">
              <BilingualLabel
                en={`MY GARAGE · ${bikes.length} BIKES`}
                thai={`โรงรถของฉัน · ${bikes.length} คัน`}
                primaryClassName="text-ink-400 !text-[9px] tracking-[.14em]"
                secondaryClassName="text-ink-400 !text-[8px]"
              />
            </div>

            {bikes.map((bike) => {
              const isActive = bike.id === activeId;
              return (
                <button
                  key={bike.id}
                  onClick={() => select(bike.id)}
                  className={`w-full min-h-[56px] flex items-center gap-3 rounded-16 border px-2.5 py-2 text-left ${
                    isActive ? 'bg-[rgba(255,107,0,.1)] border-[rgba(255,107,0,.5)]' : 'border-transparent'
                  }`}
                >
                  <StripeTile size={36} radius={11}>
                    <span className="font-display font-bold text-[13px] text-accent">
                      {bike.brand[0]}
                    </span>
                  </StripeTile>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[15px] leading-tight text-ink-100 truncate">
                      {bike.nick}
                    </div>
                    <div className="font-sans text-[11px] text-ink-400 truncate">
                      {bike.brand} {bike.model} · {bike.odo.toLocaleString('en-US')} km
                    </div>
                  </div>
                  {isActive && <Check size={18} className="text-accent shrink-0" />}
                </button>
              );
            })}

            <button
              onClick={() => { closeSwitcher(); setAddBikeOpen(true); }}
              className="w-full min-h-[48px] mt-1 flex items-center justify-center gap-2 rounded-16 border border-dashed border-accent text-accent font-display font-semibold text-[12px] tracking-[.04em]"
            >
              <Plus size={16} />
              เพิ่มรถใหม่ · ADD NEW BIKE
            </button>
          </div>
        </div>
      )}

      <AddBikeSheet open={addBikeOpen} onClose={() => setAddBikeOpen(false)} />
    </>
  );
}
