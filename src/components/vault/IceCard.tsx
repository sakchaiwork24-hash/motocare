import { AlertTriangle, Maximize2, Phone } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';

type IceCardProps = {
  onFullScreen: () => void;
};

/** Verified from README "ICE card" + MotoCare.dc.html's ice.* fields (lines 578-618). */
export function IceCard({ onFullScreen }: IceCardProps) {
  const { rider } = useBikes();
  if (!rider) return null;

  return (
    <div className="bg-ice-surface border-[1.5px] border-urgent rounded-20 p-4 shadow-ice">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-9 bg-[rgba(255,241,242,.12)] flex items-center justify-center shrink-0">
            <AlertTriangle size={15} className="text-ice-muted" />
          </div>
          <div>
            <div className="font-display font-bold text-[13px] tracking-[.04em] text-ice-card uppercase">
              ข้อมูลฉุกเฉิน
            </div>
            <div className="font-sans text-[10px] text-ice-muted">ICE · EMERGENCY · แสดงให้กู้ภัย</div>
          </div>
        </div>
        <button
          onClick={onFullScreen}
          className="min-h-[40px] flex items-center gap-1.5 bg-urgent rounded-11 px-3 shrink-0"
        >
          <Maximize2 size={13} className="text-ice-surface" />
          <span className="font-display font-bold text-[10px] tracking-[.08em] text-ice-surface">
            เต็มจอ
          </span>
        </button>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="w-[62px] h-[62px] rounded-16 bg-[rgba(255,241,242,.1)] border border-ice-muted/40 flex flex-col items-center justify-center shrink-0">
          <span className="font-display font-bold text-[24px] leading-none text-ice-card">{rider.blood}</span>
          <span className="font-display font-semibold text-[7.5px] tracking-[.1em] text-ice-muted mt-0.5">กรุ๊ปเลือด</span>
        </div>
        <div className="min-w-0">
          <div className="font-display font-semibold text-[8.5px] tracking-[.12em] text-ice-muted uppercase">
            แพ้ยา · ALLERGIES
          </div>
          <div className="font-sans font-medium text-[12px] text-ice-card mt-1">{rider.allergies}</div>
          <div className="font-sans text-[9.5px] text-ice-muted mt-1">{rider.notes}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        {rider.contacts.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2.5 bg-[rgba(2,6,15,.32)] border border-ice-muted/30 rounded-13 px-2.5 py-2 min-h-[44px]"
          >
            <div className="flex-1 min-w-0">
              <div className="font-sans font-semibold text-[12px] text-ice-card truncate">{c.name}</div>
              <div className="font-sans text-[10px] text-ice-muted truncate">{c.rel} · {c.phone}</div>
            </div>
            <a
              href={c.tel}
              className="min-w-[70px] min-h-[44px] flex items-center justify-center gap-1 bg-urgent rounded-11 px-2 shrink-0"
            >
              <Phone size={13} className="text-ice-surface" />
              <span className="font-display font-bold text-[10px] tracking-[.06em] text-ice-surface">โทร</span>
            </a>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2.5 border-t border-ice-muted/20">
        <div>
          <div className="font-display font-semibold text-[8px] tracking-[.12em] text-ice-muted uppercase">บริษัทประกัน</div>
          <div className="font-sans font-medium text-[10.5px] text-ice-card mt-0.5">{rider.insurer}</div>
        </div>
        <div className="text-right">
          <div className="font-display font-semibold text-[8px] tracking-[.12em] text-ice-muted uppercase">เลขกรมธรรม์</div>
          <div className="font-display font-semibold text-[10.5px] text-ice-card mt-0.5">{rider.policy}</div>
        </div>
      </div>
    </div>
  );
}
