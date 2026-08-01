import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { fetchLatestFuelPrice } from '../../lib/fuelPriceSync';
import { updateConfig } from '../../db';
import { shortDate } from '../../lib/format';

export function FuelPriceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config } = useBikes();
  const { showToast } = useToast();

  const [priceInput, setPriceInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (open && config) {
      setPriceInput(config.fuelPricePerLitre.toString());
    }
  }, [open, config]);

  if (!config) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await fetchLatestFuelPrice();
    setIsSyncing(false);

    if (result) {
      setPriceInput(result.pricePerLitre.toString());
      await updateConfig({
        fuelPricePerLitre: result.pricePerLitre,
        fuelPriceSyncedAt: new Date().toISOString(),
      });
      showToast(`Fuel price synced · ฿${result.pricePerLitre}/L (${result.fuelType})`);
    } else {
      showToast("Couldn't sync — enter the price manually");
    }
  };

  const handleSave = async () => {
    const price = parseFloat(priceInput);
    if (!isNaN(price)) {
      await updateConfig({ fuelPricePerLitre: price });
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <h2 className="font-display font-semibold text-[15px] tracking-wide text-ink-100 uppercase">
          FUEL PRICE
        </h2>

        <div className="flex flex-col gap-3.5 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              PRICE PER LITRE (THB)
            </label>
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
            />
          </div>

          <div className="font-sans text-[11px] text-ink-400">
            {config.fuelPriceSyncedAt
              ? `Last synced: ${shortDate(config.fuelPriceSyncedAt)}`
              : "Not synced yet \u2014 using manual price"}
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full min-h-[44px] rounded-12 bg-[rgba(255,107,0,.13)] border border-[rgba(255,107,0,.3)] text-accent-light font-display font-semibold text-[12px] tracking-[.06em] uppercase transition-opacity active:opacity-80 flex items-center justify-center disabled:opacity-50"
          >
            {isSyncing ? 'SYNCING...' : 'SYNC LATEST PRICE'}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          SAVE
        </button>
      </div>
    </Sheet>
  );
}
