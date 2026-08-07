import { useState } from 'react';
import { AlertTriangle, ChevronRight, FileText, DatabaseBackup } from 'lucide-react';
import { useBikeData, useOverlays } from '../../state/BikeContext';
import { IceCard } from './IceCard';
import { IceFullScreen } from './IceFullScreen';
import { EditRiderSheet } from './EditRiderSheet';
import { DocumentList } from './DocumentList';
import { DocPreviewSheet } from './DocPreviewSheet';
import { ResalePassportSheet } from './ResalePassportSheet';
import type { DocId } from '../../types';

export function VaultTab() {
  const { activeBike, rider } = useBikeData();
  const { openBackupSheet } = useOverlays();
  const [iceOpen, setIceOpen] = useState(false);
  const [riderEditOpen, setRiderEditOpen] = useState(false);
  const [previewDocId, setPreviewDocId] = useState<DocId | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);

  if (!activeBike) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {rider ? (
        <IceCard onFullScreen={() => setIceOpen(true)} onEdit={() => setRiderEditOpen(true)} />
      ) : (
        <button
          onClick={() => setRiderEditOpen(true)}
          className="min-h-[66px] flex items-center gap-3 bg-[rgba(255,79,79,.09)] border border-urgent/35 rounded-18 p-3.5 text-left"
        >
          <div className="w-10 h-10 rounded-12 bg-[rgba(255,79,79,.16)] flex items-center justify-center shrink-0">
            <AlertTriangle size={19} className="text-urgent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[13px] tracking-[.02em] text-urgent">
              เพิ่มข้อมูลฉุกเฉิน
            </div>
            <div className="font-sans text-[9.5px] text-ink-400 mt-0.5">
              ADD EMERGENCY INFO · กรุ๊ปเลือด ผู้ติดต่อฉุกเฉิน แพ้ยา ฯลฯ
            </div>
          </div>
          <ChevronRight size={16} className="text-urgent shrink-0" />
        </button>
      )}
      <DocumentList docs={activeBike.docs} onOpen={setPreviewDocId} />

      <button
        onClick={() => setPassportOpen(true)}
        className="min-h-[66px] flex items-center gap-3 bg-[rgba(6,182,212,.09)] border border-accent2/35 rounded-18 p-3.5 text-left"
      >
        <div className="w-10 h-10 rounded-12 bg-[rgba(6,182,212,.16)] flex items-center justify-center shrink-0">
          <FileText size={19} className="text-accent2-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[13px] tracking-[.02em] text-accent2-lighter">
            สร้างรายงานขายต่อ
          </div>
          <div className="font-sans text-[9.5px] text-ink-400 mt-0.5">
            สมุดพาสปอร์ตรถ · ประวัติซ่อม {activeBike.services.length} ครั้งพร้อมแชร์
          </div>
        </div>
        <ChevronRight size={16} className="text-accent2-light shrink-0" />
      </button>

      <button
        onClick={openBackupSheet}
        className="min-h-[66px] flex items-center gap-3 bg-sunken border border-border rounded-18 p-3.5 text-left"
      >
        <div className="w-10 h-10 rounded-12 bg-surface flex items-center justify-center shrink-0">
          <DatabaseBackup size={19} className="text-ink-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[13px] tracking-[.02em] text-ink-100">
            สำรองและกู้คืนข้อมูล
          </div>
          <div className="font-sans text-[9.5px] text-ink-400 mt-0.5">
            ส่งออก/นำเข้าไฟล์ · ป้องกันข้อมูลหายเมื่อล้างเครื่อง
          </div>
        </div>
        <ChevronRight size={16} className="text-ink-400 shrink-0" />
      </button>

      <IceFullScreen open={iceOpen} onClose={() => setIceOpen(false)} onEdit={() => { setIceOpen(false); setRiderEditOpen(true); }} />
      <EditRiderSheet open={riderEditOpen} onClose={() => setRiderEditOpen(false)} />
      <DocPreviewSheet docId={previewDocId} onClose={() => setPreviewDocId(null)} />
      <ResalePassportSheet open={passportOpen} onClose={() => setPassportOpen(false)} />
    </div>
  );
}
