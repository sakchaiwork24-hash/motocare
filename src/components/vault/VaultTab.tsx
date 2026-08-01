import { useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';
import { IceCard } from './IceCard';
import { IceFullScreen } from './IceFullScreen';
import { DocumentList } from './DocumentList';
import { DocPreviewSheet } from './DocPreviewSheet';
import { ResalePassportSheet } from './ResalePassportSheet';
import type { DocId } from '../../types';

export function VaultTab() {
  const { activeBike } = useBikes();
  const [iceOpen, setIceOpen] = useState(false);
  const [previewDocId, setPreviewDocId] = useState<DocId | null>(null);
  const [passportOpen, setPassportOpen] = useState(false);

  if (!activeBike) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <IceCard onFullScreen={() => setIceOpen(true)} />
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
            GENERATE RESALE REPORT
          </div>
          <div className="font-sans text-[9.5px] text-ink-400 mt-0.5">
            Vehicle passport · {activeBike.services.length} verified services ready to share
          </div>
        </div>
        <ChevronRight size={16} className="text-accent2-light shrink-0" />
      </button>

      <IceFullScreen open={iceOpen} onClose={() => setIceOpen(false)} />
      <DocPreviewSheet docId={previewDocId} onClose={() => setPreviewDocId(null)} />
      <ResalePassportSheet open={passportOpen} onClose={() => setPassportOpen(false)} />
    </div>
  );
}
