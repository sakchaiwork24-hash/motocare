import { useState, useEffect } from 'react';
import { Sheet } from '../Sheet';
import { upsertMod } from '../../db';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { MOD_CATEGORY_META } from '../../lib/modCategories';
import type { Mod, ModCategory } from '../../types';

type Props = {
  open: boolean;
  onClose: () => void;
  editingMod: Mod | null;
};

const CATEGORIES = Object.keys(MOD_CATEGORY_META) as ModCategory[];

export function PartForm({ open, onClose, editingMod }: Props) {
  const { activeBike } = useBikes();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [cat, setCat] = useState<ModCategory>('STYLE');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [trigger, setTrigger] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingMod) {
      setName(editingMod.name);
      setCat(editingMod.cat);
      setPrice(editingMod.price.toString());
      setStock(editingMod.stock);
      setTrigger(editingMod.trigger);
    } else {
      setName('');
      setCat('STYLE');
      setPrice('');
      setStock('');
      setTrigger('');
    }
  }, [open, editingMod]);

  if (!activeBike) return null;

  const handleSave = async () => {
    if (editingMod) {
      const mod: Mod = {
        ...editingMod,
        name,
        cat,
        price: Number(price) || 0,
        stock,
        trigger: trigger || '',
      };
      await upsertMod(activeBike.id, mod);
      showToast(`${name} updated`);
    } else {
      const mod: Mod = {
        id: crypto.randomUUID(),
        name,
        cat,
        price: Number(price) || 0,
        stage: 'wishlist',
        stock,
        trigger: trigger || '',
        meta: 'Saved today',
      };
      await upsertMod(activeBike.id, mod);
      showToast(`${name} added to wishlist`);
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className='p-5 flex flex-col gap-5'>
        <h2 className='font-display font-semibold text-[15px] tracking-wide text-ink-100 uppercase'>
          {editingMod ? 'EDIT PART' : 'ADD PART'}
        </h2>

        <div className='flex flex-col gap-1.5'>
          <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>NAME</label>
          <input
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent'
          />
        </div>

        <div className='flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide'>
          {CATEGORIES.map(c => {
            const meta = MOD_CATEGORY_META[c];
            const isActive = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap px-4 min-h-[36px] rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-colors border ${isActive ? '' : 'bg-sunken border-border text-ink-400'}`}
                style={isActive ? { backgroundColor: meta.bg, borderColor: meta.fg, color: meta.fg } : undefined}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className='flex gap-3'>
          <div className='flex-1 flex flex-col gap-1.5'>
            <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>PRICE (THB)</label>
            <input
              type='number'
              value={price}
              onChange={e => setPrice(e.target.value)}
              className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent'
            />
          </div>
          <div className='flex-1 flex flex-col gap-1.5'>
            <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>STOCK PART LOCATION</label>
            <input
              type='text'
              value={stock}
              onChange={e => setStock(e.target.value)}
              className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>MAINTENANCE TRIGGER (OPTIONAL)</label>
          <input
            type='text'
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            placeholder='Optional'
            className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500'
          />
        </div>

        <button
          onClick={handleSave}
          className='w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity'
        >
          SAVE PART
        </button>
      </div>
    </Sheet>
  );
}
