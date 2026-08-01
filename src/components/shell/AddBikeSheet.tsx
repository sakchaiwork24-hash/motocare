import { useEffect, useMemo, useState } from 'react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { addBike } from '../../db';
import { PROFILE_META } from '../../lib/profiles';
import type { RidingProfile } from '../../types';
import { BIKE_MODEL_CATALOG } from '../../data/bikeModelCatalog';

type AddBikeSheetProps = {
  open: boolean;
  onClose: () => void;
};

const DRIVE_OPTIONS = ['Chain', 'Belt', 'Shaft'] as const;

const CATALOG_BRANDS = Array.from(new Set(BIKE_MODEL_CATALOG.map((e) => e.brand))).sort();

export function AddBikeSheet({ open, onClose }: AddBikeSheetProps) {
  const { config } = useBikes();
  const { showToast } = useToast();

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

  const handleSave = async () => {
    if (!nick.trim() || !brand.trim() || !model.trim() || !odo) {
      showToast('Fill in nickname, brand, model and odometer first');
      return;
    }

    await addBike({
      nick: nick.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year, 10) || new Date().getFullYear(),
      plate: plate.trim(),
      odo: parseInt(odo, 10),
      kmpl: parseFloat(kmpl) || 35,
      tank: parseFloat(tank) || 10,
      drive,
      profile,
    });

    onClose();
    showToast(`${nick.trim()} added to garage`);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        <h2 className="font-display font-semibold text-[15px] tracking-wide text-ink-100 uppercase">
          ADD NEW BIKE
        </h2>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2 p-3 bg-sunken border border-border rounded-12">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              PICK FROM CATALOG (OPTIONAL)
            </label>
            <p className="font-sans text-[11px] text-ink-500">
              Prefills brand/model/year/fuel economy/tank/drive below — Thailand market reference
              data, not guaranteed accurate. Edit anything after picking.
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
                <option value="">Brand…</option>
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
                <option value="">Model…</option>
                {catalogModels.map((e) => (
                  <option key={e.id} value={e.id}>{e.model} ({e.modelYear})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              NICKNAME
            </label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="e.g. Gray Shadow"
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                BRAND
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
                MODEL
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
                YEAR
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
                PLATE
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="Optional"
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              ODOMETER (KM)
            </label>
            <input
              type="number"
              value={odo}
              onChange={(e) => setOdo(e.target.value)}
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                FUEL ECONOMY (KM/L)
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
                TANK SIZE (L)
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
              DRIVE
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
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              RIDING PROFILE
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
                  <div className="font-display font-bold text-[11px] tracking-[.06em] uppercase">{meta.label}</div>
                  <div className="font-sans text-[10px] opacity-80">{meta.thai}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          SAVE BIKE
        </button>
      </div>
    </Sheet>
  );
}
