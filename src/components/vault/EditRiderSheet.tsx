import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Sheet } from '../Sheet';
import { addOrUpdateRider } from '../../db';
import { useBikeData } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { BilingualLabel } from '../BilingualLabel';
import { FormField } from '../FormField';
import { PrimaryButton } from '../PrimaryButton';
import type { RiderContact } from '../../types';

type EditRiderSheetProps = {
  open: boolean;
  onClose: () => void;
};

const emptyContact: RiderContact = { name: '', rel: '', phone: '', tel: '' };

export function EditRiderSheet({ open, onClose }: EditRiderSheetProps) {
  const { rider } = useBikeData();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [blood, setBlood] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [insurer, setInsurer] = useState('');
  const [policy, setPolicy] = useState('');
  const [cls, setCls] = useState('');
  const [hospital, setHospital] = useState('');
  const [contacts, setContacts] = useState<RiderContact[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(rider?.name ?? '');
    setNameTh(rider?.nameTh ?? '');
    setBlood(rider?.blood ?? '');
    setAllergies(rider?.allergies ?? '');
    setNotes(rider?.notes ?? '');
    setInsurer(rider?.insurer ?? '');
    setPolicy(rider?.policy ?? '');
    setCls(rider?.cls ?? '');
    setHospital(rider?.hospital ?? '');
    setContacts(rider?.contacts?.length ? rider.contacts : [{ ...emptyContact }]);
  }, [open, rider]);

  const updateContact = (i: number, patch: Partial<RiderContact>) => {
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const removeContact = (i: number) => {
    setContacts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    const cleanedContacts = contacts
      .map((c) => ({ ...c, phone: c.phone.trim(), tel: c.phone.trim() ? `tel:${c.phone.trim()}` : '' }))
      .filter((c) => c.name.trim() || c.phone.trim());

    try {
      await addOrUpdateRider({
        name: name.trim(), nameTh: nameTh.trim(), blood: blood.trim(), allergies: allergies.trim(),
        notes: notes.trim(), insurer: insurer.trim(), policy: policy.trim(), cls: cls.trim(),
        hospital: hospital.trim(), contacts: cleanedContacts,
      });
    } catch (err) {
      console.error('addOrUpdateRider failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    onClose();
    showToast('บันทึกข้อมูลฉุกเฉินแล้ว');
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        <BilingualLabel
          en="EMERGENCY INFO"
          thai="แก้ไขข้อมูลฉุกเฉิน"
          primaryClassName="text-ink-100 !text-[15px]"
          secondaryClassName="text-ink-400 !text-[11px]"
        />

        <div className="flex flex-col gap-3.5">
          <div className="flex gap-3">
            <FormField className="flex-1" label="ชื่อ (EN)" labelEn="NAME" value={name} onChange={setName} />
            <FormField className="flex-1" label="ชื่อ (TH)" labelEn="NAME TH" value={nameTh} onChange={setNameTh} />
          </div>
          <div className="flex gap-3">
            <FormField className="flex-1" label="กรุ๊ปเลือด" labelEn="BLOOD TYPE" value={blood} onChange={setBlood} placeholder="เช่น O+" />
            <FormField className="flex-1" label="แพ้ยา" labelEn="ALLERGIES" value={allergies} onChange={setAllergies} placeholder="ไม่มี" />
          </div>
          <FormField label="หมายเหตุ" labelEn="NOTES" value={notes} onChange={setNotes} placeholder="โรคประจำตัว ฯลฯ" />
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex gap-3">
            <FormField className="flex-1" label="บริษัทประกัน" labelEn="INSURER" value={insurer} onChange={setInsurer} />
            <FormField className="flex-1" label="เลขกรมธรรม์" labelEn="POLICY NO." value={policy} onChange={setPolicy} />
          </div>
          <div className="flex gap-3">
            <FormField className="flex-1" label="ชั้นประกัน" labelEn="INSURANCE CLASS" value={cls} onChange={setCls} placeholder="เช่น ชั้น 1" />
            <FormField className="flex-1" label="โรงพยาบาล" labelEn="HOSPITAL" value={hospital} onChange={setHospital} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <BilingualLabel en="EMERGENCY CONTACTS" thai="ผู้ติดต่อฉุกเฉิน" primaryClassName="text-ink-100 !text-[12px]" secondaryClassName="text-ink-400 !text-[10px]" />
          {contacts.map((c, i) => (
            <div key={i} className="flex flex-col gap-2 bg-sunken border border-border rounded-14 p-3">
              <div className="flex gap-2">
                <FormField className="flex-1" label="ชื่อ" labelEn="NAME" value={c.name} onChange={(v) => updateContact(i, { name: v })} />
                <FormField className="flex-1" label="ความเกี่ยวข้อง" labelEn="RELATION" value={c.rel} onChange={(v) => updateContact(i, { rel: v })} />
              </div>
              <div className="flex gap-2 items-end">
                <FormField className="flex-1" label="เบอร์โทร" labelEn="PHONE" type="tel" inputMode="tel" value={c.phone} onChange={(v) => updateContact(i, { phone: v })} />
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-surface border border-border rounded-12 text-ink-400 shrink-0"
                  aria-label="ลบผู้ติดต่อ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContacts((prev) => [...prev, { ...emptyContact }])}
            className="min-h-[44px] flex items-center justify-center gap-2 border border-dashed border-border rounded-12 text-ink-400 font-sans text-[12px]"
          >
            <Plus size={15} /> เพิ่มผู้ติดต่อ · ADD CONTACT
          </button>
        </div>

        <PrimaryButton onClick={handleSave} className="w-full mt-1 mb-2">
          บันทึกข้อมูลฉุกเฉิน · SAVE
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
