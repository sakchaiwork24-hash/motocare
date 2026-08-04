import { useEffect, useMemo, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { addBike } from '../../db';
import type { RidingProfile } from '../../types';
import { BIKE_MODEL_CATALOG } from '../../data/bikeModelCatalog';
import { BilingualLabel } from '../BilingualLabel';
import { AddBikeStep1Catalog } from './AddBikeStep1Catalog';
import { AddBikeStep2Basics } from './AddBikeStep2Basics';
import { AddBikeStep3Specs } from './AddBikeStep3Specs';

type AddBikeSheetProps = {
  open: boolean;
  onClose: () => void;
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
  const [drive, setDrive] = useState<'Chain' | 'Belt' | 'Shaft'>('Chain');
  const [profile, setProfile] = useState<RidingProfile>('urban');

  const [catalogBrand, setCatalogBrand] = useState('');
  const [catalogModelId, setCatalogModelId] = useState('');

  const [odoError, setOdoError] = useState<string | undefined>();
  const [kmplError, setKmplError] = useState<string | undefined>();
  const [tankError, setTankError] = useState<string | undefined>();

  const validateOdo = (v: string) => {
    const n = parseInt(v, 10);
    const err = isNaN(n) || n < 0 ? 'กรอกเลขไมล์ให้ถูกต้อง' : undefined;
    setOdoError(err);
    return !err;
  };
  const validateKmpl = (v: string) => {
    if (!v) {
      setKmplError(undefined);
      return true;
    }
    const n = parseFloat(v);
    const err = isNaN(n) || n <= 0 ? 'กรอกอัตราสิ้นเปลืองให้ถูกต้อง' : undefined;
    setKmplError(err);
    return !err;
  };
  const validateTank = (v: string) => {
    if (!v) {
      setTankError(undefined);
      return true;
    }
    const n = parseFloat(v);
    const err = isNaN(n) || n <= 0 ? 'กรอกความจุถังให้ถูกต้อง' : undefined;
    setTankError(err);
    return !err;
  };

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
    setOdoError(undefined);
    setKmplError(undefined);
    setTankError(undefined);
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
    const odoOk = validateOdo(odo);
    if (!nick.trim() || !brand.trim() || !model.trim() || !odoOk) {
      showToast('กรอกชื่อเล่น ยี่ห้อ รุ่น และเลขไมล์ให้ถูกต้อง');
      return;
    }
    setStep(3);
  };

  const handleSave = async () => {
    const odoOk = validateOdo(odo);
    const kmplOk = validateKmpl(kmpl);
    const tankOk = validateTank(tank);
    if (!odoOk || !kmplOk || !tankOk) {
      showToast('ตรวจสอบข้อมูลที่กรอกอีกครั้ง');
      return;
    }

    const parsedOdo = parseInt(odo, 10);
    const parsedKmpl = parseFloat(kmpl);
    const parsedTank = parseFloat(tank);

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
          <AddBikeStep1Catalog
            catalogBrands={CATALOG_BRANDS}
            catalogBrand={catalogBrand}
            setCatalogBrand={setCatalogBrand}
            catalogModelId={catalogModelId}
            setCatalogModelId={setCatalogModelId}
            catalogModels={catalogModels}
            brand={brand}
            model={model}
            onApplyCatalogModel={applyCatalogModel}
            onNext={goToStep2}
          />
        )}

        {step === 2 && (
          <AddBikeStep2Basics
            nick={nick}
            setNick={setNick}
            brand={brand}
            setBrand={setBrand}
            model={model}
            setModel={setModel}
            year={year}
            setYear={setYear}
            plate={plate}
            setPlate={setPlate}
            odo={odo}
            setOdo={setOdo}
            odoError={odoError}
            onOdoBlur={() => validateOdo(odo)}
            onBack={() => setStep(1)}
            onNext={goToStep3}
          />
        )}

        {step === 3 && (
          <AddBikeStep3Specs
            kmpl={kmpl}
            setKmpl={setKmpl}
            kmplError={kmplError}
            onKmplBlur={() => validateKmpl(kmpl)}
            tank={tank}
            setTank={setTank}
            tankError={tankError}
            onTankBlur={() => validateTank(tank)}
            drive={drive}
            setDrive={setDrive}
            profile={profile}
            setProfile={setProfile}
            onBack={() => setStep(2)}
            onSave={handleSave}
          />
        )}
      </div>
    </Sheet>
  );
}
