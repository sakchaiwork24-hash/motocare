import { Camera, Check } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';
import { healthScore, healthStatus } from '../../lib/wear';
import { useEffect, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { updateBike } from '../../db';
import { useToast } from '../../state/ToastContext';

const STATUS_TEXT_CLASS = { good: 'text-good', soon: 'text-soon', urgent: 'text-urgent' } as const;
const STATUS_DOT_CLASS = { good: 'bg-good', soon: 'bg-soon', urgent: 'bg-urgent' } as const;

export function HeroCard() {
  const { activeBike } = useBikes();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const score = useMemo(() => {
    if (!activeBike) return 0;
    return healthScore(activeBike, activeBike.profile);
  }, [activeBike]);
  const status = healthStatus(score);

  // Object URLs must be created/revoked explicitly — creating one on every render leaks memory.
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!activeBike?.photoBlob) {
      setPhotoUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(activeBike.photoBlob);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [activeBike?.photoBlob]);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file later
    if (!file || !activeBike) return;

    setCompressing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200 });
      await updateBike(activeBike.id, { photoBlob: compressed });
    } catch (err) {
      console.error('cover photo update failed', err);
      showToast('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setCompressing(false);
    }
  };

  if (!activeBike) return null;

  const compressedKb = activeBike.photoBlob ? Math.round(activeBike.photoBlob.size / 1024) : null;

  return (
    <div className="rounded-22 border border-border bg-surface overflow-hidden relative min-h-[44px]">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative h-[176px] w-full block text-left"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />

        {photoUrl ? (
          <img src={photoUrl} alt="Bike cover" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(148,163,184,.14) 0 2px, transparent 2px 8px)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 opacity-60 text-ink-400">
              <Camera size={32} />
              <span className="font-mono text-xs">
                {compressing ? 'กำลังบีบอัด…' : 'แตะเพื่อเพิ่มรูปปกรถ · tap to add cover photo'}
              </span>
            </div>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,23,42,0) 30%, rgba(15,23,42,.86) 72%, #1E293B 100%)',
          }}
        />

        {compressedKb !== null && (
          <div className="absolute top-3 left-3 bg-[rgba(2,6,15,.72)] rounded-lg px-2 py-1 flex items-center gap-1">
            <Check size={12} className="text-good" />
            <span className="font-display font-semibold text-[9.5px] tracking-[.06em] text-ink-50 uppercase">
              บีบอัดแล้ว · {compressedKb} KB
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 bg-[rgba(2,6,15,.72)] rounded-lg px-2 py-1">
          <span className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase">
            {activeBike.year}
          </span>
        </div>

        <div className="absolute bottom-4 left-3 flex flex-col">
          <div className="font-display font-bold text-[22px] leading-[1.05] text-ink-50">
            {activeBike.nick}
          </div>
          <div className="font-sans text-[11px] text-ink-400">
            {activeBike.brand} {activeBike.model} · {activeBike.plate}
          </div>
        </div>
      </button>

      <div className="flex justify-between items-end p-3 pt-0">
        <div>
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-500 uppercase mb-1">
            เลขไมล์ · ODOMETER
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-bold text-[32px] tabular-nums text-ink-50 leading-none">
              {activeBike.odo.toLocaleString()}
            </span>
            <span className="font-display font-bold text-[14px] text-accent">KM</span>
          </div>
        </div>
        <div className="text-right pb-1">
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-500 uppercase mb-1 flex items-center justify-end gap-1">
            สุขภาพ · HEALTH <div className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
          </div>
          <div className={`font-display font-bold text-[24px] ${STATUS_TEXT_CLASS[status]} leading-none tabular-nums`}>
            {score}%
          </div>
        </div>
      </div>
    </div>
  );
}
