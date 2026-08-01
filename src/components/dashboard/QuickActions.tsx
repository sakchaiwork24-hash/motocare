import { ScanLine, Settings, BarChart3 } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';

type QuickActionsProps = {
  onGoToCosts: () => void;
};

export function QuickActions({ onGoToCosts }: QuickActionsProps) {
  const { openServiceSheet, openLogFuelSheet, triggerTripFlash } = useBikes();

  const handleFuel = () => {
    openLogFuelSheet();
  };

  const handleService = () => {
    openServiceSheet('oil');
  };

  const handleTrip = () => {
    onGoToCosts();
    triggerTripFlash();
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={handleFuel}
        className="min-h-[76px] rounded-16 bg-[rgba(255,107,0,.13)] border border-[rgba(255,107,0,.42)] p-2.5 flex flex-col justify-between text-left active:opacity-70 transition-opacity"
      >
        <ScanLine size={20} className="text-[#FF8A33]" />
        <div>
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-[#FF8A33] uppercase">
            LOG FUEL
          </div>
          <div className="font-sans text-[9.5px] text-[#FF8A33] opacity-80">
            OCR scan
          </div>
        </div>
      </button>

      <button
        onClick={handleService}
        className="min-h-[76px] rounded-16 bg-surface border border-border p-2.5 flex flex-col justify-between text-left active:opacity-70 transition-opacity"
      >
        <Settings size={20} className="text-ink-200" />
        <div>
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-200 uppercase">
            SERVICE
          </div>
          <div className="font-sans text-[9.5px] text-ink-400">
            record job
          </div>
        </div>
      </button>

      <button
        onClick={handleTrip}
        className="min-h-[76px] rounded-16 bg-[rgba(6,182,212,.11)] border border-[rgba(6,182,212,.34)] p-2.5 flex flex-col justify-between text-left active:opacity-70 transition-opacity"
      >
        <BarChart3 size={20} className="text-[#22D3EE]" />
        <div>
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-[#22D3EE] uppercase">
            TRIP CALC
          </div>
          <div className="font-sans text-[9.5px] text-[#22D3EE] opacity-80">
            fuel + cost
          </div>
        </div>
      </button>
    </div>
  );
}
