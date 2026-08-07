import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt, isIosInstallable } from '../state/installPrompt';
import { useBikeData } from '../state/BikeContext';
import { updateConfig } from '../db';

const RESHOW_COOLDOWN_DAYS = 14;

type InstallBannerProps = {
  /** Suppress this banner even if installable — e.g. while UpdateBanner occupies the same slot. */
  suppressed?: boolean;
};

/** Real PWA installability — renders when the browser has actually fired `beforeinstallprompt`
 * (Android/desktop Chrome/Edge) or, on iOS Safari (which never fires that event — there's no
 * programmatic install API there), shows manual "Share -> Add to Home Screen" instructions
 * instead. Dismissal is persisted in `config`, not just component state, so it survives app
 * relaunch instead of nagging again on every cold start. */
export function InstallBanner({ suppressed }: InstallBannerProps) {
  const { installable, promptInstall } = useInstallPrompt();
  const { config } = useBikeData();
  const iosManualInstall = !installable && isIosInstallable();

  const dismissedAt = config?.installPromptDismissedAt;
  const withinCooldown = dismissedAt
    ? Date.now() - new Date(dismissedAt).getTime() < RESHOW_COOLDOWN_DAYS * 86_400_000
    : false;

  if ((!installable && !iosManualInstall) || withinCooldown || suppressed) return null;

  const dismiss = () => {
    updateConfig({ installPromptDismissedAt: new Date().toISOString() }).catch((err) => {
      console.error('dismiss install banner failed', err);
    });
  };

  return (
    <div className="absolute left-0 right-0 z-40 flex justify-center px-3" style={{ bottom: 78 }}>
      <div className="w-full flex items-center gap-2.5 bg-surface border border-accent/40 rounded-14 shadow-toast px-3 py-2.5">
        <div className="w-8 h-8 rounded-10 bg-[rgba(255,107,0,.13)] flex items-center justify-center shrink-0">
          {iosManualInstall ? <Share size={15} className="text-accent-light" /> : <Download size={15} className="text-accent-light" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[11px] text-ink-100">ติดตั้ง MotoCare</div>
          <div className="font-sans text-[9.5px] text-ink-400">
            {iosManualInstall
              ? 'แตะปุ่ม Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม" · Add to Home Screen'
              : 'เพิ่มลงหน้าจอหลัก ใช้งานออฟไลน์ได้'}
          </div>
        </div>
        {!iosManualInstall && (
          <button
            onClick={promptInstall}
            className="min-h-[36px] px-3 rounded-10 bg-accent font-display font-bold text-[10.5px] tracking-[.04em] text-[#000000] uppercase shrink-0"
          >
            ติดตั้ง
          </button>
        )}
        <button
          onClick={dismiss}
          className="w-9 h-9 flex items-center justify-center text-ink-500 shrink-0"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
