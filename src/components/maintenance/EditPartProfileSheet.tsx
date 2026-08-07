import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikeData } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { updatePartProfile, updatePartHistory } from '../../db';
import { useFieldValidation } from '../../lib/validation';
import { PART_CATALOG } from '../../data/partCatalog';
import type { Part } from '../../types';
import { BilingualLabel } from '../BilingualLabel';
import { Chip } from '../Chip';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';

type EditPartProfileSheetProps = {
  part: Part | null;
  onClose: () => void;
};

export function EditPartProfileSheet({ part, onClose }: EditPartProfileSheetProps) {
  const { activeBike } = useBikeData();
  const { showToast } = useToast();

  const today = new Date().toISOString().slice(0, 10);

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [thaiInput, setThaiInput] = useState('');
  const [intervalInput, setIntervalInput] = useState('');
  const [timeIntervalInput, setTimeIntervalInput] = useState('');
  const [lastOdoInput, setLastOdoInput] = useState('');
  const [lastDateInput, setLastDateInput] = useState(today);

  const { error: lastOdoError, validate: validateLastOdo, reset: resetLastOdoError } = useFieldValidation({
    parser: 'int',
    min: 0,
    message: 'กรอกเลขไมล์ให้ถูกต้อง',
    extra: (n) => (activeBike && n > activeBike.odo ? `ต้องไม่เกินเลขไมล์ปัจจุบัน ${activeBike.odo.toLocaleString()} กม.` : undefined),
  });

  useEffect(() => {
    if (!part) return;
    setSelectedCatalogId(null);
    setLabelInput(part.label);
    setThaiInput(part.thai);
    setIntervalInput(part.interval.toString());
    setTimeIntervalInput(part.timeIntervalDays ? part.timeIntervalDays.toString() : '');
    setLastOdoInput(part.lastOdo.toString());
    setLastDateInput(part.lastDate);
    resetLastOdoError();
  }, [part]);

  if (!part || !activeBike) return null;

  const catalogOptions = PART_CATALOG.filter((c) => c.partKey === part.key);
  const selectedNote = catalogOptions.find((c) => c.id === selectedCatalogId)?.note;

  const applyCatalogEntry = (id: string) => {
    const entry = catalogOptions.find((c) => c.id === id);
    if (!entry) return;
    setSelectedCatalogId(id);
    setIntervalInput(entry.interval.toString());
    setTimeIntervalInput(entry.timeIntervalDays ? entry.timeIntervalDays.toString() : '');
  };

  const handleSave = async () => {
    const interval = parseInt(intervalInput, 10);
    if (!interval || interval <= 0) {
      showToast('กรุณากรอกระยะ (กม.) ให้ถูกต้อง · Enter a valid interval');
      return;
    }
    if (!validateLastOdo(lastOdoInput)) {
      showToast('ตรวจสอบข้อมูลที่กรอกอีกครั้ง');
      return;
    }
    const timeIntervalDays = timeIntervalInput ? parseInt(timeIntervalInput, 10) : undefined;
    const lastOdo = parseInt(lastOdoInput, 10);

    try {
      await updatePartProfile(activeBike.id, part.key, {
        label: labelInput || part.label,
        thai: thaiInput || part.thai,
        interval,
        timeIntervalDays: timeIntervalDays && timeIntervalDays > 0 ? timeIntervalDays : undefined,
      });
      await updatePartHistory(activeBike.id, part.key, { lastOdo, lastDate: lastDateInput });
    } catch (err) {
      console.error('updatePartProfile/updatePartHistory failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    onClose();
    showToast(`อัปเดตกำหนดของ ${thaiInput || part.thai} แล้ว`);
  };

  return (
    <Sheet open={!!part} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="EDIT SCHEDULE" thai="แก้ไขกำหนดเปลี่ยน" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {catalogOptions.map((c) => (
            <Chip key={c.id} active={selectedCatalogId === c.id} onClick={() => applyCatalogEntry(c.id)}>
              {c.label}
            </Chip>
          ))}
          <Chip active={selectedCatalogId === null} onClick={() => setSelectedCatalogId(null)}>
            กำหนดเอง
          </Chip>
        </div>

        {selectedNote && (
          <div className="font-sans text-[11px] text-ink-400 -mt-3">{selectedNote}</div>
        )}

        <div className="flex flex-col gap-3.5 mt-1">
          <FormField label="ชื่ออะไหล่" labelEn="PART NAME" value={labelInput} onChange={setLabelInput} />

          <div className="flex gap-3">
            <FormField
              className="flex-1"
              label="ระยะ (กม.)"
              labelEn="INTERVAL (KM)"
              type="number"
              value={intervalInput}
              onChange={(v) => { setIntervalInput(v); setSelectedCatalogId(null); }}
            />
            <FormField
              className="flex-1"
              label="วัน (ไม่บังคับ)"
              labelEn="DAYS (OPTIONAL)"
              type="number"
              value={timeIntervalInput}
              onChange={(v) => { setTimeIntervalInput(v); setSelectedCatalogId(null); }}
              placeholder="นับกม.อย่างเดียว"
            />
          </div>

          <div className="flex gap-3">
            <FormField
              className="flex-1"
              label="เลขไมล์ตอนเปลี่ยนล่าสุด"
              labelEn="LAST CHANGED AT (KM)"
              type="number"
              inputMode="numeric"
              value={lastOdoInput}
              onChange={setLastOdoInput}
              onBlur={() => validateLastOdo(lastOdoInput)}
              error={lastOdoError}
            />
            <FormField
              className="flex-1"
              label="วันที่เปลี่ยนล่าสุด"
              labelEn="LAST CHANGED DATE"
              type="date"
              max={today}
              value={lastDateInput}
              onChange={setLastDateInput}
            />
          </div>
        </div>

        <PrimaryButton onClick={handleSave} className="w-full mt-2 mb-2">
          บันทึกกำหนด · SAVE
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
