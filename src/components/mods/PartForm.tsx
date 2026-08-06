import { useState, useEffect } from 'react';
import { Sheet } from '../Sheet';
import { upsertMod } from '../../db';
import { useBikeData } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { MOD_CATEGORY_META } from '../../lib/modCategories';
import type { Mod, ModCategory } from '../../types';
import { BilingualLabel } from '../BilingualLabel';
import { Chip } from '../Chip';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';

type Props = {
  open: boolean;
  onClose: () => void;
  editingMod: Mod | null;
};

const CATEGORIES = Object.keys(MOD_CATEGORY_META) as ModCategory[];

export function PartForm({ open, onClose, editingMod }: Props) {
  const { activeBike } = useBikeData();
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
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel
          en={editingMod ? 'EDIT PART' : 'ADD PART'}
          thai={editingMod ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่'}
          primaryClassName="text-ink-100 !text-[15px]"
          secondaryClassName="text-ink-400 !text-[11px]"
        />

        <FormField label="ชื่ออะไหล่" labelEn="PART NAME" value={name} onChange={setName} />

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {CATEGORIES.map((c) => {
            const meta = MOD_CATEGORY_META[c];
            return (
              <Chip key={c} active={c === cat} onClick={() => setCat(c)} activeStyle={{ backgroundColor: meta.bg, borderColor: meta.fg, color: meta.fg }}>
                {meta.thai}
              </Chip>
            );
          })}
        </div>

        <div className="flex gap-3">
          <FormField className="flex-1" label="ราคา (บาท)" labelEn="PRICE (THB)" type="number" value={price} onChange={setPrice} />
          <FormField className="flex-1" label="จุดเก็บอะไหล่เดิม" labelEn="STOCK PART LOCATION" value={stock} onChange={setStock} />
        </div>

        <FormField label="เงื่อนไขที่ต้องเช็ค (ไม่บังคับ)" labelEn="CHECK CONDITION (OPTIONAL)" value={trigger} onChange={setTrigger} placeholder="ไม่บังคับ" />

        <PrimaryButton onClick={handleSave} className="w-full mt-2 mb-2">
          บันทึกอะไหล่ · SAVE
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
