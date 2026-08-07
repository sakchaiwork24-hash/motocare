import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import { PROFILE_META } from '../../lib/profiles';
import type { PartKey, RidingProfile } from '../../types';

const DRIVE_OPTIONS = ['Chain', 'Belt', 'Shaft'] as const;
const DRIVE_THAI: Record<typeof DRIVE_OPTIONS[number], string> = {
  Chain: 'โซ่',
  Belt: 'สายพาน',
  Shaft: 'เพลา',
};

const PART_USED_KM_LABELS: Record<PartKey, string> = {
  oil: 'น้ำมันเครื่อง',
  brake: 'ผ้าเบรก',
  chain: 'โซ่/สายพาน',
  tyre: 'ยาง',
  air: 'ไส้กรองอากาศ',
};

type AddBikeStep3SpecsProps = {
  kmpl: string;
  setKmpl: (v: string) => void;
  tank: string;
  setTank: (v: string) => void;
  kmplError?: string;
  onKmplBlur: () => void;
  tankError?: string;
  onTankBlur: () => void;
  drive: typeof DRIVE_OPTIONS[number];
  setDrive: (v: typeof DRIVE_OPTIONS[number]) => void;
  profile: RidingProfile;
  setProfile: (v: RidingProfile) => void;
  partUsedKm: Record<PartKey, string>;
  setPartUsedKm: (key: PartKey, value: string) => void;
  onBack: () => void;
  onSave: () => void;
};

export function AddBikeStep3Specs({
  kmpl, setKmpl, tank, setTank, kmplError, onKmplBlur, tankError, onTankBlur,
  drive, setDrive, profile, setProfile, partUsedKm, setPartUsedKm, onBack, onSave,
}: AddBikeStep3SpecsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-3">
        <FormField
          className="flex-1" label="อัตราสิ้นเปลือง (กม./ล.)" labelEn="CONSUMPTION (KM/L)" type="number" inputMode="decimal"
          value={kmpl} onChange={setKmpl} onBlur={onKmplBlur} error={kmplError}
        />
        <FormField
          className="flex-1" label="ถังน้ำมัน (ล.)" labelEn="TANK (L)" type="number" inputMode="decimal"
          value={tank} onChange={setTank} onBlur={onTankBlur} error={tankError}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
          ระบบขับเคลื่อน <span className="opacity-70">· DRIVE TYPE</span>
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
          รูปแบบการขับขี่ <span className="opacity-70">· RIDING PROFILE</span>
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

      <div className="flex flex-col gap-2.5">
        <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
          ใช้มาแล้วกี่กม.? (ไม่บังคับ) <span className="opacity-70">· ALREADY USED (KM, OPTIONAL)</span>
        </label>
        <div className="font-sans text-[10.5px] text-ink-400 -mt-1.5">
          กรณีอะไหล่ถูกเปลี่ยน/ใช้มาก่อนเริ่มใช้แอพ ปล่อยว่างไว้ = เพิ่งเปลี่ยนวันนี้
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(PART_USED_KM_LABELS) as PartKey[]).map((key) => (
            <FormField
              key={key}
              label={PART_USED_KM_LABELS[key]}
              type="number"
              inputMode="numeric"
              value={partUsedKm[key]}
              onChange={(v) => setPartUsedKm(key, v)}
              placeholder="0"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <PrimaryButton onClick={onBack} tone="outline" className="flex-1">
          ย้อนกลับ · BACK
        </PrimaryButton>
        <PrimaryButton onClick={onSave} className="flex-1">
          บันทึกรถ · SAVE
        </PrimaryButton>
      </div>
    </div>
  );
}
