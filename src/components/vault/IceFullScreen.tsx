import { Phone, X } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';

type IceFullScreenProps = {
  open: boolean;
  onClose: () => void;
};

/** Verified from README "ICE full-screen" + MotoCare.dc.html lines 824-867. Max contrast, safety-critical. */
export function IceFullScreen({ open, onClose }: IceFullScreenProps) {
  const { rider, activeBike } = useBikes();
  if (!open || !rider || !activeBike) return null;

  return (
    <div className="absolute inset-0 z-[80] bg-ice-surface p-5 flex flex-col gap-3.5 overflow-y-auto animate-mcFade">
      <div className="flex items-center justify-between">
        <div className="font-display font-bold text-[12px] tracking-[.2em] text-ice-muted uppercase">
          IN CASE OF EMERGENCY
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center bg-[rgba(255,241,242,.12)] border border-ice-muted/40 rounded-13 text-ice-card"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <div className="font-display font-bold text-[30px] leading-none text-ice-card">{rider.name}</div>
        <div className="font-sans text-[12px] text-ice-muted2 mt-1">{rider.nameTh} · {activeBike.plate}</div>
      </div>

      <div className="flex gap-2.5">
        <div className="flex-1 bg-ice-card rounded-18 p-3.5">
          <div className="font-display font-semibold text-[9px] tracking-[.14em] text-ice-ink uppercase">
            BLOOD TYPE
          </div>
          <div className="font-display font-bold text-[40px] leading-none text-ice-ink mt-1.5">{rider.blood}</div>
        </div>
        <div className="flex-[1.3] bg-[rgba(255,241,242,.1)] border border-ice-muted/40 rounded-18 p-3.5">
          <div className="font-display font-semibold text-[9px] tracking-[.14em] text-ice-muted uppercase">
            ALLERGIES
          </div>
          <div className="font-sans font-semibold text-[14px] text-ice-card mt-1.5 leading-tight">
            {rider.allergies}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rider.contacts.map((c) => (
          <a
            key={c.name}
            href={c.tel}
            className="min-h-[64px] flex items-center gap-3 bg-ice-card rounded-16 px-3.5 py-3 no-underline"
          >
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] text-ice-ink2 truncate">{c.name}</div>
              <div className="font-sans text-[11px] text-ice-ink2/80 truncate">{c.rel} · {c.phone}</div>
            </div>
            <div className="w-12 h-12 rounded-13 bg-urgent flex items-center justify-center shrink-0">
              <Phone size={20} className="text-ice-card" />
            </div>
          </a>
        ))}
      </div>

      <div className="bg-[rgba(255,241,242,.1)] border border-ice-muted/40 rounded-18 p-3.5">
        <div className="flex justify-between gap-2.5">
          <div>
            <div className="font-display font-semibold text-[8.5px] tracking-[.12em] text-ice-muted uppercase">
              INSURANCE
            </div>
            <div className="font-sans font-semibold text-[12px] text-ice-card mt-1">{rider.insurer}</div>
            <div className="font-sans text-[10px] text-ice-muted2">{rider.cls}</div>
          </div>
          <div className="text-right">
            <div className="font-display font-semibold text-[8.5px] tracking-[.12em] text-ice-muted uppercase">
              HOSPITAL
            </div>
            <div className="font-sans font-semibold text-[12px] text-ice-card mt-1">{rider.hospital}</div>
          </div>
        </div>
        <div className="font-display font-semibold text-[11px] text-ice-card mt-2.5 pt-2.5 border-t border-ice-muted/25">
          POLICY {rider.policy}
        </div>
      </div>

      <div className="font-sans text-[9.5px] text-ice-muted text-center mt-1 mb-2">
        Works offline · แสดงหน้านี้ให้เจ้าหน้าที่กู้ภัย 1669
      </div>
    </div>
  );
}
