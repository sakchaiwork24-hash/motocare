import { useState, useEffect } from 'react';
import { Sheet } from '../Sheet';
import { upsertMod } from '../../db';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { MOD_CATEGORY_META } from '../../lib/modCategories';
import type { Mod, ModCategory } from '../../types';
import { BilingualLabel } from '../BilingualLabel';

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
    const parsedPrice = price ? Number(price) : 0;
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showToast('กรุณากรอกราคาให้ถูกต้อง');
      return;
    }

    try {
      if (editingMod) {
        const mod: Mod = {
          ...editingMod,
          name,
          cat,
          price: parsedPrice,
          stock,
          trigger: trigger || '',
        };
        await upsertMod(activeBike.id, mod);
        showToast(`อัปเดต ${name} แล้ว`);
      } else {
        const mod: Mod = {
          id: crypto.randomUUID(),
          name,
          cat,
          price: parsedPrice,
          stage: 'wishlist',
          stock,
          trigger: trigger || '',
          meta: 'Saved today',
        };
        await upsertMod(activeBike.id, mod);
        showToast(`เพิ่ม ${name} ลงรายการอยากได้แล้ว`);
      }
    } catch (err) {
      console.error('upsertMod failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className='p-5 flex flex-col gap-5'>
        <BilingualLabel
          en={editingMod ? 'EDIT PART' : 'ADD PART'}
          thai={editingMod ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่'}
          primaryClassName="text-ink-100 !text-[15px]"
          secondaryClassName="text-ink-400 !text-[11px]"
        />

        <div className='flex flex-col gap-1.5'>
          <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>ชื่ออะไหล่</label>
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
                {meta.thai}
              </button>
            );
          })}
        </div>

        <div className='flex gap-3'>
          <div className='flex-1 flex flex-col gap-1.5'>
            <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>ราคา (บาท)</label>
            <input
              type='number'
              value={price}
              onChange={e => setPrice(e.target.value)}
              className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent'
            />
          </div>
          <div className='flex-1 flex flex-col gap-1.5'>
            <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>จุดเก็บอะไหล่เดิม</label>
            <input
              type='text'
              value={stock}
              onChange={e => setStock(e.target.value)}
              className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest'>เงื่อนไขที่ต้องเช็ค (ไม่บังคับ)</label>
          <input
            type='text'
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            placeholder='ไม่บังคับ'
            className='w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500'
          />
        </div>

        <button
          onClick={handleSave}
          className='w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity'
        >
          บันทึกอะไหล่ · SAVE
        </button>
      </div>
    </Sheet>
  );
}
