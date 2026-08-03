import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';

type AddBikeStep2BasicsProps = {
  nick: string;
  setNick: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  plate: string;
  setPlate: (v: string) => void;
  odo: string;
  setOdo: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function AddBikeStep2Basics({
  nick, setNick, brand, setBrand, model, setModel, year, setYear, plate, setPlate, odo, setOdo, onBack, onNext,
}: AddBikeStep2BasicsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <FormField label="ชื่อเล่นรถ" value={nick} onChange={setNick} placeholder="เช่น Gray Shadow" />

      <div className="flex gap-3">
        <FormField className="flex-1" label="ยี่ห้อ" value={brand} onChange={setBrand} />
        <FormField className="flex-1" label="รุ่น" value={model} onChange={setModel} />
      </div>

      <div className="flex gap-3">
        <FormField className="flex-1" label="ปี" type="number" value={year} onChange={setYear} />
        <FormField className="flex-1" label="ทะเบียน" value={plate} onChange={setPlate} placeholder="ไม่บังคับ" />
      </div>

      <FormField label="เลขไมล์ (กม.)" type="number" value={odo} onChange={setOdo} />

      <div className="flex gap-2 mt-1">
        <PrimaryButton onClick={onBack} tone="outline" className="flex-1">
          ย้อนกลับ · BACK
        </PrimaryButton>
        <PrimaryButton onClick={onNext} className="flex-1">
          ถัดไป · NEXT
        </PrimaryButton>
      </div>
    </div>
  );
}
