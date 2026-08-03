import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { updatePartProfile } from '../../db';
import { PART_CATALOG } from '../../data/partCatalog';
import type { Part } from '../../types';
import { BilingualLabel } from '../BilingualLabel';

type EditPartProfileSheetProps = {
  part: Part | null;
  onClose: () => void;
};

export function EditPartProfileSheet({ part, onClose }: EditPartProfileSheetProps) {
  const { activeBike } = useBikes();
  const { showToast } = useToast();

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [thaiInput, setThaiInput] = useState('');
  const [intervalInput, setIntervalInput] = useState('');
  const [timeIntervalInput, setTimeIntervalInput] = useState('');

  useEffect(() => {
    if (!part) return;
    setSelectedCatalogId(null);
    setLabelInput(part.label);
    setThaiInput(part.thai);
    setIntervalInput(part.interval.toString());
    setTimeIntervalInput(part.timeIntervalDays ? part.timeIntervalDays.toString() : '');
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
    const timeIntervalDays = timeIntervalInput ? parseInt(timeIntervalInput, 10) : undefined;

    try {
      await updatePartProfile(activeBike.id, part.key, {
        label: labelInput || part.label,
        thai: thaiInput || part.thai,
        interval,
        timeIntervalDays: timeIntervalDays && timeIntervalDays > 0 ? timeIntervalDays : undefined,
      });
    } catch (err) {
      console.error('updatePartProfile failed', err);
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
            <button
              key={c.id}
              onClick={() => applyCatalogEntry(c.id)}
              className={`whitespace-nowrap px-4 min-h-[36px] rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-colors border ${
                selectedCatalogId === c.id
                  ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                  : 'bg-sunken border-border text-ink-400'
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedCatalogId(null)}
            className={`whitespace-nowrap px-4 min-h-[36px] rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-colors border ${
              selectedCatalogId === null
                ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                : 'bg-sunken border-border text-ink-400'
            }`}
          >
            กำหนดเอง
          </button>
        </div>

        {selectedNote && (
          <div className="font-sans text-[11px] text-ink-400 -mt-3">{selectedNote}</div>
        )}

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              ชื่ออะไหล่
            </label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ระยะ (กม.)
              </label>
              <input
                type="number"
                value={intervalInput}
                onChange={(e) => { setIntervalInput(e.target.value); setSelectedCatalogId(null); }}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                วัน (ไม่บังคับ)
              </label>
              <input
                type="number"
                value={timeIntervalInput}
                onChange={(e) => { setTimeIntervalInput(e.target.value); setSelectedCatalogId(null); }}
                placeholder="นับกม.อย่างเดียว"
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          บันทึกกำหนด · SAVE
        </button>
      </div>
    </Sheet>
  );
}
