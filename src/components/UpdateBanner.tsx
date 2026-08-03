import { RefreshCw } from 'lucide-react';

type UpdateBannerProps = {
  needRefresh: boolean;
  applyUpdate: () => void;
};

/** Shown only when a new build has been precached and is ready to take over. */
export function UpdateBanner({ needRefresh, applyUpdate }: UpdateBannerProps) {
  if (!needRefresh) return null;

  return (
    <div className="absolute left-0 right-0 z-40 flex justify-center px-3" style={{ bottom: 78 }}>
      <div className="w-full flex items-center gap-2.5 bg-surface border border-accent/40 rounded-14 shadow-toast px-3 py-2.5">
        <div className="w-8 h-8 rounded-10 bg-[rgba(255,107,0,.13)] flex items-center justify-center shrink-0">
          <RefreshCw size={15} className="text-accent-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[11px] text-ink-100">มีเวอร์ชันใหม่</div>
          <div className="font-sans text-[9.5px] text-ink-400">แตะเพื่อโหลดอัปเดตล่าสุด</div>
        </div>
        <button
          onClick={applyUpdate}
          className="min-h-[36px] px-3 rounded-10 bg-accent font-display font-bold text-[10.5px] tracking-[.04em] text-[#000000] uppercase shrink-0"
        >
          รีเฟรช
        </button>
      </div>
    </div>
  );
}
