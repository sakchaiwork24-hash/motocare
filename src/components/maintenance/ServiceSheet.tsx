import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Sheet } from '../Sheet';
import { recordService, updateService } from '../../db';
import { useToast } from '../../state/ToastContext';
import { useFieldValidation } from '../../lib/validation';
import { BilingualLabel } from '../BilingualLabel';
import { Chip } from '../Chip';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import type { Bike, Service } from '../../types';

type ServiceSheetProps = {
  open: boolean;
  onClose: () => void;
  bike: Bike | undefined;
  initialPartKey?: string;
  editing?: Service;
};

export function ServiceSheet({ open, onClose, bike, initialPartKey, editing }: ServiceSheetProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [selectedPart, setSelectedPart] = useState<string>('oil');
  const [whatInput, setWhatInput] = useState('');
  const [odoInput, setOdoInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [shopInput, setShopInput] = useState('');
  const [dateInput, setDateInput] = useState(today);
  const [receiptBlob, setReceiptBlob] = useState<Blob | undefined>(undefined);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [compressing, setCompressing] = useState(false);

  const { error: odoError, validate: validateOdo, reset: resetOdoError } = useFieldValidation({
    parser: 'int',
    min: 0,
    message: 'กรอกเลขไมล์ให้ถูกต้อง',
    extra: (n) => (bike && !editing && dateInput === today && n < bike.odo ? `เลขไมล์ต้องไม่น้อยกว่า ${bike.odo.toLocaleString()} กม.` : undefined),
  });
  const { error: costError, validate: validateCost, reset: resetCostError } = useFieldValidation({
    parser: 'int',
    required: false,
    min: 0,
    message: 'ค่าใช้จ่ายต้องไม่ติดลบ',
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setWhatInput(editing.what);
      setOdoInput(editing.odo.toString());
      setCostInput(editing.cost ? editing.cost.toString() : '');
      setShopInput(editing.shop);
      setDateInput(editing.date);
      setReceiptBlob(editing.receiptBlob);
    } else if (initialPartKey) {
      setSelectedPart(initialPartKey);
      setOdoInput(bike ? bike.odo.toString() : '');
      setCostInput('');
      setShopInput('');
      setDateInput(today);
      setReceiptBlob(undefined);
    }
    resetOdoError();
    resetCostError();
  }, [open, editing, initialPartKey, bike]);

  useEffect(() => {
    if (!receiptBlob) {
      setReceiptUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(receiptBlob);
    setReceiptUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptBlob]);

  if (!bike) return null;

  const handlePickReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
      setReceiptBlob(compressed);
    } catch (err) {
      console.error('receipt photo compression failed', err);
      showToast('แนบรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async () => {
    if (compressing) {
      showToast('รอบีบอัดรูปให้เสร็จก่อน');
      return;
    }

    const odoOk = validateOdo(odoInput);
    const costOk = validateCost(costInput);
    if (!odoOk || !costOk) {
      showToast('ตรวจสอบข้อมูลที่กรอกอีกครั้ง');
      return;
    }

    const odo = parseInt(odoInput, 10);
    const cost = costInput ? parseInt(costInput, 10) : 0;

    try {
      if (editing) {
        await updateService(bike.id, editing.id, {
          date: dateInput,
          odo,
          what: whatInput.trim() || editing.what,
          shop: shopInput,
          cost,
          receiptBlob,
        });
      } else {
        await recordService(bike.id, {
          partKey: selectedPart,
          odo,
          cost,
          shop: shopInput,
          receiptBlob,
          date: dateInput,
        });
      }
    } catch (err) {
      console.error('recordService/updateService failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    onClose();

    if (editing) {
      showToast('แก้ไขรายการซ่อมแล้ว');
    } else {
      const partThai = bike.parts.find((p) => p.key === selectedPart)?.thai ?? selectedPart;
      showToast(`บันทึก ${partThai} ที่ ${odo.toLocaleString()} กม. แล้ว · counter reset`);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel
          en={editing ? 'EDIT SERVICE' : 'RECORD SERVICE'}
          thai={editing ? 'แก้ไขการซ่อม' : 'บันทึกการซ่อม'}
          primaryClassName="text-ink-100 !text-[15px]"
          secondaryClassName="text-ink-400 !text-[11px]"
        />

        {editing ? (
          <FormField label="อะไหล่ / รายละเอียด" labelEn="PART / DETAIL" value={whatInput} onChange={setWhatInput} />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {bike.parts.map((p) => (
              <Chip key={p.key} active={p.key === selectedPart} onClick={() => setSelectedPart(p.key)}>
                {p.thai}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex gap-3">
            <FormField
              className="flex-1" label="เลขไมล์ (กม.)" labelEn="ODOMETER" type="number" inputMode="numeric"
              value={odoInput} onChange={setOdoInput} onBlur={() => validateOdo(odoInput)} error={odoError}
            />
            <FormField
              className="flex-1"
              label="ค่าใช้จ่าย (บาท)"
              labelEn="COST (THB)"
              type="number"
              inputMode="numeric"
              value={costInput}
              onChange={setCostInput}
              onBlur={() => validateCost(costInput)}
              error={costError}
              placeholder="ไม่บังคับ"
            />
          </div>

          <div className="flex gap-3">
            <FormField
              className="flex-1" label="วันที่ทำ" labelEn="DATE" type="date" max={today}
              value={dateInput} onChange={setDateInput}
            />
            <FormField className="flex-1" label="ร้าน / อู่" labelEn="SHOP" value={shopInput} onChange={setShopInput} placeholder="ทำเองที่บ้าน" />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-[90px] rounded-14 border border-border bg-sunken overflow-hidden text-left"
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickReceipt} className="hidden" />
            {receiptUrl ? (
              <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-2 text-ink-400">
                <Camera size={18} />
                <span className="font-sans text-[12px]">
                  {compressing ? 'กำลังบีบอัด…' : 'แนบรูปใบเสร็จ (ไม่บังคับ) · ATTACH RECEIPT'}
                </span>
              </div>
            )}
          </button>
        </div>

        <PrimaryButton onClick={handleSave} disabled={compressing} className="w-full mt-2 mb-2">
          {editing ? 'บันทึกการแก้ไข · SAVE' : 'บันทึกและรีเซ็ตระยะ · SAVE'}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
