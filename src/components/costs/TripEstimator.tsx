import { useState } from 'react';
import { useBikeData, useTripFlash } from '../../state/BikeContext';
import { tripEstimate } from '../../lib/wear';
import { recordTrip } from '../../db';
import { useToast } from '../../state/ToastContext';
import { PrimaryButton } from '../PrimaryButton';
import { SectionLabel } from '../SectionLabel';

export function TripEstimator() {
  const { activeBike, config } = useBikeData();
  const { flashTrip } = useTripFlash();
  const { showToast } = useToast();
  const [kmInput, setKmInput] = useState('147');
  const [saving, setSaving] = useState(false);

  if (!activeBike || !config) return null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setKmInput(val);
  };

  const presets = [
    ['พัทยา', 147],
    ['เขาใหญ่', 190],
    ['หัวหิน', 199],
    ['ไป-กลับที่ทำงาน', 34]
  ] as const;

  const km = parseFloat(kmInput) || 0;
  const { liters, cost, stops } = tripEstimate(km, activeBike, config.fuelPricePerLitre);
  const matchedPreset = presets.find(([, k]) => k === km);

  const handleSaveTrip = async () => {
    setSaving(true);
    try {
      await recordTrip(activeBike.id, {
        label: matchedPreset ? matchedPreset[0] : 'กำหนดเอง',
        km,
        liters,
        cost,
      });
      showToast(`บันทึกทริป ${km.toLocaleString()} กม. แล้ว`);
    } catch (err) {
      console.error('recordTrip failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-surface border rounded-16 p-4 transition-colors duration-300 ${flashTrip ? 'border-[#22D3EE]' : 'border-border'}`}>
      <h2 className="font-display font-semibold text-[13px] tracking-[.06em] text-ink-400 uppercase">
        คำนวณค่าใช้จ่ายทริป
      </h2>
      <div className="font-sans text-[11px] text-ink-400 mt-1 mb-4">
        คำนวณจาก {activeBike.nick} · {activeBike.kmpl.toFixed(1)} km/L · แก๊สโซฮอล 95 ฿{config.fuelPricePerLitre}/L
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          inputMode="decimal"
          value={kmInput}
          onChange={handleInput}
          placeholder="0"
          className="flex-1 bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-display font-bold text-[20px] text-ink-100 outline-none focus:border-accent2 tabular-nums"
        />
        <div className="flex items-center font-display font-bold text-[20px] text-ink-400 px-2">
          กม.
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
          <SectionLabel size="9" className="mb-1">น้ำมันที่ต้องใช้</SectionLabel>
          <div className="font-display font-bold text-[16px] text-ink-100">
            {liters.toFixed(2)} L
          </div>
        </div>
        <div className="flex flex-col">
          <SectionLabel size="9" className="mb-1">ค่าใช้จ่ายโดยประมาณ</SectionLabel>
          <div className="font-display font-bold text-[16px] text-accent">
            ฿{Math.round(cost).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col text-right">
          <SectionLabel size="9" className="mb-1">จุดเติมน้ำมัน</SectionLabel>
          <div className="font-display font-bold text-[16px] text-accent2">
            {stops}
          </div>
          <div className="font-sans text-[9px] text-ink-400">
            ถังละ {activeBike.tank}L
          </div>
        </div>
      </div>

      {km > 0 && (
        <div className="font-sans text-[10px] text-ink-400 text-center mb-3">
          ไป-กลับ {Math.round(km * 2).toLocaleString()} กม. ≈ ฿{Math.round(cost * 2).toLocaleString()} · เพิ่มเลขไมล์อีก {Math.round(km * 2).toLocaleString()} กม. ทำให้รอบเปลี่ยนน้ำมันเครื่องครั้งถัดไปใกล้เข้ามาอีก {Math.round(km * 2).toLocaleString()} กม.
        </div>
      )}

      <PrimaryButton onClick={handleSaveTrip} disabled={km <= 0 || saving} tone="accent2" className="w-full">
        บันทึกทริปนี้ · SAVE TRIP
      </PrimaryButton>
    </div>
  );
}
