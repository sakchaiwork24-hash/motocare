import { useEffect, useMemo, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { addBike } from '../../db';
import { PROFILE_META } from '../../lib/profiles';
import type { RidingProfile } from '../../types';
import { BIKE_MODEL_CATALOG } from '../../data/bikeModelCatalog';
import { BilingualLabel } from '../BilingualLabel';

type AddBikeSheetProps = {
  open: boolean;
  onClose: () => void;
};

const DRIVE_OPTIONS = ['Chain', 'Belt', 'Shaft'] as const;
const DRIVE_THAI: Record<typeof DRIVE_OPTIONS[number], string> = {
  Chain: 'โซ่',
  Belt: 'สายพาน',
  Shaft: 'เพลา',
};

const CATALOG_BRANDS = Array.from(new Set(BIKE_MODEL_CATALOG.map((e) => e.brand))).sort();

const TOTAL_STEPS = 3;

export function AddBikeSheet({ open, onClose }: AddBikeSheetProps) {
  const { config } = useBikes();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);

  const [nick, setNick] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [plate, setPlate] = useState('');
  const [odo, setOdo] = useState('');
  const [kmpl, setKmpl] = useState('35');
  const [tank, setTank] = useState('10');
  const [drive, setDrive] = useState<typeof DRIVE_OPTIONS[number]>('Chain');
  const [profile, setProfile] = useState<RidingProfile>('urban');

  const [catalogBrand, setCatalogBrand] = useState('');
  const [catalogModelId, setCatalogModelId] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setNick('');
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear().toString());
    setPlate('');
    setOdo('');
    setKmpl('35');
    setTank('10');
    setDrive('Chain');
    setProfile(config?.defaultProfile ?? 'urban');
    setCatalogBrand('');
    setCatalogModelId('');
  }, [open, config?.defaultProfile]);

  const catalogModels = useMemo(
    () => BIKE_MODEL_CATALOG.filter((e) => e.brand === catalogBrand),
    [catalogBrand]
  );

  if (!open) return null;

  const applyCatalogModel = (id: string) => {
    setCatalogModelId(id);
    const entry = catalogModels.find((e) => e.id === id);
    if (!entry) return;

    setBrand(entry.brand);
    setModel(entry.model);
    setYear(entry.modelYear.toString());
    if (entry.kmpl != null) setKmpl(entry.kmpl.toString());
    if (entry.tankLiters != null) setTank(entry.tankLiters.toString());
    setDrive(entry.drive);
  };

  const goToStep2 = () => setStep(2);

  const goToStep3 = () => {
    if (!nick.trim() || !brand.trim() || !model.trim() || !odo) {
      showToast('กรอกชื่อเล่น ยี่ห้อ รุ่น และเลขไมล์ก่อน');
      return;
    }
    setStep(3);
  };

  const handleSave = async () => {
    const parsedOdo = parseInt(odo, 10);
    const parsedKmpl = parseFloat(kmpl);
    const parsedTank = parseFloat(tank);

    if (isNaN(parsedOdo) || parsedOdo < 0) {
      showToast('กรุณากรอกเลขไมล์ให้ถูกต้อง');
      return;
    }
    if (kmpl && (isNaN(parsedKmpl) || parsedKmpl <= 0)) {
      showToast('กรุณากรอกอัตราสิ้นเปลืองให้ถูกต้อง');
      return;
    }
    if (tank && (isNaN(parsedTank) || parsedTank <= 0)) {
      showToast('กรุณากรอกความจุถังให้ถูกต้อง');
      return;
    }

    try {
      await addBike({
        nick: nick.trim(),
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year, 10) || new Date().getFullYear(),
        plate: plate.trim(),
        odo: parsedOdo,
        kmpl: kmpl ? parsedKmpl : 35,
        tank: tank ? parsedTank : 10,
        drive,
        profile,
      });
    } catch (err) {
      console.error('addBike failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    onClose();
    showToast(`เพิ่ม ${nick.trim()} ลงโรงรถแล้ว`);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <BilingualLabel en="ADD NEW BIKE" thai="เพิ่มรถใหม่" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'w-5 bg-accent' : s < step ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-2 p-3 bg-sunken border border-border rounded-12">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                เลือกจากแคตตาล็อก (ไม่บังคับ)
              </label>
              <p className="font-sans text-[11px] text-ink-500">
                กรอกยี่ห้อ/รุ่น/ปี/อัตราสิ้นเปลือง/ถัง/ระบบขับ ให้อัตโนมัติ — เป็นข้อมูลอ้างอิงตลาดไทย
                ไม่รับประกันความถูกต้อง แก้ไขได้ทีหลัง
              </p>
              <div className="flex gap-2">
                <select
                  value={catalogBrand}
                  onChange={(e) => {
                    setCatalogBrand(e.target.value);
                    setCatalogModelId('');
                  }}
                  className="flex-1 min-w-0 w-0 appearance-none bg-surface border border-border rounded-12 px-3 min-h-[44px] font-sans text-[14px] text-ink-100 outline-none focus:border-accent"
                >
                  <option value="">ยี่ห้อ…</option>
                  {CATALOG_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select
                  value={catalogModelId}
                  onChange={(e) => applyCatalogModel(e.target.value)}
                  disabled={!catalogBrand}
                  className="flex-1 min-w-0 w-0 appearance-none bg-surface border border-border rounded-12 px-3 min-h-[44px] font-sans text-[14px] text-ink-100 outline-none focus:border-accent disabled:opacity-50"
                >
                  <option value="">รุ่น…</option>
                  {catalogModels.map((e) => (
                    <option key={e.id} value={e.id}>{e.model} ({e.modelYear})</option>
                  ))}
                </select>
              </div>
              {catalogModelId && (
                <div className="font-sans text-[11px] text-good mt-1">
                  เลือก {brand} {model} แล้ว — แก้ไขค่าต่างๆ ได้ในขั้นถัดไป
                </div>
              )}
            </div>

            <button
              onClick={goToStep2}
              className="w-full min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
            >
              {catalogModelId ? 'ถัดไป · NEXT' : 'ข้าม กรอกเอง · SKIP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ชื่อเล่นรถ
              </label>
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                placeholder="เช่น Gray Shadow"
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  ยี่ห้อ
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  รุ่น
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  ปี
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  ทะเบียน
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="ไม่บังคับ"
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                เลขไมล์ (กม.)
              </label>
              <input
                type="number"
                value={odo}
                onChange={(e) => setOdo(e.target.value)}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 min-h-[48px] rounded-12 border border-border bg-sunken text-ink-200 font-display font-semibold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
              >
                ย้อนกลับ · BACK
              </button>
              <button
                onClick={goToStep3}
                className="flex-1 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
              >
                ถัดไป · NEXT
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  อัตราสิ้นเปลือง (กม./ล.)
                </label>
                <input
                  type="number"
                  value={kmpl}
                  onChange={(e) => setKmpl(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                  ถังน้ำมัน (ล.)
                </label>
                <input
                  type="number"
                  value={tank}
                  onChange={(e) => setTank(e.target.value)}
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ระบบขับเคลื่อน
              </label>
              <div className="flex gap-2">
                {DRIVE_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDrive(d)}
                    className={`flex-1 min-h-[44px] rounded-12 border font-display font-semibold text-[12px] tracking-[.04em] uppercase transition-colors ${
                      drive === d
                        ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                        : 'bg-sunken border-border text-ink-400'
                    }`}
                  >
                    {DRIVE_THAI[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                รูปแบบการขับขี่
              </label>
              <div className="flex gap-2">
                {(Object.entries(PROFILE_META) as [RidingProfile, typeof PROFILE_META[RidingProfile]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setProfile(key)}
                    className={`flex-1 min-h-[44px] rounded-12 border px-2 py-1 flex flex-col justify-center items-center transition-colors ${
                      profile === key
                        ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                        : 'bg-sunken border-border text-ink-400'
                    }`}
                  >
                    <div className="font-display font-bold text-[11px] tracking-[.06em] uppercase">{meta.thai}</div>
                    <div className="font-sans text-[10px] opacity-80">{meta.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setStep(2)}
                className="flex-1 min-h-[48px] rounded-12 border border-border bg-sunken text-ink-200 font-display font-semibold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
              >
                ย้อนกลับ · BACK
              </button>
              <button
                onClick={handleSave}
                className="flex-1 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
              >
                บันทึกรถ · SAVE
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
