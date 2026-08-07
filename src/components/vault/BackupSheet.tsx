import { useRef, useState } from 'react';
import { Download, Upload, TriangleAlert, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Sheet } from '../Sheet';
import { useToast } from '../../state/ToastContext';
import { useBikeData } from '../../state/BikeContext';
import { exportAllData, importData } from '../../lib/backup';
import { exportBikeHistoryCsv } from '../../lib/csvExport';
import { updateConfig, clearAllData } from '../../db';
import { BilingualLabel } from '../BilingualLabel';
import { PrimaryButton } from '../PrimaryButton';

type BackupSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function BackupSheet({ open, onClose }: BackupSheetProps) {
  const { showToast } = useToast();
  const { activeBike } = useBikeData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportAllData();
      showToast('ส่งออกข้อมูลสำรองแล้ว');
      updateConfig({ lastBackupAt: new Date().toISOString() }).catch((err) => {
        console.error('recording lastBackupAt failed', err);
      });
    } catch (err) {
      console.error('exportAllData failed', err);
      showToast('ส่งออกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const handleExportCsv = () => {
    if (!activeBike) return;
    const hasHistory = activeBike.services.length > 0 || activeBike.fuelLogs.length > 0 || (activeBike.trips?.length ?? 0) > 0;
    if (!hasHistory) {
      showToast('ยังไม่มีประวัติให้ส่งออก');
      return;
    }
    try {
      exportBikeHistoryCsv(activeBike);
      showToast('ส่งออก CSV แล้ว · ประวัติซ่อม/เติมน้ำมัน/ทริป');
    } catch (err) {
      console.error('exportBikeHistoryCsv failed', err);
      showToast('ส่งออก CSV ไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  const handleFactoryReset = async () => {
    if (!window.confirm('ล้างข้อมูลทั้งหมด (รถทุกคัน ประวัติซ่อม เติมน้ำมัน เอกสาร โปรไฟล์ผู้ขับ) ถาวรใช่ไหม? กู้คืนไม่ได้ นอกจากคุณส่งออกไฟล์สำรองไว้ก่อน'))
      return;
    setBusy(true);
    try {
      await clearAllData();
      showToast('ล้างข้อมูลทั้งหมดแล้ว');
      onClose();
    } catch (err) {
      console.error('clearAllData failed', err);
      showToast('ล้างข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const text = await file.text();
      await importData(text);
      showToast('นำเข้าข้อมูลสำเร็จแล้ว');
      onClose();
    } catch (err) {
      console.error('importData failed', err);
      const message = err instanceof Error ? err.message : 'นำเข้าไม่สำเร็จ ลองใหม่อีกครั้ง';
      showToast(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <BilingualLabel en="BACKUP & RESTORE" thai="สำรองและกู้คืนข้อมูล" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        <div className="font-sans text-[11px] text-ink-400 leading-relaxed">
          ข้อมูลทั้งหมดเก็บในเครื่องนี้เท่านั้น ไม่มีคลาวด์แบ็คอัพ — ส่งออกไฟล์เก็บไว้เป็นระยะ
          เพื่อป้องกันข้อมูลหายเมื่อล้างแคชเบราว์เซอร์หรือเปลี่ยนเครื่อง
        </div>

        <PrimaryButton onClick={handleExport} disabled={busy} tone="accent2" icon={<Download size={16} />} className="w-full">
          ส่งออกข้อมูล · EXPORT
        </PrimaryButton>

        <PrimaryButton
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          tone="outline"
          icon={<Upload size={16} />}
          className="w-full"
        >
          นำเข้าข้อมูล · IMPORT
        </PrimaryButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handlePick}
          className="hidden"
        />

        <PrimaryButton onClick={handleExportCsv} disabled={busy || !activeBike} tone="outline" icon={<FileSpreadsheet size={16} />} className="w-full">
          ส่งออกประวัติเป็น CSV · EXPORT CSV
        </PrimaryButton>

        <div className="flex items-start gap-2 bg-[rgba(244,63,94,.1)] border border-urgent/35 rounded-12 p-3">
          <TriangleAlert size={16} className="text-urgent shrink-0 mt-0.5" />
          <div className="font-sans text-[10.5px] text-ink-300 leading-relaxed">
            การนำเข้าจะเขียนทับข้อมูลปัจจุบันทั้งหมด (รถทุกคัน ประวัติซ่อม เติมน้ำมัน เอกสาร)
            ด้วยข้อมูลในไฟล์ที่เลือก
          </div>
        </div>

        <div className="h-px bg-border" />

        <PrimaryButton onClick={handleFactoryReset} disabled={busy} tone="urgent" icon={<Trash2 size={16} />} className="w-full">
          ล้างข้อมูลทั้งหมด · FACTORY RESET
        </PrimaryButton>

        <div className="flex items-start gap-2 bg-[rgba(244,63,94,.1)] border border-urgent/35 rounded-12 p-3">
          <TriangleAlert size={16} className="text-urgent shrink-0 mt-0.5" />
          <div className="font-sans text-[10.5px] text-ink-300 leading-relaxed">
            ลบรถทุกคัน ประวัติทั้งหมด และโปรไฟล์ผู้ขับถาวร ไม่มีการกู้คืน — ส่งออกข้อมูลสำรองไว้ก่อนถ้ายังต้องใช้
          </div>
        </div>
      </div>
    </Sheet>
  );
}
