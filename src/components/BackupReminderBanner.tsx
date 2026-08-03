import { DatabaseBackup, X } from 'lucide-react';
import { useBikes } from '../state/BikeContext';
import { useInstallPrompt } from '../state/installPrompt';
import { updateConfig } from '../db';

const REMIND_AFTER_DAYS = 30;
const SNOOZE_DAYS = 7;

type BackupReminderBannerProps = {
  /** Suppress this banner even if overdue — e.g. while UpdateBanner occupies the same slot. */
  suppressed?: boolean;
  onOpenBackup: () => void;
};

/** Nudges the user to export a backup — the only real protection against data loss in this
 * local-first, no-cloud app. Mirrors InstallBanner's persisted-dismiss pattern so a snooze
 * survives app relaunch, and self-suppresses when the install prompt would show instead
 * (that banner takes priority in the same bottom slot). */
export function BackupReminderBanner({ suppressed, onOpenBackup }: BackupReminderBannerProps) {
  const { config } = useBikes();
  const { installable } = useInstallPrompt();

  if (!config) return null;

  const dismissedAt = config.backupReminderDismissedAt;
  const withinSnooze = dismissedAt
    ? Date.now() - new Date(dismissedAt).getTime() < SNOOZE_DAYS * 86_400_000
    : false;

  const lastBackupAt = config.lastBackupAt;
  const overdue = lastBackupAt
    ? Date.now() - new Date(lastBackupAt).getTime() >= REMIND_AFTER_DAYS * 86_400_000
    : true;

  if (!overdue || withinSnooze || suppressed || installable) return null;

  const dismiss = () => {
    updateConfig({ backupReminderDismissedAt: new Date().toISOString() }).catch((err) => {
      console.error('dismiss backup reminder failed', err);
    });
  };

  return (
    <div className="absolute left-0 right-0 z-40 flex justify-center px-3" style={{ bottom: 78 }}>
      <div className="w-full flex items-center gap-2.5 bg-surface border border-accent/40 rounded-14 shadow-toast px-3 py-2.5">
        <div className="w-8 h-8 rounded-10 bg-[rgba(255,107,0,.13)] flex items-center justify-center shrink-0">
          <DatabaseBackup size={15} className="text-accent-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[11px] text-ink-100">สำรองข้อมูลหน่อยไหม</div>
          <div className="font-sans text-[9.5px] text-ink-400">
            {lastBackupAt ? 'ไม่ได้สำรองข้อมูลมานานแล้ว' : 'ยังไม่เคยสำรองข้อมูลเลย'}
          </div>
        </div>
        <button
          onClick={onOpenBackup}
          className="min-h-[36px] px-3 rounded-10 bg-accent font-display font-bold text-[10.5px] tracking-[.04em] text-[#000000] uppercase shrink-0"
        >
          สำรอง
        </button>
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
