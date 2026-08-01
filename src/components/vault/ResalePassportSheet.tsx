import { useRef, useState } from 'react';
import { FileCheck, Download } from 'lucide-react';
import { Sheet } from '../Sheet';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { shortDate } from '../../lib/format';
import { MOD_CATEGORY_META } from '../../lib/modCategories';
import { exportPassportPdf } from '../../lib/passportPdf';

type ResalePassportSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Verified stats from MotoCare.dc.html lines 1376-1382 (ODOMETER/AVG CONSUMPTION/MAINTENANCE
 * SPEND/MODS INSTALLED + service history). Adds an itemized installed-mods list per the user's
 * decision to expand scope beyond the prototype's aggregate-only mods stat — see Phase 7 plan.
 * No share link/QR (no backend exists anywhere in this app) — the real deliverable is the PDF.
 */
export function ResalePassportSheet({ open, onClose }: ResalePassportSheetProps) {
  const { activeBike } = useBikes();
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  if (!open || !activeBike) return null;

  const maintTotal = activeBike.services.reduce((a, s) => a + s.cost, 0);
  const installedMods = activeBike.mods.filter((m) => m.stage === 'installed');
  const modsTotal = installedMods.reduce((a, m) => a + m.price, 0);

  const stats = [
    { k: 'ODOMETER', v: `${activeBike.odo.toLocaleString()} km`, sub: 'verified by fuel logs' },
    { k: 'AVG CONSUMPTION', v: `${activeBike.kmpl.toFixed(1)} km/L`, sub: 'no sudden drops' },
    { k: 'MAINTENANCE SPEND', v: `฿${maintTotal.toLocaleString()}`, sub: 'all receipts attached' },
    { k: 'MODS INSTALLED', v: `฿${modsTotal.toLocaleString()}`, sub: 'stock parts kept' },
  ];

  const handleExport = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      await exportPassportPdf(contentRef.current, `${activeBike.nick}-resale-passport.pdf`);
      showToast('Vehicle passport PDF ready to share');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        <div ref={contentRef} className="flex flex-col gap-4 bg-app p-4 rounded-16">
          <div>
            <div className="font-display font-semibold text-[9px] tracking-[.2em] text-accent2-light uppercase">
              MOTOCARE VEHICLE PASSPORT
            </div>
            <div className="font-display font-bold text-[17px] text-ink-50 mt-1">
              {activeBike.nick} — {activeBike.brand} {activeBike.model}
            </div>
            <div className="font-sans text-[11px] text-ink-400">
              {activeBike.year} · {activeBike.plate} · {activeBike.odo.toLocaleString()} km
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[rgba(16,185,129,.1)] border border-good/35 rounded-14 p-3">
            <FileCheck size={20} className="text-good shrink-0" />
            <div>
              <div className="font-display font-bold text-[12.5px] text-good">
                {activeBike.services.length} SERVICES VERIFIED
              </div>
              <div className="font-sans text-[9.5px] text-ink-400 mt-0.5">
                Receipts photographed & timestamped · ประวัติครบ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((s) => (
              <div key={s.k} className="bg-surface border border-border rounded-14 p-3">
                <div className="font-display font-semibold text-[8.5px] tracking-[.1em] text-ink-500 uppercase">
                  {s.k}
                </div>
                <div className="font-display font-bold text-[15px] text-ink-50 mt-1 tabular-nums">{s.v}</div>
                <div className="font-sans text-[9px] text-ink-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="font-display font-semibold text-[10px] tracking-[.1em] text-ink-500 uppercase mb-2">
              SERVICE HISTORY
            </div>
            <div className="flex flex-col gap-1.5">
              {activeBike.services.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface border border-border rounded-12 p-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-good shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans font-medium text-[12px] text-ink-100 truncate">{s.what}</div>
                    <div className="font-sans text-[10px] text-ink-400">
                      {shortDate(s.date)} · {s.odo.toLocaleString()} km · {s.shop}
                    </div>
                  </div>
                  <div className="font-display font-semibold text-[11px] text-ink-200 shrink-0">
                    {s.cost ? `฿${s.cost.toLocaleString()}` : 'free'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {installedMods.length > 0 && (
            <div>
              <div className="font-display font-semibold text-[10px] tracking-[.1em] text-ink-500 uppercase mb-2">
                MODS INSTALLED
              </div>
              <div className="flex flex-col gap-1.5">
                {installedMods.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 bg-surface border border-border rounded-12 p-2.5">
                    <div
                      className="font-display font-semibold text-[8px] tracking-[.08em] uppercase px-1.5 py-0.5 rounded-6 shrink-0"
                      style={{ color: MOD_CATEGORY_META[m.cat].fg, backgroundColor: MOD_CATEGORY_META[m.cat].bg }}
                    >
                      {m.cat}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-medium text-[12px] text-ink-100 truncate">{m.name}</div>
                      <div className="font-sans text-[10px] text-ink-400 truncate">{m.meta}</div>
                    </div>
                    <div className="font-display font-semibold text-[11px] text-ink-200 shrink-0">
                      ฿{m.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full min-h-[48px] rounded-12 bg-accent2 text-[#000000] font-display font-bold text-[13px] tracking-[.06em] uppercase flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'GENERATING…' : 'EXPORT PDF PASSPORT'}
        </button>
      </div>
    </Sheet>
  );
}
