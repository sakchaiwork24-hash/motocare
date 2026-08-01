import { useState } from 'react';
import { useBikes } from '../../state/BikeContext';
import { tripEstimate } from '../../lib/wear';

export function TripEstimator() {
  const { activeBike, config, flashTrip } = useBikes();
  const [kmInput, setKmInput] = useState('147');

  if (!activeBike || !config) return null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setKmInput(val);
  };

  const presets = [
    ['Pattaya', 147],
    ['Khao Yai', 190],
    ['Hua Hin', 199],
    ['Commute · daily', 34]
  ] as const;

  const km = parseFloat(kmInput) || 0;
  const { liters, cost, stops } = tripEstimate(km, activeBike, config.fuelPricePerLitre);

  return (
    <div className={`bg-surface border rounded-16 p-4 transition-colors duration-300 ${flashTrip ? 'border-[#22D3EE]' : 'border-border'}`}>
      <h2 className="font-display font-semibold text-[13px] tracking-[.06em] text-ink-500 uppercase">
        TRIP ESTIMATOR
      </h2>
      <div className="font-sans text-[11px] text-ink-400 mt-1 mb-4">
        Based on {activeBike.nick} · {activeBike.kmpl.toFixed(1)} km/L · gasohol 95 at ฿{config.fuelPricePerLitre}/L
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={kmInput}
          onChange={handleInput}
          placeholder="0"
          className="flex-1 bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-display font-bold text-[20px] text-ink-100 outline-none focus:border-accent2 tabular-nums"
        />
        <div className="flex items-center font-display font-bold text-[20px] text-ink-400 px-2">
          KM
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map(([name, k]) => (
          <button
            key={name}
            onClick={() => setKmInput(k.toString())}
            className="px-3 py-1.5 rounded-full bg-sunken border border-border font-sans text-[11px] text-ink-200 hover:border-ink-400 transition-colors"
          >
            {name} · {k} km
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-sunken border border-border rounded-12 p-3 mb-3">
        <div className="flex flex-col">
          <div className="font-display font-semibold text-[9px] tracking-[.06em] text-ink-500 uppercase mb-1">
            FUEL NEEDED
          </div>
          <div className="font-display font-bold text-[16px] text-ink-100">
            {liters.toFixed(2)} L
          </div>
        </div>
        <div className="flex flex-col">
          <div className="font-display font-semibold text-[9px] tracking-[.06em] text-ink-500 uppercase mb-1">
            EST. COST
          </div>
          <div className="font-display font-bold text-[16px] text-accent">
            ฿{Math.round(cost).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col text-right">
          <div className="font-display font-semibold text-[9px] tracking-[.06em] text-ink-500 uppercase mb-1">
            REFUEL STOPS
          </div>
          <div className="font-display font-bold text-[16px] text-accent2">
            {stops}
          </div>
          <div className="font-sans text-[9px] text-ink-400">
            tank {activeBike.tank}L
          </div>
        </div>
      </div>

      {km > 0 && (
        <div className="font-sans text-[10px] text-ink-500 text-center">
          Round trip {Math.round(km * 2).toLocaleString()} km ≈ ฿{Math.round(cost * 2).toLocaleString()} · adds {Math.round(km * 2).toLocaleString()} km to the odometer, pulling the next oil change {Math.round(km * 2).toLocaleString()} km closer.
        </div>
      )}
    </div>
  );
}
