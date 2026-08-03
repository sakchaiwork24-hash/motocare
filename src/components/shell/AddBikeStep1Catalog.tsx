import type { BikeModelCatalogEntry } from '../../data/bikeModelCatalog';
import { PrimaryButton } from '../PrimaryButton';

type AddBikeStep1CatalogProps = {
  catalogBrands: string[];
  catalogBrand: string;
  setCatalogBrand: (v: string) => void;
  catalogModelId: string;
  setCatalogModelId: (v: string) => void;
  catalogModels: BikeModelCatalogEntry[];
  brand: string;
  model: string;
  onApplyCatalogModel: (id: string) => void;
  onNext: () => void;
};

export function AddBikeStep1Catalog({
  catalogBrands,
  catalogBrand,
  setCatalogBrand,
  catalogModelId,
  setCatalogModelId,
  catalogModels,
  brand,
  model,
  onApplyCatalogModel,
  onNext,
}: AddBikeStep1CatalogProps) {
  return (
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
            {catalogBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={catalogModelId}
            onChange={(e) => onApplyCatalogModel(e.target.value)}
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

      <PrimaryButton onClick={onNext} className="w-full">
        {catalogModelId ? 'ถัดไป · NEXT' : 'ข้าม กรอกเอง · SKIP'}
      </PrimaryButton>
    </div>
  );
}
