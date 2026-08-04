import { useOnlineStatus } from '../../state/connectivity';

/**
 * Shows real internet connectivity only (relevant for fuel-price auto-sync) — this app has no
 * backend, so there is no cloud sync to report. Deliberately does not say "SYNCED"/imply backup.
 */
export function SyncBadge() {
  const online = useOnlineStatus();

  const color = online ? 'text-accent2' : 'text-soon';
  const dotColor = online ? 'bg-accent2' : 'bg-soon';
  const label = online ? 'ONLINE' : 'OFFLINE';
  const sub = 'on this device';

  return (
    <div className="w-[52px] h-[52px] flex flex-col items-center justify-center gap-1 shrink-0 cursor-default select-none">
      <div className={`w-2 h-2 rounded-full ${dotColor} animate-mcBlink`} />
      <span className={`font-display font-semibold text-[8px] tracking-[.08em] ${color}`}>{label}</span>
      <span className="font-sans text-[8.5px] text-ink-400 leading-none">{sub}</span>
    </div>
  );
}
