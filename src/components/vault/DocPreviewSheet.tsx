import { useEffect, useRef, useState } from 'react';
import { FileText, CalendarClock } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { updateDocScan } from '../../db';
import { docCountdown, thaiDate } from '../../lib/wear';
import { docStatus, docDaysLabel } from '../../lib/vaultStatus';
import { buildReminderIcs, downloadIcs } from '../../lib/ics';
import type { DocId } from '../../types';

const STATUS_TEXT = { good: 'text-good', soon: 'text-soon', urgent: 'text-urgent' } as const;
const STATUS_TINT = {
  good: 'bg-[rgba(16,185,129,.09)] border-good/30',
  soon: 'bg-[rgba(245,158,11,.09)] border-soon/40',
  urgent: 'bg-[rgba(244,63,94,.11)] border-urgent/45',
} as const;

type DocPreviewSheetProps = {
  docId: DocId | null;
  onClose: () => void;
};

export function DocPreviewSheet({ docId, onClose }: DocPreviewSheetProps) {
  const { activeBike } = useBikes();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [scanUrl, setScanUrl] = useState<string | undefined>(undefined);

  // Always looked up live from activeBike (not a snapshot passed at open-time) so a scan
  // upload's DB write is reflected immediately while the sheet stays open.
  const doc = activeBike?.docs.find((d) => d.id === docId) ?? null;

  useEffect(() => {
    if (!doc?.scanBlob) {
      setScanUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(doc.scanBlob);
    setScanUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [doc?.scanBlob]);

  if (!doc || !activeBike) return null;

  const days = docCountdown(doc.expiry);
  const status = docStatus(days);
  const compressedKb = doc.scanBlob ? Math.round(doc.scanBlob.size / 1024) : null;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
      await updateDocScan(activeBike.id, doc.id, compressed);
    } catch (err) {
      console.error('updateDocScan failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemind = () => {
    const reminderDate = new Date(doc.expiry);
    reminderDate.setDate(reminderDate.getDate() - 30);
    const ics = buildReminderIcs({
      title: `ต่ออายุ ${doc.thai} (${doc.name})`,
      date: reminderDate.toISOString().slice(0, 10),
    });
    downloadIcs(`${doc.id}-renewal-reminder.ics`, ics);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('บันทึกการแจ้งเตือนแล้ว', { body: `เพิ่มการแจ้งเตือนต่ออายุ ${doc.thai} ในปฏิทินแล้ว` });
    }
    showToast(`ตั้งแจ้งเตือนแล้ว · 30 วันก่อน ${doc.thai} หมดอายุ`);
    onClose();
  };

  return (
    <Sheet open={!!doc} onClose={onClose}>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-bold text-[15px] text-ink-50">{doc.name}</div>
            <div className="font-sans text-[10px] text-ink-400 mt-0.5">{doc.thai} · {doc.issuer}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-[186px] rounded-14 border border-border bg-sunken overflow-hidden text-left"
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
          {scanUrl ? (
            <img src={scanUrl} alt="Document scan" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink-500">
              <FileText size={26} />
              <span className="font-mono text-[9.5px]">
                {compressing ? 'กำลังบีบอัด…' : 'แตะเพื่อเพิ่มสแกนเอกสาร'}
              </span>
            </div>
          )}
          {compressedKb !== null && (
            <div className="absolute bottom-2.5 left-2.5 bg-[rgba(2,6,15,.7)] border border-border rounded-7 px-1.5 py-1">
              <span className="font-mono text-[8.5px] text-ink-400">เก็บในเครื่อง · {compressedKb} KB</span>
            </div>
          )}
        </button>

        <div className={`flex items-center justify-between rounded-14 border p-3 ${STATUS_TINT[status]}`}>
          <div>
            <div className={`font-display font-semibold text-[8.5px] tracking-[.12em] uppercase ${STATUS_TEXT[status]}`}>
              หมดอายุ · EXPIRES
            </div>
            <div className="font-display font-bold text-[14px] text-ink-50 mt-1">{thaiDate(doc.expiry)}</div>
          </div>
          <div className={`font-display font-bold text-[13px] ${STATUS_TEXT[status]}`}>{docDaysLabel(days)}</div>
        </div>

        <button
          onClick={handleRemind}
          className="w-full min-h-[50px] flex items-center justify-center gap-2 bg-[rgba(6,182,212,.1)] border border-accent2/40 rounded-14"
        >
          <CalendarClock size={16} className="text-accent2-light" />
          <span className="font-display font-bold text-[11.5px] tracking-[.08em] text-accent2-light">
            ตั้งแจ้งเตือนต่ออายุ
          </span>
        </button>
      </div>
    </Sheet>
  );
}
