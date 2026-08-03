import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import { PROFILE_META } from '../../lib/profiles';
import type { RidingProfile } from '../../types';

const DRIVE_OPTIONS = ['Chain', 'Belt', 'Shaft'] as const;
const DRIVE_THAI: Record<typeof DRIVE_OPTIONS[number], string> = {
  Chain: 'โซ่',
  Belt: 'สายพาน',
  Shaft: 'เพลา',
};

type AddBikeStep3SpecsProps = {
  kmpl: string;
  setKmpl: (v: string) => void;
  tank: string;
  setTank: (v: string) => void;
  drive: typeof DRIVE_OPTIONS[number];
  setDrive: (v: typeof DRIVE_OPTIONS[number]) => void;
  profile: RidingProfile;
  setProfile: (v: RidingProfile) => void;
  onBack: () => void;
  onSave: () => void;
};

export function AddBikeStep3Specs({
  kmpl, setKmpl, tank, setTank, drive, setDrive, profile, setProfile, onBack, onSave,
}: AddBikeStep3SpecsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-3">
        <FormField className="flex-1" label="อัตราสิ้นเปลือง (กม./ล.)" labelEn="CONSUMPTION (KM/L)" type="number" value={kmpl} onChange={setKmpl} />
        <FormField className="flex-1" label="ถังน้ำมัน (ล.)" labelEn="TANK (L)" type="number" value={tank} onChange={setTank} />
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
