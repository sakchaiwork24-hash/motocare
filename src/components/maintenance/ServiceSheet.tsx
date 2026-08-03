import { useState, useEffect } from 'react';
import { Sheet } from '../Sheet';
import { recordService } from '../../db';
import { useToast } from '../../state/ToastContext';
import { BilingualLabel } from '../BilingualLabel';
import { Chip } from '../Chip';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import type { Bike } from '../../types';

type ServiceSheetProps = {
  open: boolean;
  onClose: () => void;
  bike: Bike | undefined;
  initialPartKey?: string;
};

export function ServiceSheet({ open, onClose, bike, initialPartKey }: ServiceSheetProps) {
  const { showToast } = useToast();

  const [selectedPart, setSelectedPart] = useState<string>('oil');
  const [odoInput, setOdoInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [shopInput, setShopInput] = useState('');

  useEffect(() => {
    if (open && initialPartKey) {
      setSelectedPart(initialPartKey);
      setOdoInput(bike ? bike.odo.toString() : '');
      setCostInput('');
      setShopInput('');
    }
  }, [open, initialPartKey, bike]);

  if (!bike) return null;

  const handleSave = async () => {
    const odo = parseInt(odoInput, 10);
    const cost = costInput ? parseInt(costInput, 10) : 0;

    if (isNaN(odo)) {
      showToast('กรุณากรอกเลขไมล์ให้ถูกต้อง');
      return;
    }
    if (odo < bike.odo) {
      showToast(`เลขไมล์ต้องไม่น้อยกว่า ${bike.odo.toLocaleString()} กม.`);
      return;
    }
    if (isNaN(cost) || cost < 0) {
      showToast('ค่าใช้จ่ายต้องไม่ติดลบ');
      return;
    }

    try {
      await recordService(bike.id, {
        partKey: selectedPart,
        odo,
        cost,
        shop: shopInput,
      });
    } catch (err) {
      console.error('recordService failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    onClose();

    const partThai = bike.parts.find((p) => p.key === selectedPart)?.thai ?? selectedPart;
    showToast(`บันทึก ${partThai} ที่ ${odo.toLocaleString()} กม. แล้ว · counter reset`);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="RECORD SERVICE" thai="บันทึกการซ่อม" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {bike.parts.map((p) => (
            <Chip key={p.key} active={p.key === selectedPart} onClick={() => setSelectedPart(p.key)}>
              {p.thai}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex gap-3">
            <FormField className="flex-1" label="เลขไมล์ (กม.)" labelEn="ODOMETER" type="number" value={odoInput} onChange={setOdoInput} />
            <FormField
              className="flex-1"
              label="ค่าใช้จ่าย (บาท)"
              labelEn="COST (THB)"
              type="number"
              value={costInput}
              onChange={setCostInput}
              placeholder="ไม่บังคับ"
            />
          </div>

          <FormField label="ร้าน / อู่" labelEn="SHOP" value={shopInput} onChange={setShopInput} placeholder="ทำเองที่บ้าน" />
        </div>

        <PrimaryButton onClick={handleSave} className="w-full mt-2 mb-2">
          บันทึกและรีเซ็ตระยะ · SAVE
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
