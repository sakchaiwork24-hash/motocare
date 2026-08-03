import { useEffect, useState } from 'react';
import { Sheet } from '../Sheet';
import { shortDate } from '../../lib/format';
import { BilingualLabel } from '../BilingualLabel';
import type { Service } from '../../types';

type ReceiptViewerSheetProps = {
  service: Service | null;
  onClose: () => void;
};

export function ReceiptViewerSheet({ service, onClose }: ReceiptViewerSheetProps) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!service?.receiptBlob) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(service.receiptBlob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [service?.receiptBlob]);

  if (!service) return null;

  return (
    <Sheet open={!!service} onClose={onClose}>
      <div className="p-5 flex flex-col gap-4">
        <BilingualLabel en="RECEIPT" thai="ใบเสร็จ" primaryClassName="text-ink-100 !text-[15px]" secondaryClassName="text-ink-400 !text-[11px]" />

        {url && (
          <img src={url} alt="Receipt" className="w-full max-h-[420px] rounded-14 border border-border object-contain bg-sunken" />
        )}

        <div className="flex items-center justify-between">
          <div className="font-sans text-[12px] text-ink-300">
            {shortDate(service.date)} · {service.shop} · {service.odo.toLocaleString()} km
          </div>
          <div className="font-display font-bold text-[15px] text-ink-100 shrink-0">
            {service.cost ? `฿${service.cost.toLocaleString()}` : 'ฟรี'}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
