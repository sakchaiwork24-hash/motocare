import { useEffect, useRef, useState } from 'react';
import { Sheet } from '../Sheet';
import { recordFuelLog, updateFuelLog } from '../../db';
import { useToast } from '../../state/ToastContext';
import { scanFuelReceipt } from '../../lib/ocr';
import { consumption } from '../../lib/wear';
import { useFieldValidation } from '../../lib/validation';
import { ScanLine } from 'lucide-react';
import { BilingualLabel } from '../BilingualLabel';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import type { Bike, FuelLog } from '../../types';

type LogFuelSheetProps = {
  open: boolean;
  onClose: () => void;
  bike: Bike | undefined;
  editing?: FuelLog;
};

export function LogFuelSheet({ open, onClose, bike, editing }: LogFuelSheetProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'matched'>('idle');

  const [litersInput, setLitersInput] = useState('');
  const [thbInput, setThbInput] = useState('');
  const [odoInput, setOdoInput] = useState('');
  const [stationInput, setStationInput] = useState('');

  const { error: litersError, validate: validateLiters, reset: resetLitersError } =
    useFieldValidation({ parser: 'float', exclusiveMin: 0, message: 'กรอกจำนวนลิตรมากกว่า 0' });
  const { error: thbError, validate: validateThb, reset: resetThbError } =
    useFieldValidation({ parser: 'float', min: 0, message: 'กรอกยอดเงินให้ถูกต้อง' });
  const { error: odoError, validate: validateOdo, reset: resetOdoError } =
    useFieldValidation({ parser: 'int', min: 0, message: 'กรอกเลขไมล์ให้ถูกต้อง' });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setLitersInput(editing.liters.toString());
      setThbInput(editing.thb.toString());
      setOdoInput(editing.odo.toString());
      setStationInput(editing.station);
    } else {
      setOdoInput(bike ? bike.odo.toString() : '');
      setLitersInput('');
      setThbInput('');
      setStationInput('');
    }
    resetLitersError();
    resetThbError();
    resetOdoError();
    setScanState('idle');
  }, [open, editing, bike]);

  if (!bike) return null;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setScanState('scanning');
    try {
      const res = await scanFuelReceipt(file);
      if (res.liters) setLitersInput(res.liters.toString());
      if (res.thb) setThbInput(res.thb.toString());
      if (res.odo && res.odo > bike.odo) setOdoInput(res.odo.toString());
      if (res.station) setStationInput(res.station);

      setScanState('matched');
    } catch (err) {
      showToast('อ่านใบเสร็จไม่ได้ — กรอกเองแทน');
      setScanState('idle');
    }
  };

  const handleSave = async () => {
    const litersOk = validateLiters(litersInput);
    const thbOk = validateThb(thbInput);
    const odoOk = validateOdo(odoInput);
    if (!litersOk || !thbOk || !odoOk) {
      showToast('ตรวจสอบข้อมูลที่กรอกอีกครั้ง');
      return;
    }

    const liters = parseFloat(litersInput);
    const thb = parseFloat(thbInput);
    const odo = parseInt(odoInput, 10);
    const station = stationInput || 'ไม่ระบุปั๊ม';

    if (editing) {
      try {
        await updateFuelLog(bike.id, editing.id, { date: editing.date, station, liters, thb, odo });
      } catch (err) {
        console.error('updateFuelLog failed', err);
        showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
        return;
      }
      onClose();
      showToast('แก้ไขรายการเติมน้ำมันแล้ว');
      return;
    }

    const hasPriorLog = bike.fuelLogs.length > 0;
    const prevOdo = bike.fuelLogs[0]?.odo ?? odo;
    const kmpl = hasPriorLog && odo > prevOdo
      ? Number(consumption(odo, prevOdo, liters).toFixed(1))
      : bike.kmpl;

    try {
      await recordFuelLog(bike.id, { liters, thb, odo, station });
    } catch (err) {
      console.error('recordFuelLog failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    onClose();
    showToast(`บันทึกน้ำมันแล้ว · เลขไมล์ ${odo.toLocaleString()} กม. · ${kmpl} km/L`);
  };

  // Live consumption calculation
  const currentOdo = parseInt(odoInput, 10) || 0;
  const currentLiters = parseFloat(litersInput) || 0;
  const hasPriorFuelLog = bike.fuelLogs.length > 0;
  const prevOdo = bike.fuelLogs[0]?.odo ?? currentOdo;
  let consStr = '—';
  let consColor = 'text-ink-400';

  if (hasPriorFuelLog && currentOdo > prevOdo && currentLiters > 0) {
    const cons = consumption(currentOdo, prevOdo, currentLiters);
    consStr = cons.toFixed(1) + ' km/L';
    consColor = cons >= bike.kmpl ? 'text-good' : 'text-soon';
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
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel
          en={editing ? 'EDIT FUEL LOG' : 'LOG FUEL'}
          thai={editing ? 'แก้ไขการเติมน้ำมัน' : 'เติมน้ำมัน'}
          primaryClassName="text-ink-100 !text-[15px]"
          secondaryClassName="text-ink-400 !text-[11px]"
        />

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
            <FormField
              className="flex-1" label="จำนวนลิตร" labelEn="LITERS" type="number" inputMode="decimal" step="0.01"
              value={litersInput} onChange={setLitersInput} onBlur={() => validateLiters(litersInput)} error={litersError}
            />
            <FormField
              className="flex-1" label="ยอดเงิน (บาท)" labelEn="AMOUNT (THB)" type="number" inputMode="decimal" step="0.01"
              value={thbInput} onChange={setThbInput} onBlur={() => validateThb(thbInput)} error={thbError}
            />
          </div>

          <div className="flex gap-3">
            <FormField
              className="flex-1" label="เลขไมล์ (กม.)" labelEn="ODOMETER" type="number" inputMode="numeric"
              value={odoInput} onChange={setOdoInput} onBlur={() => validateOdo(odoInput)} error={odoError}
            />
            <div className="flex-1 flex flex-col gap-1.5 justify-center">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                อัตราสิ้นเปลือง <span className="opacity-70">· CONSUMPTION</span>
              </label>
              <div className={`font-display font-bold text-[16px] ${consColor}`}>
                {consStr}
              </div>
            </div>
          </div>

          <FormField label="ปั๊มน้ำมัน (ไม่บังคับ)" labelEn="STATION (OPTIONAL)" value={stationInput} onChange={setStationInput} placeholder="เช่น ปตท, เชลล์" />
        </div>

        <PrimaryButton onClick={handleSave} className="w-full mt-2">
          {editing ? 'บันทึกการแก้ไข · SAVE' : 'บันทึกรายการ · SAVE'}
        </PrimaryButton>

        <div className="text-center font-sans text-[10px] text-ink-400 mt-1 mb-2">
          บันทึกในเครื่องนี้เท่านั้น ไม่มีคลาวด์แบ็คอัพ · keep this browser/phone as your record
        </div>
      </div>
    </Sheet>
  );
}
