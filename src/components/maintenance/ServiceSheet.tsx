import { useState, useEffect } from 'react';
import { useBikes } from '../../state/BikeContext';
import { Sheet } from '../Sheet';
import { recordService } from '../../db';
import { useToast } from '../../state/ToastContext';
import { BilingualLabel } from '../BilingualLabel';

export function ServiceSheet() {
  const { activeBike, serviceSheet, closeServiceSheet } = useBikes();
  const { showToast } = useToast();
  
  const [selectedPart, setSelectedPart] = useState<string>('oil');
  const [odoInput, setOdoInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [shopInput, setShopInput] = useState('');

  useEffect(() => {
    if (serviceSheet.open && serviceSheet.partKey) {
      setSelectedPart(serviceSheet.partKey);
      setOdoInput(activeBike ? activeBike.odo.toString() : '');
      setCostInput('');
      setShopInput('');
    }
  }, [serviceSheet.open, serviceSheet.partKey, activeBike]);

  if (!activeBike) return null;

  const handleSave = async () => {
    const odo = parseInt(odoInput, 10);
    const cost = costInput ? parseInt(costInput, 10) : 0;

    if (isNaN(odo)) {
      showToast('กรุณากรอกเลขไมล์ให้ถูกต้อง');
      return;
    }
    if (odo < activeBike.odo) {
      showToast(`เลขไมล์ต้องไม่น้อยกว่า ${activeBike.odo.toLocaleString()} กม.`);
      return;
    }
    if (isNaN(cost) || cost < 0) {
      showToast('ค่าใช้จ่ายต้องไม่ติดลบ');
      return;
    }

    try {
      await recordService(activeBike.id, {
        partKey: selectedPart,
        odo,
        cost,
        shop: shopInput
      });
    } catch (err) {
      console.error('recordService failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }

    closeServiceSheet();
    
    const partThai = activeBike.parts.find(p => p.key === selectedPart)?.thai ?? selectedPart;
    showToast(`บันทึก ${partThai} ที่ ${odo.toLocaleString()} กม. แล้ว · counter reset`);
  };

  return (
    <Sheet open={serviceSheet.open} onClose={closeServiceSheet}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="RECORD SERVICE" thai="บันทึกการซ่อม" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {activeBike.parts.map(p => {
            const isActive = p.key === selectedPart;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedPart(p.key)}
                className={`whitespace-nowrap px-4 min-h-[36px] rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-colors border ${
                  isActive
                    ? 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light'
                    : 'bg-sunken border-border text-ink-400'
                }`}
              >
                {p.thai}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                เลขไมล์ (กม.)
              </label>
              <input
                type="number"
                value={odoInput}
                onChange={e => setOdoInput(e.target.value)}
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ค่าใช้จ่าย (บาท)
              </label>
              <input
                type="number"
                value={costInput}
                onChange={e => setCostInput(e.target.value)}
                placeholder="ไม่บังคับ"
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              ร้าน / อู่
            </label>
            <input
              type="text"
              value={shopInput}
              onChange={e => setShopInput(e.target.value)}
              placeholder="ทำเองที่บ้าน"
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          บันทึกและรีเซ็ตระยะ · SAVE
        </button>
      </div>
    </Sheet>
  );
}
