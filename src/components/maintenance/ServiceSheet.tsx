import { useState, useEffect } from 'react';
import { useBikes } from '../../state/BikeContext';
import { Sheet } from '../Sheet';
import { recordService } from '../../db';
import { useToast } from '../../state/ToastContext';

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
    const odo = parseInt(odoInput) || activeBike.odo;
    const cost = parseInt(costInput) || 0;
    
    await recordService(activeBike.id, {
      partKey: selectedPart,
      odo,
      cost,
      shop: shopInput
    });
    
    closeServiceSheet();
    
    const partLabel = activeBike.parts.find(p => p.key === selectedPart)?.label ?? selectedPart;
    showToast(`${partLabel} logged at ${odo.toLocaleString()} km · counter reset`);
  };

  return (
    <Sheet open={serviceSheet.open} onClose={closeServiceSheet}>
      <div className="p-5 flex flex-col gap-5">
        <h2 className="font-display font-semibold text-[15px] tracking-wide text-ink-100 uppercase">
          RECORD SERVICE
        </h2>
        
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
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
                ODOMETER (KM)
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
                COST (THB)
              </label>
              <input
                type="number"
                value={costInput}
                onChange={e => setCostInput(e.target.value)}
                placeholder="Optional"
                className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
              SHOP / GARAGE
            </label>
            <input
              type="text"
              value={shopInput}
              onChange={e => setShopInput(e.target.value)}
              placeholder="Self-serviced at home"
              className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 mb-2 min-h-[48px] rounded-12 bg-accent text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center active:opacity-80 transition-opacity"
        >
          SAVE & RESET COUNTER
        </button>
      </div>
    </Sheet>
  );
}
