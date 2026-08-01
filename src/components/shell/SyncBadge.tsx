import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useOnlineStatus } from '../../state/connectivity';

/** 52x52 tap target, two real states per README: offline (amber, queued count) / online (cyan, synced). */
export function SyncBadge() {
  const online = useOnlineStatus();
  const queued = useLiveQuery(() => db._syncQueue.count(), []) ?? 0;

  const color = online ? 'text-accent2' : 'text-soon';
  const dotColor = online ? 'bg-accent2' : 'bg-soon';
  const label = online ? 'SYNCED' : 'OFFLINE';
  const sub = online ? 'just now' : `${queued} queued`;

  return (
    <div className="w-[52px] h-[52px] flex flex-col items-center justify-center gap-1 shrink-0 cursor-default select-none">
      <div className={`w-2 h-2 rounded-full ${dotColor} animate-mcBlink`} />
      <span className={`font-display font-semibold text-[8px] tracking-[.08em] ${color}`}>{label}</span>
      <span className="font-sans text-[8.5px] text-ink-500 leading-none">{sub}</span>
    </div>
  );
}
