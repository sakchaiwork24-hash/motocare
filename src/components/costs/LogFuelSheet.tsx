import { useEffect, useRef, useState } from 'react';
import { useBikes } from '../../state/BikeContext';
import { Sheet } from '../Sheet';
import { recordFuelLog } from '../../db';
import { useToast } from '../../state/ToastContext';
import { scanFuelReceipt } from '../../lib/ocr';
import { consumption } from '../../lib/wear';
import { ScanLine } from 'lucide-react';
import { BilingualLabel } from '../BilingualLabel';

export function LogFuelSheet() {
  const { activeBike, logFuelSheet, closeLogFuelSheet } = useBikes();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'matched'>('idle');
  
  const [litersInput, setLitersInput] = useState('');
  const [thbInput, setThbInput] = useState('');
  const [odoInput, setOdoInput] = useState('');
  const [stationInput, setStationInput] = useState('');

  useEffect(() => {
    if (logFuelSheet.open) {
      setOdoInput(activeBike ? activeBike.odo.toString() : '');
      setLitersInput('');
      setThbInput('');
      setStationInput('');
      setScanState('idle');
    }
  }, [logFuelSheet.open, activeBike]);

  if (!activeBike) return null;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setScanState('scanning');
    try {
      const res = await scanFuelReceipt(file);
      if (res.liters) setLitersInput(res.liters.toString());
      if (res.thb) setThbInput(res.thb.toString());
      if (res.odo && res.odo > activeBike.odo) setOdoInput(res.odo.toString());
      if (res.station) setStationInput(res.station);
      
      setScanState('matched');
    } catch (err) {
      showToast('อ่านใบเสร็จไม่ได้ — กรอกเองแทน');
      setScanState('idle');
    }
  };

  const handleSave = async () => {
    const liters = parseFloat(litersInput);
    const thb = parseFloat(thbInput);
    const odo = parseInt(odoInput, 10);
    const station = stationInput || 'ไม่ระบุปั๊ม';

    if (isNaN(liters) || isNaN(thb) || isNaN(odo)) {
      showToast('กรอกจำนวนลิตร ยอดเงิน และเลขไมล์ก่อน');
      return;
    }
    if (liters <= 0 || thb < 0 || odo < 0) {
      showToast('จำนวนลิตรต้องมากกว่า 0 และยอดเงิน/เลขไมล์ต้องไม่ติดลบ');
      return;
    }

    const hasPriorLog = activeBike.fuelLogs.length > 0;
    const prevOdo = activeBike.fuelLogs[0]?.odo ?? odo;
    const kmpl = hasPriorLog && odo > prevOdo
      ? Number(consumption(odo, prevOdo, liters).toFixed(1))
      : activeBike.kmpl;

    try {
      await recordFuelLog(activeBike.id, { liters, thb, odo, station });
    } catch (err) {
      console.error('recordFuelLog failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    closeLogFuelSheet();
    showToast(`บันทึกน้ำมันแล้ว · เลขไมล์ ${odo.toLocaleString()} กม. · ${kmpl} km/L`);
  };

  // Live consumption calculation
  const currentOdo = parseInt(odoInput, 10) || 0;
  const currentLiters = parseFloat(litersInput) || 0;
  const hasPriorFuelLog = activeBike.fuelLogs.length > 0;
  const prevOdo = activeBike.fuelLogs[0]?.odo ?? currentOdo;
  let consStr = '—';
  let consColor = 'text-ink-400';

  if (hasPriorFuelLog && currentOdo > prevOdo && currentLiters > 0) {
    const cons = consumption(currentOdo, prevOdo, currentLiters);
    consStr = cons.toFixed(1) + ' km/L';
    consColor = cons >= activeBike.kmpl ? 'text-good' : 'text-soon';
  }

  let scanStyles = 'border-border text-ink-400';
  let titleText = 'ยังไม่ได้สแกนใบเสร็จ';
  let subText = 'หรือกรอกตัวเลขด้านล่างเอง';
  if (scanState === 'scanning') {
    scanStyles = 'border-[rgba(255,107,0,.6)] text-accent';
    titleText = 'กำลังอ่านใบเสร็จ...';
    subText = 'ocr · thai + latin';
  } else if (scanState === 'matched') {
    scanStyles = 'border-[rgba(16,185,129,.5)] text-good';
    titleText = 'อ่านใบเสร็จสำเร็จ';
    subText = 'OCR · กรอกให้อัตโนมัติแล้ว';
  }

  return (
    <Sheet open={logFuelSheet.open} onClose={closeLogFuelSheet}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="LOG FUEL" thai="เติมน้ำมัน" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        <div className={`relative h-[120px] rounded-16 border-2 border-dashed flex flex-col items-center justify-center gap-2 overflow-hidden bg-sunken transition-colors ${scanStyles}`}>
          {scanState === 'scanning' && (
            <div className="absolute w-full h-[2px] bg-accent shadow-[0_0_8px_rgba(255,107,0,0.8)] animate-mcScan left-0" />
          )}
          <ScanLine size={24} className="opacity-80" />
          <div className="flex flex-col items-center">
            <span className="font-display font-bold text-[13px] tracking-widest uppercase">
              {titleText}
            </span>
            <span className="font-sans text-[11px] opacity-80 mt-0.5">
              {subText}
            </span>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[44px] rounded-12 bg-[rgba(255,107,0,.13)] border border-[rgba(255,107,0,.3)] text-accent-light font-display font-semibold text-[12px] tracking-[.06em] uppercase transition-opacity active:opacity-80 flex items-center justify-center gap-2"
        >
          <ScanLine size={16} />
          สแกนใบเสร็จปั๊ม · OCR
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />

        <div className="flex flex-col gap-3.5 mt-2">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                จำนวนลิตร
              </label>
              <input
                type="number"
                step="0.01"
                value={litersInput}
                onChange={e => setLitersInput(e.target.value)}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ยอดเงิน (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={thbInput}
                onChange={e => setThbInput(e.target.value)}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                เลขไมล์ (กม.)
              </label>
              <input
                type="number"
                value={odoInput}
                onChange={e => setOdoInput(e.target.value)}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5 justify-center">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                อัตราสิ้นเปลือง
              </label>
              <div className={`font-display font-bold text-[16px] ${consColor}`}>
                {consStr}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              ปั๊มน้ำมัน (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={stationInput}
              onChange={e => setStationInput(e.target.value)}
              placeholder="เช่น ปตท, เชลล์"
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          บันทึกรายการ · SAVE
        </button>

        <div className="text-center font-sans text-[10px] text-ink-500 mt-1 mb-2">
          บันทึกในเครื่องนี้เท่านั้น ไม่มีคลาวด์แบ็คอัพ · keep this browser/phone as your record
        </div>
      </div>
    </Sheet>
  );
}
