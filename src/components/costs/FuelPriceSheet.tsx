import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikeData } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { fetchLatestFuelPrice } from '../../lib/fuelPriceSync';
import { updateConfig } from '../../db';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';

type FuelPriceSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function FuelPriceSheet({ open, onClose }: FuelPriceSheetProps) {
  const { config } = useBikeData();
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
          <FormField label="ราคาต่อลิตร (บาท)" labelEn="PRICE PER LITRE (THB)" type="number" step="0.01" value={priceInput} onChange={setPriceInput} />

          <div className="font-sans text-[11px] text-ink-400">
            {config.fuelPriceSyncedAt
              ? `ซิงก์ล่าสุด: ${shortDate(config.fuelPriceSyncedAt)}`
              : 'ยังไม่เคยซิงก์ — ใช้ราคาที่กรอกเอง'}
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full min-h-[44px] rounded-12 bg-[rgba(255,107,0,.13)] border border-[rgba(255,107,0,.3)] text-accent-light font-display font-semibold text-[12px] tracking-[.06em] uppercase transition-opacity active:opacity-80 flex items-center justify-center disabled:opacity-50"
          >
            {isSyncing ? 'กำลังซิงก์...' : 'ซิงก์ราคาล่าสุด'}
          </button>
        </div>

        <PrimaryButton onClick={handleSave} className="w-full mt-2">
          {'บันทึก · SAVE'}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
