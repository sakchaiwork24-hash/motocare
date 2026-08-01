import { useBikes } from '../../state/BikeContext';
import { costPerKm } from '../../lib/wear';
import { useState } from 'react';
import { FuelPriceSheet } from './FuelPriceSheet';

export function StatGrid() {
  const { activeBike, config } = useBikes();
  const [fuelPriceSheetOpen, setFuelPriceSheetOpen] = useState(false);

  if (!activeBike || !config) return null;

  const fuelTotal = activeBike.monthly.reduce((a, m) => a + m.thb, 0);
  const maintTotal = activeBike.services.reduce((a, s) => a + s.cost, 0);

  return (
    <div className="grid grid-cols-2 gap-[14px]">
      <div className="bg-surface border border-border rounded-16 p-3 flex flex-col justify-center">
        <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase mb-1">
          AVG CONSUMPTION
        </div>
        <div className="font-display font-bold text-[20px] tabular-nums text-ink-50">
          {activeBike.kmpl.toFixed(1)} km/L
        </div>
        <div className="font-sans text-[11px] text-ink-400 mt-0.5">
          last 6 fill-ups
        </div>
      </div>

      <button 
        onClick={() => setFuelPriceSheetOpen(true)}
        className="bg-surface border border-border rounded-16 p-3 flex flex-col justify-center text-left cursor-pointer active:opacity-80 transition-opacity"
      >
        <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase mb-1">
          COST PER KM
        </div>
        <div className="font-display font-bold text-[20px] tabular-nums text-ink-50">
          {costPerKm(config.fuelPricePerLitre, activeBike.kmpl).toFixed(2)} ฿/km
        </div>
        <div className="font-sans text-[11px] text-ink-400 mt-0.5">
          gasohol at ฿{config.fuelPricePerLitre}
        </div>
      </button>

      <div className="bg-surface border border-border rounded-16 p-3 flex flex-col justify-center">
        <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase mb-1">
          FUEL · 6 MONTHS
        </div>
        <div className="font-display font-bold text-[20px] tabular-nums text-ink-50">
          ฿{fuelTotal.toLocaleString()}
        </div>
        <div className="font-sans text-[11px] text-ink-400 mt-0.5">
          ≈ ฿{Math.round(fuelTotal / 6).toLocaleString()}/month
        </div>
      </div>

      <div className="bg-surface border border-border rounded-16 p-3 flex flex-col justify-center">
        <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase mb-1">
          MAINTENANCE
        </div>
        <div className="font-display font-bold text-[20px] tabular-nums text-ink-50">
          ฿{maintTotal.toLocaleString()}
        </div>
        <div className="font-sans text-[11px] text-ink-400 mt-0.5">
          {activeBike.services.length} logged services
        </div>
      </div>
      
      <FuelPriceSheet open={fuelPriceSheetOpen} onClose={() => setFuelPriceSheetOpen(false)} />
    </div>
  );
}
