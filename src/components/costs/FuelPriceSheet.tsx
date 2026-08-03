import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { fetchLatestFuelPrice } from '../../lib/fuelPriceSync';
import { updateConfig } from '../../db';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';

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
      try {
        await updateConfig({
          fuelPricePerLitre: result.pricePerLitre,
          fuelPriceSyncedAt: new Date().toISOString(),
        });
        showToast(`ซิงก์ราคาน้ำมันแล้ว · ฿${result.pricePerLitre}/L (${result.fuelType})`);
      } catch (err) {
        console.error('fuel price sync save failed', err);
        showToast('บันทึกราคาไม่สำเร็จ ลองใหม่อีกครั้ง');
      }
    } else {
      showToast('ซิงก์ไม่สำเร็จ — กรอกราคาเอง');
    }
  };

  const handleSave = async () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      showToast('กรุณากรอกราคาน้ำมันให้ถูกต้อง');
      return;
    }
    try {
      await updateConfig({ fuelPricePerLitre: price });
    } catch (err) {
      console.error('updateConfig failed', err);
      showToast('บันทึกราคาไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="FUEL PRICE" thai="ราคาน้ำมัน" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        <div className="flex flex-col gap-3.5 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              ราคาต่อลิตร (บาท)
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
              ? `\u0e0b\u0e34\u0e07\u0e01\u0e4c\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14: ${shortDate(config.fuelPriceSyncedAt)}`
              : '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e40\u0e04\u0e22\u0e0b\u0e34\u0e07\u0e01\u0e4c \u2014 \u0e43\u0e0a\u0e49\u0e23\u0e32\u0e04\u0e32\u0e17\u0e35\u0e48\u0e01\u0e23\u0e2d\u0e01\u0e40\u0e2d\u0e07'}
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full min-h-[44px] rounded-12 bg-[rgba(255,107,0,.13)] border border-[rgba(255,107,0,.3)] text-accent-light font-display font-semibold text-[12px] tracking-[.06em] uppercase transition-opacity active:opacity-80 flex items-center justify-center disabled:opacity-50"
          >
            {isSyncing ? '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e0b\u0e34\u0e07\u0e01\u0e4c...' : '\u0e0b\u0e34\u0e07\u0e01\u0e4c\u0e23\u0e32\u0e04\u0e32\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14'}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01 \u00b7 SAVE
        </button>
      </div>
    </Sheet>
  );
}
